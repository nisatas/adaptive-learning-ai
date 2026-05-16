"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.normalizeForSafetyCheck = normalizeForSafetyCheck;
exports.containsForbiddenTerms = containsForbiddenTerms;
exports.sanitizeAiOutput = sanitizeAiOutput;
exports.sanitizeInsightParts = sanitizeInsightParts;
const FORBIDDEN_TERMS = [
    'dehb',
    'adhd',
    'disleksi',
    'dyslexia',
    'bozukluk',
    'tanı',
    'teshis',
    'teşhis',
    'riskli öğrenci',
    'dikkat bozukluğu',
    'öğrenme bozukluğu',
    'engelli',
    'isteksiz',
    'dikkatsiz',
    'motivasyonsuz',
    'problemli',
    'zayıf öğrenci',
    'zayıf',
    'başarısız öğrenci',
    'başarısız',
    'tembel',
    'motivasyonu düşük',
    'ilgisiz',
];
function normalizeForSafetyCheck(text) {
    return text.toLocaleLowerCase('tr-TR');
}
function containsForbiddenTerms(text) {
    const normalized = normalizeForSafetyCheck(text);
    return FORBIDDEN_TERMS.some((term) => normalized.includes(term));
}
/**
 * Puq.ai veya fallback metnini etik dil filtresinden geçirir.
 * Yasaklı terim varsa güvenli metin döner.
 */
function sanitizeAiOutput(text, safeFallback) {
    if (!text || containsForbiddenTerms(text)) {
        return { text: safeFallback, wasSanitized: true };
    }
    return { text, wasSanitized: false };
}
function sanitizeInsightParts(parts, safeFallback) {
    const combined = [
        parts.summary,
        ...parts.observations,
        ...parts.recommendations,
    ].join(' ');
    if (!containsForbiddenTerms(combined)) {
        return { ...parts, wasSanitized: false };
    }
    return {
        summary: safeFallback,
        observations: [],
        recommendations: [],
        wasSanitized: true,
    };
}
//# sourceMappingURL=sanitizeAiOutput.js.map