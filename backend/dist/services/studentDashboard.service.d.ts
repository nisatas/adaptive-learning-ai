import { StudentDashboardLearningSummary, StudentDashboardResponse, StudentDashboardSupportPlan, StudentDashboardTodayRecommendation } from '../types';
type StudentDashboardBuildInput = Pick<StudentDashboardResponse, 'studentId' | 'studentName' | 'lesson' | 'topic' | 'score'>;
export declare function buildLearningSummary(dashboard: StudentDashboardBuildInput, hasQuizResult?: boolean): StudentDashboardLearningSummary;
export declare function buildSupportPlan(dashboard: StudentDashboardBuildInput, learningSummary?: StudentDashboardLearningSummary): StudentDashboardSupportPlan;
export declare function buildTodayRecommendation(dashboard: StudentDashboardBuildInput, learningSummary?: StudentDashboardLearningSummary): StudentDashboardTodayRecommendation;
export declare class StudentDashboardServiceError extends Error {
    statusCode: number;
    constructor(message: string, statusCode: number);
}
export declare function getStudentDashboard(studentId: string): StudentDashboardResponse;
export {};
//# sourceMappingURL=studentDashboard.service.d.ts.map