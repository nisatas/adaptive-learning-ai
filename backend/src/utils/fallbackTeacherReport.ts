import { TeacherInsightInput, TeacherInsightReport } from '../types';
import {
  buildBehaviorObservation,
  buildSystemRecommendation,
} from './teacherReportLanguage';

/**
 * Rule-based ethical teacher report when Puq.ai is unavailable.
 * Uses observable quiz metrics only.
 */
export function buildFallbackTeacherReport(
  input: TeacherInsightInput
): TeacherInsightReport {
  const behaviorObservation = buildBehaviorObservation(input);
  const systemRecommendation = buildSystemRecommendation(input);

  const observations: string[] = [behaviorObservation];

  if (input.hesitationCount && input.hesitationCount > 0) {
    observations.push(
      `${input.hesitationCount} soruda cevap vermeden önce daha uzun süre harcanmıştır.`
    );
  }

  const accuracy =
    input.totalQuestions > 0
      ? Math.round((input.correctCount / input.totalQuestions) * 100)
      : 0;

  const summary =
    input.quizTitle
      ? `"${input.quizTitle}" quizi tamamlandı: ${input.correctCount} doğru, ${input.wrongCount} yanlış, ${input.skippedCount} boş (${accuracy}% doğruluk).`
      : `Quiz tamamlandı: ${input.correctCount} doğru, ${input.wrongCount} yanlış, ${input.skippedCount} boş (${accuracy}% doğruluk).`;

  return {
    summary,
    observations,
    recommendations: [systemRecommendation],
    generatedBy: 'fallback',
  };
}
