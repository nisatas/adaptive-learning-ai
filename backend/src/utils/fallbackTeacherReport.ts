import { TeacherInsightInput, TeacherInsightReport } from '../types';

/**
 * Rule-based ethical teacher report when Puq.ai is unavailable.
 * Avoids medical/psychological diagnosis language.
 */
export function buildFallbackTeacherReport(
  input: TeacherInsightInput
): TeacherInsightReport {
  const observations: string[] = [];
  const recommendations: string[] = [];

  if (input.skippedCount > 0) {
    observations.push(
      `${input.skippedCount} soru atlanmış; öğrenci bu konularda ek destek gerektirebilir.`
    );
    recommendations.push(
      'Atlanan konular için kısa tekrar ve örnek soru çözümü önerilir.'
    );
  }

  if (input.wrongCount > 0) {
    observations.push(
      `${input.wrongCount} yanlış cevap tespit edildi; kavram pekiştirme faydalı olabilir.`
    );
  }

  if (input.slowQuestionIds && input.slowQuestionIds.length > 0) {
    observations.push(
      'Öğrenci bazı sorularda daha fazla zamana ihtiyaç duymuş olabilir.'
    );
    const topicHint = input.mostDifficultTopic
      ? ` ${input.mostDifficultTopic} konusunda`
      : '';
    recommendations.push(
      `Bir sonraki derste${topicHint} adım adım örnek çözüm ve kısa tekrar önerilir.`
    );
  }

  if (input.hesitationCount && input.hesitationCount > 0) {
    observations.push(
      'Bazı sorularda cevap vermeden önce daha uzun düşünme süresi gözlemlendi.'
    );
    recommendations.push(
      'Sakin tempo ile ilerleyen mini alıştırmalar ve görsel özetler kullanılabilir.'
    );
  }

  if (observations.length === 0) {
    observations.push(
      'Quiz tamamlandı; genel performans dengeli görünüyor.'
    );
    recommendations.push(
      'Öğrenciye bir sonraki konuda kısa pekiştirme aktivitesi verilebilir.'
    );
  }

  const accuracy =
    input.totalQuestions > 0
      ? Math.round((input.correctCount / input.totalQuestions) * 100)
      : 0;

  const summary =
    input.quizTitle
      ? `"${input.quizTitle}" quizi sonucunda öğrenci %${accuracy} doğruluk oranıyla tamamladı. Pedagojik gözlemler aşağıdadır; bu rapor yargılayıcı etiket içermez.`
      : `Öğrenci quiz sonucunda %${accuracy} doğruluk oranıyla tamamladı. Pedagojik gözlemler aşağıdadır; bu rapor yargılayıcı etiket içermez.`;

  return {
    summary,
    observations,
    recommendations,
    generatedBy: 'fallback',
  };
}
