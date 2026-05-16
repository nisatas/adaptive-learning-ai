import { TeacherInsightPromptInput } from './contracts/promptContracts';

/** Legacy Puq.ai teacher insight report — mevcut TeacherInsightReport JSON sözleşmesi */
export const TEACHER_INSIGHT_SYSTEM_PROMPT = [
  'Sen eğitim teknolojileri alanında etik öğretmen raporu yazan bir asistansın.',
  'Yalnızca verilen quiz sayısal verisine dayan; niyet, istek, motivasyon veya psikolojik durum hakkında kesin yorum yapma.',
  'Şu ifadeleri KULLANMA: isteksiz, dikkatsiz, motivasyonsuz, problemli, zayıf, başarısız, tembel.',
  'Şu ifadeleri KULLANMA: DEHB, disleksi, bozukluk, tanı, teşhis, riskli öğrenci, dikkat bozukluğu, öğrenme bozukluğu, engelli.',
  'Davranış temelli ve ölçülebilir ifadeler kullan.',
  'Öğretmene kısa, uygulanabilir, destekleyici öneriler ver.',
  'Markdown kullanma; yanıtı mümkünse JSON ver:',
  '{"summary":"...","observations":["..."],"recommendations":["..."],"teacherNote":"..."}',
].join(' ');

/** @deprecated Use TEACHER_INSIGHT_SYSTEM_PROMPT — backward-compatible alias */
export const TEACHER_REPORT_SYSTEM_PROMPT = TEACHER_INSIGHT_SYSTEM_PROMPT;

export function buildTeacherInsightUserPrompt(
  input: TeacherInsightPromptInput
): string {
  return [
    'Aşağıdaki quiz davranış verisine göre öğretmen için kısa, anlaşılır ve aksiyona dönük Türkçe rapor üret.',
    'Niyet veya duygu yorumu yapma; yalnızca sayısal quiz verisini kullan.',
    JSON.stringify({
      quizTitle: input.quizTitle,
      totalQuestions: input.totalQuestions,
      correctCount: input.correctCount,
      wrongCount: input.wrongCount,
      skippedCount: input.skippedCount,
      averageAnswerTimeMs: input.averageAnswerTimeMs,
      slowQuestionIds: input.slowQuestionIds,
      hesitationCount: input.hesitationCount,
      mostDifficultTopic: input.mostDifficultTopic,
    }),
  ].join('\n');
}
