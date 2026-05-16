import { ConfidenceLevel } from './contracts/promptContracts';
export declare function extractJsonBlock(text: string): string | null;
export declare function tryParsePromptJson<T extends object>(content: string): Partial<T> | null;
export declare function asNonEmptyString(value: unknown, fallback: string): string;
export declare function asStringArray(value: unknown, fallback: string[]): string[];
export declare function asSignalLevel(value: unknown, fallback: 'low' | 'medium' | 'high'): 'low' | 'medium' | 'high';
export declare function asConfidence(value: unknown, fallback?: ConfidenceLevel): ConfidenceLevel;
export declare function mergeWithFallback<T extends object>(parsed: Partial<T> | null, fallback: T, merge: (partial: Partial<T>, base: T) => T): T;
//# sourceMappingURL=promptResponse.util.d.ts.map