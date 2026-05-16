import { MeetWorkflowResponse, QuizBehaviorAnalysisResponse, StudentAnalysisResponse, StudentFeedbackResponse, SupportPlanWorkflowResponse, TeacherDashboardAnalysisResponse, WeeklyReportWorkflowResponse } from './contracts/promptContracts';
export declare function parseStudentFeedbackResponse(content: string, fallback: StudentFeedbackResponse): StudentFeedbackResponse;
export declare function parseStudentAnalysisResponse(content: string, fallback: StudentAnalysisResponse): StudentAnalysisResponse;
export declare function parseQuizBehaviorResponse(content: string, fallback: QuizBehaviorAnalysisResponse): QuizBehaviorAnalysisResponse;
export declare function parseTeacherDashboardResponse(content: string, fallback: TeacherDashboardAnalysisResponse): TeacherDashboardAnalysisResponse;
export declare function parseMeetWorkflowResponse(content: string, fallback: MeetWorkflowResponse): MeetWorkflowResponse;
export declare function parseSupportPlanWorkflowResponse(content: string, fallback: SupportPlanWorkflowResponse): SupportPlanWorkflowResponse;
export declare function parseWeeklyReportWorkflowResponse(content: string, fallback: WeeklyReportWorkflowResponse): WeeklyReportWorkflowResponse;
//# sourceMappingURL=promptParsers.d.ts.map