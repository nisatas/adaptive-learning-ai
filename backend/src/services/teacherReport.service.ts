import { demoQuiz, mockStudentProfiles, TOTAL_QUESTIONS } from '../data/mockData';
import { formatInsightAsText, puqAiService } from './puqAi.service';
import { getStudentLastResult, getStudentName } from './quiz.service';
import {
  AiMetadata,
  StoredQuizResult,
  TeacherInsightInput,
  TeacherReport,
} from '../types';

export async function buildTeacherReport(
  studentId: string
): Promise<TeacherReport> {
  const live = getStudentLastResult(studentId);

  if (live) {
    return buildLiveTeacherReport(live);
  }

  return buildDefaultTeacherReport(studentId);
}

async function buildLiveTeacherReport(
  result: StoredQuizResult
): Promise<TeacherReport> {
  const insightInput = buildInsightInputFromResult(result);
  const insight = await puqAiService.generateTeacherInsightReport(insightInput);

  return {
    ...mapAiMetadata(insight),
    studentId: result.studentId,
    studentName: getStudentName(result.studentId),
    lesson: result.lesson,
    gradeLevel: result.gradeLevel,
    topic: result.topic,
    score: result.score,
    totalQuestions: result.totalQuestions,
    correctCount: result.correctCount,
    wrongCount: result.wrongCount,
    skippedCount: result.skippedCount,
    averageTimeSeconds: result.averageTimeSeconds,
    mostDifficultTopic: result.mostDifficultTopic,
    behaviorObservation:
      insight.observations[0] ??
      'Öğrenci quiz sürecinde farklı tempolarda ilerlemiş olabilir.',
    systemRecommendation:
      insight.recommendations[0] ??
      'Bir sonraki derste kısa tekrar ve örnek çözüm önerilir.',
    aiTeacherNote: insight.text,
    reportSource: 'live',
  };
}

async function buildDefaultTeacherReport(
  studentId: string
): Promise<TeacherReport> {
  const profile = mockStudentProfiles.find((s) => s.studentId === studentId);
  const studentName = profile?.name ?? getStudentName(studentId);

  const correctCount = profile
    ? Math.round((profile.score / 100) * TOTAL_QUESTIONS)
    : 0;
  const wrongCount = profile
    ? Math.max(0, TOTAL_QUESTIONS - correctCount)
    : 0;

  const insightInput: TeacherInsightInput = {
    quizTitle: `${demoQuiz.lesson} - ${demoQuiz.topic}`,
    totalQuestions: TOTAL_QUESTIONS,
    correctCount,
    wrongCount,
    skippedCount: 0,
    averageAnswerTimeMs: (profile?.averageTimeSeconds ?? 0) * 1000,
    mostDifficultTopic: profile?.mostDifficultTopic ?? 'Yazım kuralları',
  };

  const insight = await puqAiService.generateTeacherInsightReport(insightInput);

  const demoNoteSuffix =
    insight.aiStatus === 'missing_config' || insight.fallbackUsed
      ? ' (Varsayılan demo raporu — canlı submit sonrası güncellenir.)'
      : '';

  return {
    ...mapAiMetadata(insight),
    studentId,
    studentName,
    lesson: demoQuiz.lesson,
    gradeLevel: demoQuiz.gradeLevel,
    topic: demoQuiz.topic,
    score: profile?.score ?? 0,
    totalQuestions: TOTAL_QUESTIONS,
    correctCount,
    wrongCount,
    skippedCount: 0,
    averageTimeSeconds: profile?.averageTimeSeconds ?? 0,
    mostDifficultTopic: profile?.mostDifficultTopic ?? 'Yazım kuralları',
    behaviorObservation:
      insight.observations[0] ??
      'Henüz canlı quiz gönderimi yapılmadı; örnek pedagojik gözlem gösterilmektedir.',
    systemRecommendation:
      insight.recommendations[0] ??
      'Öğrenci quiz tamamladığında güncel öneriler burada görünecektir.',
    aiTeacherNote: `${insight.text}${demoNoteSuffix}`,
    reportSource: 'default',
  };
}

export function buildInsightInputFromTestRequest(body: {
  lesson: string;
  gradeLevel: number;
  topic: string;
  score: number;
  totalQuestions: number;
  correctCount: number;
  wrongCount: number;
  skippedCount: number;
  averageTimeSeconds: number;
  mostDifficultTopic: string;
  studentName?: string;
  behaviorSignals?: {
    longHesitations?: number;
  };
}): TeacherInsightInput {
  return {
    quizTitle: `${body.lesson} - ${body.topic}`,
    totalQuestions: body.totalQuestions,
    correctCount: body.correctCount,
    wrongCount: body.wrongCount,
    skippedCount: body.skippedCount,
    averageAnswerTimeMs: body.averageTimeSeconds * 1000,
    mostDifficultTopic: body.mostDifficultTopic,
    hesitationCount: body.behaviorSignals?.longHesitations,
  };
}

function buildInsightInputFromResult(result: StoredQuizResult): TeacherInsightInput {
  return {
    quizTitle: `${result.lesson} - ${result.topic}`,
    totalQuestions: result.totalQuestions,
    correctCount: result.correctCount,
    wrongCount: result.wrongCount,
    skippedCount: result.skippedCount,
    averageAnswerTimeMs: result.averageTimeSeconds * 1000,
    slowQuestionIds: result.behaviorSignalsInternal.slowQuestionIds,
    hesitationCount: result.behaviorSignalsInternal.hesitationCount,
    mostDifficultTopic: result.mostDifficultTopic,
  };
}

function mapAiMetadata(insight: {
  aiProvider: 'Puq.ai';
  aiUsed: boolean;
  fallbackUsed: boolean;
  aiStatus: AiMetadata['aiStatus'];
  generatedAt: string;
}): AiMetadata {
  return {
    aiProvider: insight.aiProvider,
    aiUsed: insight.aiUsed,
    fallbackUsed: insight.fallbackUsed,
    aiStatus: insight.aiStatus,
    generatedAt: insight.generatedAt,
  };
}

export function formatAiTeacherNoteFromInsight(insight: {
  summary: string;
  observations: string[];
  recommendations: string[];
}): string {
  return formatInsightAsText(insight);
}
