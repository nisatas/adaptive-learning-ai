import { demoQuiz, mockStudentProfiles, TOTAL_QUESTIONS } from '../data/mockData';
import { puqAiService } from './puqAi.service';
import { getStudentLastResult, getStudentName } from './quiz.service';
import {
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
  const insightInput: TeacherInsightInput = {
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

  const insight = await puqAiService.generateTeacherInsightReport(insightInput);

  const behaviorObservation =
    insight.observations[0] ??
    'Öğrenci quiz sürecinde farklı tempolarda ilerlemiş olabilir.';

  const systemRecommendation =
    insight.recommendations[0] ??
    'Bir sonraki derste kısa tekrar ve örnek çözüm önerilir.';

  return {
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
    behaviorObservation,
    systemRecommendation,
    aiTeacherNote: formatAiTeacherNote(insight),
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

  return {
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
    aiTeacherNote:
      `${formatAiTeacherNote(insight)} (Varsayılan demo raporu — canlı submit sonrası güncellenir.)`,
    reportSource: 'default',
  };
}

function formatAiTeacherNote(insight: {
  summary: string;
  observations: string[];
  recommendations: string[];
}): string {
  const parts = [insight.summary];

  if (insight.observations.length > 1) {
    parts.push(insight.observations.slice(1).join(' '));
  }

  if (insight.recommendations.length > 1) {
    parts.push(insight.recommendations.slice(1).join(' '));
  }

  return parts.filter(Boolean).join(' ');
}
