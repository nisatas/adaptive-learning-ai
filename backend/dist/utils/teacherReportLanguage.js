"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildTeacherInsightUserPrompt = exports.TEACHER_REPORT_SYSTEM_PROMPT = exports.TEACHER_INSIGHT_SYSTEM_PROMPT = void 0;
exports.buildBehaviorObservation = buildBehaviorObservation;
exports.buildSystemRecommendation = buildSystemRecommendation;
var teacherInsight_prompt_1 = require("../prompts/teacherInsight.prompt");
Object.defineProperty(exports, "TEACHER_INSIGHT_SYSTEM_PROMPT", { enumerable: true, get: function () { return teacherInsight_prompt_1.TEACHER_INSIGHT_SYSTEM_PROMPT; } });
Object.defineProperty(exports, "TEACHER_REPORT_SYSTEM_PROMPT", { enumerable: true, get: function () { return teacherInsight_prompt_1.TEACHER_REPORT_SYSTEM_PROMPT; } });
Object.defineProperty(exports, "buildTeacherInsightUserPrompt", { enumerable: true, get: function () { return teacherInsight_prompt_1.buildTeacherInsightUserPrompt; } });
function toMetrics(source) {
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
    const input = source;
    return {
        totalQuestions: input.totalQuestions,
        correctCount: input.correctCount,
        wrongCount: input.wrongCount,
        skippedCount: input.skippedCount,
        averageTimeSeconds: input.averageAnswerTimeMs !== undefined
            ? Math.round(input.averageAnswerTimeMs / 1000)
            : undefined,
        mostDifficultTopic: input.mostDifficultTopic,
    };
}
function buildBehaviorObservation(source) {
    const m = toMetrics(source);
    const parts = [];
    if (m.skippedCount > 0) {
        parts.push(`Öğrenci ${m.skippedCount} soruyu boş bırakmıştır; kısa tekrar ve yönlendirilmiş alıştırmalar faydalı olabilir.`);
    }
    if (m.wrongCount > 0) {
        parts.push(`Öğrenci ${m.wrongCount} soruda yanlış cevap vermiştir.`);
    }
    if (m.mostDifficultTopic) {
        parts.push(`Öğrencinin en çok zorlandığı konu ${m.mostDifficultTopic} olarak görünmektedir.`);
    }
    if (m.averageTimeSeconds !== undefined && m.averageTimeSeconds > 0) {
        const answeredCount = m.correctCount + m.wrongCount;
        if (answeredCount > 0) {
            parts.push(`Cevaplanan sorularda ortalama süre ${m.averageTimeSeconds} saniyedir.`);
        }
    }
    if (parts.length === 0) {
        parts.push(`Öğrenci ${m.totalQuestions} soruluk quizi ${m.correctCount} doğru cevapla tamamlamıştır.`);
    }
    return parts.join(' ');
}
function buildSystemRecommendation(source) {
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
//# sourceMappingURL=teacherReportLanguage.js.map