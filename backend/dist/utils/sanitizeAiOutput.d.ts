export declare function normalizeForSafetyCheck(text: string): string;
export declare function containsForbiddenTerms(text: string): boolean;
export interface SanitizeResult {
    text: string;
    wasSanitized: boolean;
}
/**
 * Puq.ai veya fallback metnini etik dil filtresinden geçirir.
 * Yasaklı terim varsa güvenli metin döner.
 */
export declare function sanitizeAiOutput(text: string, safeFallback: string): SanitizeResult;
export declare function sanitizeInsightParts(parts: {
    summary: string;
    observations: string[];
    recommendations: string[];
}, safeFallback: string): {
    summary: string;
    observations: string[];
    recommendations: string[];
    wasSanitized: boolean;
};
//# sourceMappingURL=sanitizeAiOutput.d.ts.map