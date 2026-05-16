import { MeetPlanningPromptInput, MeetWorkflowResponse, QuizBehaviorAnalysisResponse, QuizBehaviorPromptInput, StudentAnalysisPromptInput, StudentAnalysisResponse, StudentFeedbackPromptInput, StudentFeedbackResponse, SupportPlanPromptInput, SupportPlanWorkflowResponse, TeacherDashboardAnalysisResponse, TeacherDashboardPromptInput, WeeklyReportPromptInput, WeeklyReportWorkflowResponse } from '../prompts/contracts/promptContracts';
/**
 * Modular AI prompt orchestration.
 * Endpoints keep existing response contracts; call these methods when wiring new AI features.
 */
export declare class AiPromptService {
    generateStudentFeedback(input: StudentFeedbackPromptInput): Promise<StudentFeedbackResponse>;
    generateStudentAnalysis(input: StudentAnalysisPromptInput): Promise<StudentAnalysisResponse>;
    generateQuizBehaviorAnalysis(input: QuizBehaviorPromptInput): Promise<QuizBehaviorAnalysisResponse>;
    generateTeacherDashboardAnalysis(input: TeacherDashboardPromptInput): Promise<TeacherDashboardAnalysisResponse>;
    generateMeetPlanningWorkflow(input: MeetPlanningPromptInput): Promise<MeetWorkflowResponse>;
    generateSupportPlanWorkflow(input: SupportPlanPromptInput): Promise<SupportPlanWorkflowResponse>;
    generateWeeklyReportWorkflow(input: WeeklyReportPromptInput): Promise<WeeklyReportWorkflowResponse>;
}
export declare const aiPromptService: AiPromptService;
//# sourceMappingURL=aiPrompt.service.d.ts.map