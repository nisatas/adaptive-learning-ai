import { AdaptationResult, BehaviorSignals, BehaviorSignalsPublic, InternalLearningProfile } from '../types';
export declare function computeBehaviorSignals(answers: Array<{
    questionId: string;
    isCorrect: boolean;
    isSkipped: boolean;
    timeSpentSeconds: number;
}>): BehaviorSignals;
export declare function toPublicBehaviorSignals(signals: BehaviorSignals): BehaviorSignalsPublic;
export declare function determineAdaptation(score: number, wrongCount: number, averageTimeSeconds: number, signals: BehaviorSignals): AdaptationResult;
export declare function buildSupportSummary(score: number): string;
export declare function buildPersonalizationStatus(profile: InternalLearningProfile): string;
//# sourceMappingURL=adaptation.service.d.ts.map