import {
  demoQuiz,
  mockStudentProfiles,
  TOTAL_QUESTIONS,
} from '../data/mockData';
import { getLastQuizResult, saveQuizResult } from '../data/inMemoryStore';
import {
  buildPersonalizationStatus,
  buildSupportSummary,
  computeBehaviorSignals,
  determineAdaptation,
  toPublicBehaviorSignals,
} from './adaptation.service';
import {
  QuizPublic,
  QuizResultResponse,
  QuizSubmissionRequest,
  StoredQuizResult,
} from '../types';
import * as persistenceService from './persistence.service';

const VALID_STUDENT_IDS = new Set(
  mockStudentProfiles.map((s) => s.studentId)
);

export function getDemoQuizPublic(): QuizPublic {
  return {
    quizId: demoQuiz.quizId,
    lesson: demoQuiz.lesson,
    gradeLevel: demoQuiz.gradeLevel,
    topic: demoQuiz.topic,
    totalQuestions: TOTAL_QUESTIONS,
    questions: demoQuiz.questions.map(
      ({ correctOptionId: _correct, ...question }) => question
    ),
  };
}

export function submitDemoQuiz(
  request: QuizSubmissionRequest
): QuizResultResponse {
  validateSubmission(request);

  const questionMap = new Map(
    demoQuiz.questions.map((q) => [q.questionId, q])
  );

  const answerByQuestionId = new Map(
    request.answers.map((a) => [a.questionId, a])
  );

  let correctCount = 0;
  let wrongCount = 0;
  let skippedCount = 0;
  let timeSum = 0;
  let timeCount = 0;
  const topicWrongCount = new Map<string, number>();

  const evaluatedAnswers: Array<{
    questionId: string;
    selectedOptionId?: string;
    isCorrect: boolean;
    isSkipped: boolean;
    timeSpentSeconds: number;
    topic: string;
  }> = [];

  for (const question of demoQuiz.questions) {
    const raw = answerByQuestionId.get(question.questionId);
    const normalized = normalizeAnswer(raw);

    if (normalized.isSkipped) {
      skippedCount++;
      evaluatedAnswers.push({
        questionId: question.questionId,
        selectedOptionId: normalized.selectedOptionId,
        isCorrect: false,
        isSkipped: true,
        timeSpentSeconds: normalized.timeSpentSeconds,
        topic: question.topic,
      });
      continue;
    }

    if (normalized.timeSpentSeconds > 0) {
      timeSum += normalized.timeSpentSeconds;
      timeCount++;
    }

    const isCorrect =
      normalized.selectedOptionId === question.correctOptionId;

    if (isCorrect) {
      correctCount++;
    } else {
      wrongCount++;
      topicWrongCount.set(
        question.topic,
        (topicWrongCount.get(question.topic) ?? 0) + 1
      );
    }

    evaluatedAnswers.push({
      questionId: question.questionId,
      selectedOptionId: normalized.selectedOptionId,
      isCorrect,
      isSkipped: false,
      timeSpentSeconds: normalized.timeSpentSeconds,
      topic: question.topic,
    });
  }

  const averageTimeSeconds =
    timeCount > 0 ? Math.round(timeSum / timeCount) : 0;

  const score = Math.round((correctCount / TOTAL_QUESTIONS) * 100);

  const mostDifficultTopic = resolveMostDifficultTopic(topicWrongCount);

  const behaviorSignalsInternal = computeBehaviorSignals(evaluatedAnswers);

  const adaptation = determineAdaptation(
    score,
    wrongCount,
    averageTimeSeconds,
    behaviorSignalsInternal
  );

  const response: QuizResultResponse = {
    studentId: request.studentId,
    quizId: demoQuiz.quizId,
    lesson: demoQuiz.lesson,
    gradeLevel: demoQuiz.gradeLevel,
    topic: demoQuiz.topic,
    totalQuestions: TOTAL_QUESTIONS,
    score,
    correctCount,
    wrongCount,
    skippedCount,
    averageTimeSeconds,
    mostDifficultTopic,
    studentMessage: adaptation.studentMessage,
    uiSettings: adaptation.uiSettings,
    behaviorSignals: toPublicBehaviorSignals(behaviorSignalsInternal),
  };

  const stored: StoredQuizResult = {
    ...response,
    behaviorSignalsInternal,
    internalProfile: adaptation.internalProfile,
    submittedAt: new Date().toISOString(),
  };

  saveQuizResult(stored);

  void persistenceService.saveQuizSubmission(
    stored,
    evaluatedAnswers.map((answer) => ({
      questionId: answer.questionId,
      selectedOptionId: answer.selectedOptionId,
      isCorrect: answer.isCorrect,
      skipped: answer.isSkipped,
      timeSpentSeconds: answer.timeSpentSeconds,
      topic: answer.topic,
    })),
    getStudentName(request.studentId)
  );

  return response;
}

export function isValidStudent(studentId: string): boolean {
  return VALID_STUDENT_IDS.has(studentId);
}

export function getStudentLastResult(
  studentId: string
): StoredQuizResult | undefined {
  return getLastQuizResult(studentId);
}

export function getStudentName(studentId: string): string {
  return (
    mockStudentProfiles.find((s) => s.studentId === studentId)?.name ??
    'Öğrenci'
  );
}

function normalizeAnswer(
  raw?: {
    selectedOptionId?: string;
    timeSpentSeconds?: number;
    skipped?: boolean;
  }
): {
  isSkipped: boolean;
  selectedOptionId?: string;
  timeSpentSeconds: number;
} {
  if (!raw) {
    return { isSkipped: true, timeSpentSeconds: 0 };
  }

  const timeSpentSeconds =
    typeof raw.timeSpentSeconds === 'number' && raw.timeSpentSeconds >= 0
      ? raw.timeSpentSeconds
      : 0;

  const hasSelection =
    typeof raw.selectedOptionId === 'string' &&
    raw.selectedOptionId.trim().length > 0;

  const isSkipped = raw.skipped === true || !hasSelection;

  return {
    isSkipped,
    selectedOptionId: hasSelection ? raw.selectedOptionId : undefined,
    timeSpentSeconds,
  };
}

function validateSubmission(request: QuizSubmissionRequest): void {
  if (!request.studentId) {
    throw new QuizServiceError('studentId zorunludur.', 400);
  }

  if (!isValidStudent(request.studentId)) {
    throw new QuizServiceError(
      `Bilinmeyen öğrenci kimliği: ${request.studentId}`,
      404
    );
  }

  if (!request.answers || !Array.isArray(request.answers)) {
    throw new QuizServiceError('answers dizisi zorunludur.', 400);
  }

  const expectedIds = new Set(demoQuiz.questions.map((q) => q.questionId));
  const receivedIds = new Set<string>();

  for (const answer of request.answers) {
    if (!answer.questionId) {
      throw new QuizServiceError('Her cevapta questionId zorunludur.', 400);
    }

    if (receivedIds.has(answer.questionId)) {
      throw new QuizServiceError(
        `Tekrarlanan questionId: ${answer.questionId}`,
        400
      );
    }
    receivedIds.add(answer.questionId);

    if (!expectedIds.has(answer.questionId)) {
      throw new QuizServiceError(
        `Bilinmeyen soru kimliği: ${answer.questionId}`,
        400
      );
    }

    if (
      answer.timeSpentSeconds !== undefined &&
      (typeof answer.timeSpentSeconds !== 'number' || answer.timeSpentSeconds < 0)
    ) {
      throw new QuizServiceError(
        'timeSpentSeconds geçerli bir sayı olmalıdır.',
        400
      );
    }
  }
}

function resolveMostDifficultTopic(
  topicWrongCount: Map<string, number>
): string {
  if (topicWrongCount.size === 0) {
    return demoQuiz.questions[0]?.topic ?? demoQuiz.topic;
  }

  let maxTopic = '';
  let maxCount = 0;

  for (const [topic, count] of topicWrongCount) {
    if (count > maxCount) {
      maxCount = count;
      maxTopic = topic;
    }
  }

  return maxTopic;
}

export class QuizServiceError extends Error {
  constructor(
    message: string,
    public statusCode: number
  ) {
    super(message);
    this.name = 'QuizServiceError';
  }
}
