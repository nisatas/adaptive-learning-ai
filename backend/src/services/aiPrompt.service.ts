import {
  MeetPlanningPromptInput,
  MeetWorkflowResponse,
  QuizBehaviorAnalysisResponse,
  QuizBehaviorPromptInput,
  StudentAnalysisPromptInput,
  StudentAnalysisResponse,
  StudentFeedbackPromptInput,
  StudentFeedbackResponse,
  SupportPlanPromptInput,
  SupportPlanWorkflowResponse,
  TeacherDashboardAnalysisResponse,
  TeacherDashboardPromptInput,
  WeeklyReportPromptInput,
  WeeklyReportWorkflowResponse,
} from '../prompts/contracts/promptContracts';
import {
  fallbackMeetWorkflowResponse,
  fallbackQuizBehaviorResponse,
  fallbackStudentAnalysisResponse,
  fallbackStudentFeedbackResponse,
  fallbackSupportPlanWorkflowResponse,
  fallbackTeacherDashboardResponse,
  fallbackWeeklyReportWorkflowResponse,
} from '../prompts/fallbackResponses';
import {
  buildMeetPlanningUserPrompt,
  MEET_PLANNING_SYSTEM_PROMPT,
} from '../prompts/workflows/meetPlanning.prompt';
import {
  buildSupportPlanUserPrompt,
  SUPPORT_PLAN_SYSTEM_PROMPT,
} from '../prompts/workflows/supportPlan.prompt';
import {
  buildWeeklyReportUserPrompt,
  WEEKLY_REPORT_SYSTEM_PROMPT,
} from '../prompts/workflows/weeklyReport.prompt';
import {
  parseMeetWorkflowResponse,
  parseQuizBehaviorResponse,
  parseStudentAnalysisResponse,
  parseStudentFeedbackResponse,
  parseSupportPlanWorkflowResponse,
  parseTeacherDashboardResponse,
  parseWeeklyReportWorkflowResponse,
} from '../prompts/promptParsers';
import {
  buildQuizBehaviorUserPrompt,
  QUIZ_BEHAVIOR_SYSTEM_PROMPT,
} from '../prompts/quizBehavior.prompt';
import {
  buildStudentAnalysisUserPrompt,
  STUDENT_ANALYSIS_SYSTEM_PROMPT,
} from '../prompts/studentAnalysis.prompt';
import {
  buildStudentFeedbackUserPrompt,
  STUDENT_FEEDBACK_SYSTEM_PROMPT,
} from '../prompts/studentFeedback.prompt';
import {
  buildTeacherDashboardUserPrompt,
  TEACHER_DASHBOARD_SYSTEM_PROMPT,
} from '../prompts/teacherDashboard.prompt';
import { puqAiService } from './puqAi.service';

/**
 * Modular AI prompt orchestration.
 * Endpoints keep existing response contracts; call these methods when wiring new AI features.
 */
export class AiPromptService {
  async generateStudentFeedback(
    input: StudentFeedbackPromptInput
  ): Promise<StudentFeedbackResponse> {
    const fallback = fallbackStudentFeedbackResponse(input);
    const content = await puqAiService.completePrompt(
      STUDENT_FEEDBACK_SYSTEM_PROMPT,
      buildStudentFeedbackUserPrompt(input),
      280
    );
    if (!content) {
      return fallback;
    }
    return parseStudentFeedbackResponse(content, fallback);
  }

  async generateStudentAnalysis(
    input: StudentAnalysisPromptInput
  ): Promise<StudentAnalysisResponse> {
    const fallback = fallbackStudentAnalysisResponse(input);
    const content = await puqAiService.completePrompt(
      STUDENT_ANALYSIS_SYSTEM_PROMPT,
      buildStudentAnalysisUserPrompt(input),
      420
    );
    if (!content) {
      return fallback;
    }
    return parseStudentAnalysisResponse(content, fallback);
  }

  async generateQuizBehaviorAnalysis(
    input: QuizBehaviorPromptInput
  ): Promise<QuizBehaviorAnalysisResponse> {
    const fallback = fallbackQuizBehaviorResponse(input);
    const content = await puqAiService.completePrompt(
      QUIZ_BEHAVIOR_SYSTEM_PROMPT,
      buildQuizBehaviorUserPrompt(input),
      320
    );
    if (!content) {
      return fallback;
    }
    return parseQuizBehaviorResponse(content, fallback);
  }

  async generateTeacherDashboardAnalysis(
    input: TeacherDashboardPromptInput
  ): Promise<TeacherDashboardAnalysisResponse> {
    const fallback = fallbackTeacherDashboardResponse(input);
    const content = await puqAiService.completePrompt(
      TEACHER_DASHBOARD_SYSTEM_PROMPT,
      buildTeacherDashboardUserPrompt(input),
      520
    );
    if (!content) {
      return fallback;
    }
    return parseTeacherDashboardResponse(content, fallback);
  }

  async generateMeetPlanningWorkflow(
    input: MeetPlanningPromptInput
  ): Promise<MeetWorkflowResponse> {
    const fallback = fallbackMeetWorkflowResponse(input);
    const content = await puqAiService.completePrompt(
      MEET_PLANNING_SYSTEM_PROMPT,
      buildMeetPlanningUserPrompt(input),
      420
    );
    if (!content) {
      return fallback;
    }
    return parseMeetWorkflowResponse(content, fallback);
  }

  async generateSupportPlanWorkflow(
    input: SupportPlanPromptInput
  ): Promise<SupportPlanWorkflowResponse> {
    const fallback = fallbackSupportPlanWorkflowResponse(input);
    const content = await puqAiService.completePrompt(
      SUPPORT_PLAN_SYSTEM_PROMPT,
      buildSupportPlanUserPrompt(input),
      480
    );
    if (!content) {
      return fallback;
    }
    return parseSupportPlanWorkflowResponse(content, fallback);
  }

  async generateWeeklyReportWorkflow(
    input: WeeklyReportPromptInput
  ): Promise<WeeklyReportWorkflowResponse> {
    const fallback = fallbackWeeklyReportWorkflowResponse(input);
    const content = await puqAiService.completePrompt(
      WEEKLY_REPORT_SYSTEM_PROMPT,
      buildWeeklyReportUserPrompt(input),
      520
    );
    if (!content) {
      return fallback;
    }
    return parseWeeklyReportWorkflowResponse(content, fallback);
  }
}

export const aiPromptService = new AiPromptService();
