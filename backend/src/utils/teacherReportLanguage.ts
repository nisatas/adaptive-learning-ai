import { StoredQuizResult, TeacherInsightInput } from '../types';

export {
  TEACHER_INSIGHT_SYSTEM_PROMPT,
  TEACHER_REPORT_SYSTEM_PROMPT,
  buildTeacherInsightUserPrompt,
} from '../prompts/teacherInsight.prompt';

type ReportMetrics = {
  totalQuestions: number;
  correctCount: number;
  wrongCount: number;
  skippedCount: number;
  averageTimeSeconds?: number;
  averageAnswerTimeMs?: number;
  mostDifficultTopic?: string;
};

function toMetrics(
  source: StoredQuizResult | TeacherInsightInput
): ReportMetrics {
  if ('totalQuestions' in source && 'averageTimeSeconds' in source) {
    return {
      totalQuestions: source.totalQuestions,
      correctCount: source.correctCount,
      wrongCount: source.wrongCount,
      skippedCount: source.skippedCount,
      averageTimeSeconds: source.averageTimeSeconds,
      mostDifficultTopic: source.mostDifficultTopic,
    };
  }

  const input = source as TeacherInsightInput;
  return {
    totalQuestions: input.totalQuestions,
    correctCount: input.correctCount,
    wrongCount: input.wrongCount,
    skippedCount: input.skippedCount,
    averageTimeSeconds:
      input.averageAnswerTimeMs !== undefined
        ? Math.round(input.averageAnswerTimeMs / 1000)
        : undefined,
    mostDifficultTopic: input.mostDifficultTopic,
  };
}

export function buildBehaviorObservation(
  source: StoredQuizResult | TeacherInsightInput
): string {
  const m = toMetrics(source);
  const parts: string[] = [];

  if (m.skippedCount > 0) {
    parts.push(
      `Öğrenci ${m.skippedCount} soruyu boş bırakmıştır; kısa tekrar ve yönlendirilmiş alıştırmalar faydalı olabilir.`
    );
  }

  if (m.wrongCount > 0) {
    parts.push(`Öğrenci ${m.wrongCount} soruda yanlış cevap vermiştir.`);
  }

  if (m.mostDifficultTopic) {
    parts.push(
      `Öğrencinin en çok zorlandığı konu ${m.mostDifficultTopic} olarak görünmektedir.`
    );
  }

  if (m.averageTimeSeconds !== undefined && m.averageTimeSeconds > 0) {
    const answeredCount = m.correctCount + m.wrongCount;
    if (answeredCount > 0) {
      parts.push(
        `Cevaplanan sorularda ortalama süre ${m.averageTimeSeconds} saniyedir.`
      );
    }
  }

  if (parts.length === 0) {
    parts.push(
      `Öğrenci ${m.totalQuestions} soruluk quizi ${m.correctCount} doğru cevapla tamamlamıştır.`
    );
  }

  return parts.join(' ');
}

export function buildSystemRecommendation(
  source: StoredQuizResult | TeacherInsightInput
): string {
  const m = toMetrics(source);
  const topic = m.mostDifficultTopic ?? 'bu konu';

  if (m.skippedCount >= Math.max(2, Math.floor(m.totalQuestions / 3))) {
    return `${topic} için kısa tekrar, örnek çözüm ve düşük baskılı mini alıştırmalar önerilir.`;
  }

  if (m.wrongCount > 0) {
    return `${topic} konusu için kısa tekrar, örnek çözüm ve düşük baskılı mini alıştırmalar önerilir.`;
  }

  return `${topic} için pekiştirme çalışması ve kısa uygulama soruları önerilir.`;
}
