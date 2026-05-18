import {
  CLASS_META,
  TOTAL_QUESTIONS,
  demoQuiz,
  mockStudentProfiles,
} from '../data/mockData';
import { getLastQuizResult, saveQuizResult } from '../data/inMemoryStore';
import {
  BehaviorSignals,
  LearningSignalLevel,
  QuizAnswerSubmission,
  QuizPublic,
  QuizResultResponse,
  QuizSubmissionRequest,
  StoredQuizResult,
} from '../types';
import {
  computeBehaviorSignals,
  determineAdaptation,
  EvaluatedAnswer,
  toPublicBehaviorSignals,
} from './adaptation.service';
import { aiPromptService } from './aiPrompt.service';
import * as persistenceService from './persistence.service';
import { sanitizeAiOutput } from '../utils/sanitizeAiOutput';

const VALID_STUDENT_IDS = new Set(
  mockStudentProfiles.map((s) => s.studentId),
);

export class QuizServiceError extends Error {
  constructor(
    message: string,
    public statusCode: number,
  ) {
    super(message);
    this.name = 'QuizServiceError';
  }
}

export function getDemoQuizPublic(): QuizPublic {
  return {
    quizId: demoQuiz.quizId,
    lesson: demoQuiz.lesson,
    gradeLevel: demoQuiz.gradeLevel,
    topic: demoQuiz.topic,
    totalQuestions: TOTAL_QUESTIONS,
    questions: demoQuiz.questions.map(
      ({ correctOptionId: _correct, ...question }) => question,
    ),
  };
}

export function isValidStudent(studentId: string): boolean {
  return VALID_STUDENT_IDS.has(studentId);
}

export function getStudentLastResult(
  studentId: string,
): StoredQuizResult | undefined {
  return getLastQuizResult(studentId);
}

export function getStudentName(studentId: string): string {
  return (
    mockStudentProfiles.find((s) => s.studentId === studentId)?.name ??
    'Öğrenci'
  );
}

export async function submitDemoQuiz(
  request: QuizSubmissionRequest,
): Promise<QuizResultResponse> {
  validateSubmission(request);

  if (request.quizMeta) {
    return submitTopicQuiz(request);
  }

  return submitFullDemoQuiz(request);
}

async function submitTopicQuiz(
  request: QuizSubmissionRequest,
): Promise<QuizResultResponse> {
  const meta = request.quizMeta!;
  const evaluatedAnswers: EvaluatedAnswer[] = meta.answerDetails.map((a) => ({
    questionId: a.questionId,
    selectedOptionId: '',
    isCorrect: a.isCorrect,
    isSkipped: false,
    timeSpentSeconds: a.timeSpentSeconds,
    topic: a.topic,
  }));

  const behaviorSignalsInternal = computeBehaviorSignals(evaluatedAnswers);
  const timeSum = evaluatedAnswers.reduce(
    (s, a) => s + a.timeSpentSeconds,
    0,
  );
  const averageTimeSeconds =
    evaluatedAnswers.length > 0
      ? Math.round(timeSum / evaluatedAnswers.length)
      : 0;

  const adaptation = determineAdaptation(
    meta.score,
    meta.wrongCount,
    averageTimeSeconds,
    behaviorSignalsInternal,
    meta,
  );

  const topicLabel =
    meta.topicId === 'paragrafta-anlam'
      ? 'Paragrafta Anlam'
      : demoQuiz.topic;

  const response: QuizResultResponse = {
    studentId: request.studentId,
    quizId: `topic-${meta.topicId}`,
    lesson: demoQuiz.lesson,
    gradeLevel: demoQuiz.gradeLevel,
    topic: topicLabel,
    totalQuestions: meta.totalQuestions,
    score: meta.score,
    correctCount: meta.correctCount,
    wrongCount: meta.wrongCount,
    skippedCount: Math.max(
      0,
      meta.totalQuestions - meta.correctCount - meta.wrongCount,
    ),
    averageTimeSeconds,
    mostDifficultTopic: topicLabel,
    studentMessage: adaptation.studentMessage,
    uiSettings: adaptation.uiSettings,
    behaviorSignals: toPublicBehaviorSignals(behaviorSignalsInternal),
    learningMode: adaptation.learningMode,
    learningModeLabel: adaptation.learningModeLabel,
    supportProfile: adaptation.supportProfile,
    recommendation: adaptation.recommendation,
    topicId: meta.topicId,
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
      selectedOptionId: answer.selectedOptionId ?? '',
      isCorrect: answer.isCorrect,
      skipped: answer.isSkipped,
      timeSpentSeconds: answer.timeSpentSeconds,
      topic: answer.topic,
    })),
    getStudentName(request.studentId),
  );

  return response;
}

async function submitFullDemoQuiz(
  request: QuizSubmissionRequest,
): Promise<QuizResultResponse> {
  const answerByQuestionId = new Map(
    request.answers.map((a) => [a.questionId, a]),
  );

  let correctCount = 0;
  let wrongCount = 0;
  let skippedCount = 0;
  let timeSum = 0;
  let timeCount = 0;
  const topicWrongCount = new Map<string, number>();
  const evaluatedAnswers: EvaluatedAnswer[] = [];

  for (const question of demoQuiz.questions) {
    const raw = answerByQuestionId.get(question.questionId);
    const normalized = normalizeAnswer(raw);

    if (normalized.isSkipped) {
      skippedCount += 1;
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
      timeCount += 1;
    }

    const isCorrect =
      normalized.selectedOptionId === question.correctOptionId;

    if (isCorrect) {
      correctCount += 1;
    } else {
      wrongCount += 1;
      topicWrongCount.set(
        question.topic,
        (topicWrongCount.get(question.topic) ?? 0) + 1,
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
    behaviorSignalsInternal,
  );

  const baseBehaviorSignals = toPublicBehaviorSignals(
    behaviorSignalsInternal,
  );

  const [studentMessage, behaviorSignals] = await Promise.all([
    resolveStudentMessage({
      studentId: request.studentId,
      score,
      correctCount,
      wrongCount,
      skippedCount,
      averageTimeSeconds,
      mostDifficultTopic,
      behaviorSignals: behaviorSignalsInternal,
      fallbackMessage: adaptation.studentMessage,
    }),
    enrichBehaviorSignalsWithAi({
      studentId: request.studentId,
      score,
      wrongCount,
      averageTimeSeconds,
      mostDifficultTopic,
      answers: request.answers,
      behaviorSignalsInternal,
      base: baseBehaviorSignals,
    }),
  ]);

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
    studentMessage,
    uiSettings: adaptation.uiSettings,
    behaviorSignals,
    learningMode: adaptation.learningMode,
    learningModeLabel: adaptation.learningModeLabel,
    supportProfile: adaptation.supportProfile,
    recommendation: adaptation.recommendation,
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
      selectedOptionId: answer.selectedOptionId ?? '',
      isCorrect: answer.isCorrect,
      skipped: answer.isSkipped,
      timeSpentSeconds: answer.timeSpentSeconds,
      topic: answer.topic,
    })),
    getStudentName(request.studentId),
  );

  return response;
}

function normalizeAnswer(raw: QuizAnswerSubmission | undefined): {
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
      404,
    );
  }

  if (request.quizMeta) {
    const meta = request.quizMeta;
    if (!meta.topicId) {
      throw new QuizServiceError('quizMeta.topicId zorunludur.', 400);
    }
    if (
      typeof meta.score !== 'number' ||
      typeof meta.totalQuestions !== 'number'
    ) {
      throw new QuizServiceError('quizMeta.score ve totalQuestions zorunludur.', 400);
    }
    return;
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
        400,
      );
    }
    receivedIds.add(answer.questionId);
    if (!expectedIds.has(answer.questionId)) {
      throw new QuizServiceError(
        `Bilinmeyen soru kimliği: ${answer.questionId}`,
        400,
      );
    }
    if (
      answer.timeSpentSeconds !== undefined &&
      (typeof answer.timeSpentSeconds !== 'number' ||
        answer.timeSpentSeconds < 0)
    ) {
      throw new QuizServiceError(
        'timeSpentSeconds geçerli bir sayı olmalıdır.',
        400,
      );
    }
  }
}

async function resolveStudentMessage(options: {
  studentId: string;
  score: number;
  correctCount: number;
  wrongCount: number;
  skippedCount: number;
  averageTimeSeconds: number;
  mostDifficultTopic: string;
  behaviorSignals: BehaviorSignals;
  fallbackMessage: string;
}): Promise<string> {
  const fallbackMessage =
    options.fallbackMessage.trim() ||
    'Kişiselleştirilmiş öğrenme görünümü hazır.';

  try {
    const feedback = await aiPromptService.generateStudentFeedback({
      studentName: getStudentName(options.studentId),
      lesson: demoQuiz.lesson,
      topic: demoQuiz.topic,
      quizScore: options.score,
      classAverage: CLASS_META.classAverage,
      mostDifficultTopic: options.mostDifficultTopic,
      correctCount: options.correctCount,
      wrongCount: options.wrongCount,
      skippedCount: options.skippedCount,
      averageTimeSeconds: options.averageTimeSeconds,
      difficultySignal: deriveDifficultySignal(
        options.score,
        options.wrongCount,
      ),
      attentionSignal: deriveAttentionSignal(options.behaviorSignals),
    });

    const composed = composeStudentMessageFromFeedback(feedback);
    if (!composed) {
      return fallbackMessage;
    }

    const sanitized = sanitizeAiOutput(composed, fallbackMessage);
    return sanitized.text.trim() || fallbackMessage;
  } catch {
    return fallbackMessage;
  }
}

function composeStudentMessageFromFeedback(feedback: {
  studentGreeting: string;
  shortFeedback: string;
  nextStep: string;
  motivationMessage: string;
}): string {
  const greeting = feedback.studentGreeting.trim();
  let shortFeedback = feedback.shortFeedback.trim();
  const nextStep = feedback.nextStep.trim();
  const motivationMessage = feedback.motivationMessage.trim();

  if (greeting && shortFeedback) {
    const greetingName = greeting.replace(/,+$/, '').trim();
    if (
      greetingName &&
      !shortFeedback.toLowerCase().startsWith(greetingName.toLowerCase())
    ) {
      shortFeedback = `${greeting} ${shortFeedback}`;
    }
  }

  return [shortFeedback, nextStep, motivationMessage]
    .filter(Boolean)
    .join(' ');
}

function deriveDifficultySignal(
  score: number,
  wrongCount: number,
): LearningSignalLevel {
  if (score < 60 || wrongCount >= 3) {
    return 'high';
  }
  if (score < 75 || wrongCount >= 2) {
    return 'medium';
  }
  return 'low';
}

function deriveAttentionSignal(
  signals: BehaviorSignals,
): LearningSignalLevel {
  if (signals.longHesitations >= 3 || signals.fastWrongAnswers >= 2) {
    return 'high';
  }
  if (signals.longHesitations >= 1 || signals.fastWrongAnswers >= 1) {
    return 'medium';
  }
  return 'low';
}

function safeMetric(value: unknown): number {
  const n = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(n) || n < 0) {
    return 0;
  }
  return Math.round(n);
}

function extractInteractionMetrics(
  answers: QuizAnswerSubmission[],
  _behavior: BehaviorSignals,
) {
  let answerChangeCount = 0;
  let idleTimeMs = 0;
  let mouseMovementCount = 0;
  let mouseDirectionChanges = 0;
  let focusLostCount = 0;
  let optionHoverCount = 0;

  for (const answer of answers) {
    const raw = answer as QuizAnswerSubmission & {
      answerChangeCount?: number;
      idleTimeMs?: number;
      mouseMovementCount?: number;
      mouseDirectionChanges?: number;
      focusLostCount?: number;
      optionHoverCount?: number;
    };
    answerChangeCount += safeMetric(raw.answerChangeCount);
    idleTimeMs += safeMetric(raw.idleTimeMs);
    mouseMovementCount += safeMetric(raw.mouseMovementCount);
    mouseDirectionChanges += safeMetric(raw.mouseDirectionChanges);
    focusLostCount += safeMetric(raw.focusLostCount);
    optionHoverCount += safeMetric(raw.optionHoverCount);
  }

  return {
    answerChangeCount,
    idleTimeMs,
    mouseMovementCount,
    mouseDirectionChanges,
    focusLostCount,
    optionHoverCount,
  };
}

function deriveMouseMovementLevel(
  mouseMovementCount: number,
  mouseDirectionChanges: number,
): LearningSignalLevel | undefined {
  const activity = mouseMovementCount + mouseDirectionChanges;
  if (activity <= 0) {
    return undefined;
  }
  if (activity >= 80) {
    return 'high';
  }
  if (activity >= 25) {
    return 'medium';
  }
  return 'low';
}

function buildQuizBehaviorPromptInput(options: {
  studentId: string;
  score: number;
  wrongCount: number;
  averageTimeSeconds: number;
  answers: QuizAnswerSubmission[];
  behaviorSignalsInternal: BehaviorSignals;
}) {
  const interaction = extractInteractionMetrics(
    options.answers,
    options.behaviorSignalsInternal,
  );
  const difficultySignal = deriveDifficultySignal(
    options.score,
    options.wrongCount,
  );
  const attentionSignal = deriveAttentionSignal(
    options.behaviorSignalsInternal,
  );

  return {
    studentId: options.studentId,
    studentName: getStudentName(options.studentId),
    lesson: demoQuiz.lesson,
    topic: demoQuiz.topic,
    quizScore: options.score,
    averageTimeSeconds: options.averageTimeSeconds,
    answerChangeCount: interaction.answerChangeCount,
    idleTimeMs: interaction.idleTimeMs,
    mouseMovementCount: interaction.mouseMovementCount,
    mouseDirectionChanges: interaction.mouseDirectionChanges,
    focusLostCount: interaction.focusLostCount,
    optionHoverCount: interaction.optionHoverCount,
    difficultySignal,
    attentionSignal,
    skippedQuestions: options.behaviorSignalsInternal.skippedQuestions,
    longHesitations: options.behaviorSignalsInternal.longHesitations,
    mouseMovementLevel: deriveMouseMovementLevel(
      interaction.mouseMovementCount,
      interaction.mouseDirectionChanges,
    ),
  };
}

function applyQuizBehaviorAnalysis(
  base: ReturnType<typeof toPublicBehaviorSignals>,
  analysis: {
    interactionSummary: string;
    safeInterpretation: string;
    behaviorNotes: string[];
    attentionSignal?: string;
    engagementSignal?: string;
    confidenceSignal?: string;
    confidence?: string;
  },
) {
  const fallbackSummary =
    'Quiz sonuçları değerlendirildi. Öğrenme deneyimi buna göre güncellendi.';
  const interactionSummary = sanitizeAiOutput(
    analysis.interactionSummary.trim() || fallbackSummary,
    fallbackSummary,
  ).text;
  const safeInterpretation = sanitizeAiOutput(
    analysis.safeInterpretation.trim() ||
      'Bu yorum yalnızca quiz etkileşim verilerine dayalı sınırlı bir öğrenme sinyalidir.',
    'Adım adım çözüm desteği faydalı olabilir.',
  ).text;
  const behaviorNotes = analysis.behaviorNotes
    .map((note) => sanitizeAiOutput(note, '').text)
    .filter((note) => note.length > 0)
    .slice(0, 4);

  return {
    ...base,
    interactionSummary,
    safeInterpretation,
    behaviorNotes:
      behaviorNotes.length > 0
        ? behaviorNotes
        : [
            'Cevap süresi ve etkileşim verileri öğrenme süreci desteği için kullanıldı.',
          ],
    attentionSignal: toLearningSignalLevel(analysis.attentionSignal),
    engagementSignal: toLearningSignalLevel(analysis.engagementSignal),
    confidenceSignal: toLearningSignalLevel(analysis.confidenceSignal),
    analysisConfidence: toLearningSignalLevel(analysis.confidence),
  };
}

function toLearningSignalLevel(
  value: string | undefined,
): LearningSignalLevel {
  if (value === 'low' || value === 'medium' || value === 'high') {
    return value;
  }
  return 'low';
}

async function enrichBehaviorSignalsWithAi(options: {
  studentId: string;
  score: number;
  wrongCount: number;
  averageTimeSeconds: number;
  mostDifficultTopic: string;
  answers: QuizAnswerSubmission[];
  behaviorSignalsInternal: BehaviorSignals;
  base: ReturnType<typeof toPublicBehaviorSignals>;
}) {
  try {
    const analysis =
      await aiPromptService.generateQuizBehaviorAnalysis(
        buildQuizBehaviorPromptInput(options),
      );
    return applyQuizBehaviorAnalysis(options.base, analysis);
  } catch {
    return options.base;
  }
}

function resolveMostDifficultTopic(
  topicWrongCount: Map<string, number>,
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
