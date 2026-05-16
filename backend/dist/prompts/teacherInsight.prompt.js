"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TEACHER_REPORT_SYSTEM_PROMPT = exports.TEACHER_INSIGHT_SYSTEM_PROMPT = void 0;
exports.buildTeacherInsightUserPrompt = buildTeacherInsightUserPrompt;
/** Legacy Puq.ai teacher insight report — mevcut TeacherInsightReport JSON sözleşmesi */
exports.TEACHER_INSIGHT_SYSTEM_PROMPT = [
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
exports.TEACHER_REPORT_SYSTEM_PROMPT = exports.TEACHER_INSIGHT_SYSTEM_PROMPT;
function buildTeacherInsightUserPrompt(input) {
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
//# sourceMappingURL=teacherInsight.prompt.js.map