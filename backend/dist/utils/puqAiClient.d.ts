export type PuqAiErrorType = 'AUTH_ERROR' | 'CREDIT_ERROR' | 'ENDPOINT_NOT_FOUND' | 'NETWORK_ERROR' | 'SSL_ERROR' | 'UNKNOWN_ERROR';
export interface PuqAiErrorDetails {
    statusCode: number | null;
    errorType: PuqAiErrorType;
    safeMessage: string;
    message: string;
}
export declare class PuqAiHttpError extends Error {
    readonly statusCode: number;
    constructor(statusCode: number);
}
export declare function buildPuqAiUrl(endpointPath: string): string;
export declare function buildPuqAiHeaders(): Record<string, string>;
export declare function mapPuqAiHttpErrorForProbe(status: number): PuqAiErrorDetails;
export declare function mapPuqAiHttpError(status: number): PuqAiErrorDetails;
export declare function classifyPuqAiError(error: unknown, fallbackMessage?: string): PuqAiErrorDetails;
export declare function extractPuqAiContent(data: unknown): string | null;
export declare function parseModelsFromResponse(data: unknown): string[];
export declare function truncateSampleText(text: string, maxLength?: number): string;
//# sourceMappingURL=puqAiClient.d.ts.map