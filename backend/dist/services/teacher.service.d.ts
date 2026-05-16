import { TeacherDashboardSummary, TeacherStudentsListResponse, InternalLearningProfile, SupportDistributionItem, PuqAiAgentFeedItem, RecommendedAction } from '../types';
export declare function buildRecommendedActions(mostDifficultTopic: string): RecommendedAction[];
export declare function buildSupportDistribution(profilesResolved: InternalLearningProfile[]): SupportDistributionItem[];
interface PuqAiFeedContext {
    mostDifficultTopic: string;
    lesson: string;
    supportDistribution: SupportDistributionItem[];
}
export declare function buildPuqAiAgentFeed(ctx: PuqAiFeedContext): Promise<PuqAiAgentFeedItem[]>;
export declare function getTeacherDashboard(): Promise<TeacherDashboardSummary>;
export declare function getTeacherStudentsList(): TeacherStudentsListResponse;
export {};
//# sourceMappingURL=teacher.service.d.ts.map