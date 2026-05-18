import { AdaptationResult, BehaviorSignals, BehaviorSignalsPublic, InternalLearningProfile, QuizSubmissionMeta } from '../types';
export interface EvaluatedAnswer {
    questionId: string;
    selectedOptionId?: string;
    isCorrect: boolean;
    isSkipped: boolean;
    timeSpentSeconds: number;
    topic: string;
}
export declare function computeBehaviorSignals(answers: EvaluatedAnswer[]): BehaviorSignals;
export declare function toPublicBehaviorSignals(signals: BehaviorSignals): BehaviorSignalsPublic;
export declare function determineAdaptation(score: number, wrongCount: number, averageTimeSeconds: number, signals: BehaviorSignals, meta?: QuizSubmissionMeta): AdaptationResult;
export declare function buildSupportSummary(score: number): string;
export declare function buildPersonalizationStatus(profile: InternalLearningProfile): string;
//# sourceMappingURL=adaptation.service.d.ts.map