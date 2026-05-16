"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildFallbackTeacherReport = buildFallbackTeacherReport;
const teacherReportLanguage_1 = require("./teacherReportLanguage");
/**
 * Rule-based ethical teacher report when Puq.ai is unavailable.
 * Uses observable quiz metrics only.
 */
function buildFallbackTeacherReport(input) {
    const behaviorObservation = (0, teacherReportLanguage_1.buildBehaviorObservation)(input);
    const systemRecommendation = (0, teacherReportLanguage_1.buildSystemRecommendation)(input);
    const observations = [behaviorObservation];
    if (input.hesitationCount && input.hesitationCount > 0) {
        observations.push(`${input.hesitationCount} soruda cevap vermeden önce daha uzun süre harcanmıştır.`);
    }
    const accuracy = input.totalQuestions > 0
        ? Math.round((input.correctCount / input.totalQuestions) * 100)
        : 0;
    const summary = input.quizTitle
        ? `"${input.quizTitle}" quizi tamamlandı: ${input.correctCount} doğru, ${input.wrongCount} yanlış, ${input.skippedCount} boş (${accuracy}% doğruluk).`
        : `Quiz tamamlandı: ${input.correctCount} doğru, ${input.wrongCount} yanlış, ${input.skippedCount} boş (${accuracy}% doğruluk).`;
    return {
        summary,
        observations,
        recommendations: [systemRecommendation],
        generatedBy: 'fallback',
    };
}
//# sourceMappingURL=fallbackTeacherReport.js.map