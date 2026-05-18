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

async function runWithPuqAiFallback<T>(
  label: string,
  fallback: T,
  call: () => Promise<string | null>,
  parse: (content: string) => T,
): Promise<{ data: T; aiSource: 'puqai' | 'fallback' }> {
  const content = await call();
  if (!content) {
    console.warn(`[AiPrompt] ${label} → fallback (Puq.ai unavailable)`);
    return { data: fallback, aiSource: 'fallback' };
  }

  try {
    console.log(`[AiPrompt] ${label} → puqai`);
    return { data: parse(content), aiSource: 'puqai' };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'parse_error';
    console.warn(`[AiPrompt] ${label} → fallback (parse failed: ${message})`);
    return { data: fallback, aiSource: 'fallback' };
  }
}

/**
 * Modular AI prompt orchestration.
 * Endpoints keep existing response contracts; call these methods when wiring new AI features.
 */
export class AiPromptService {
  async generateStudentFeedback(
    input: StudentFeedbackPromptInput,
  ): Promise<StudentFeedbackResponse> {
    const fallback = fallbackStudentFeedbackResponse(input);
    const result = await runWithPuqAiFallback(
      'studentFeedback',
      fallback,
      () =>
        puqAiService.completePrompt(
          STUDENT_FEEDBACK_SYSTEM_PROMPT,
          buildStudentFeedbackUserPrompt(input),
          280,
          'Student recommendation workflow',
        ),
      (content) => parseStudentFeedbackResponse(content, fallback),
    );
    return result.data;
  }

  async generateStudentAnalysis(
    input: StudentAnalysisPromptInput,
  ): Promise<StudentAnalysisResponse> {
    const fallback = fallbackStudentAnalysisResponse(input);
    const result = await runWithPuqAiFallback(
      'studentAnalysis',
      fallback,
      () =>
        puqAiService.completePrompt(
          STUDENT_ANALYSIS_SYSTEM_PROMPT,
          buildStudentAnalysisUserPrompt(input),
          420,
          'Student recommendation workflow',
        ),
      (content) => parseStudentAnalysisResponse(content, fallback),
    );
    return result.data;
  }

  async generateQuizBehaviorAnalysis(
    input: QuizBehaviorPromptInput,
  ): Promise<QuizBehaviorAnalysisResponse> {
    const fallback = fallbackQuizBehaviorResponse(input);
    const result = await runWithPuqAiFallback(
      'quizBehavior',
      fallback,
      () =>
        puqAiService.completePrompt(
          QUIZ_BEHAVIOR_SYSTEM_PROMPT,
          buildQuizBehaviorUserPrompt(input),
          320,
          'quizBehavior',
        ),
      (content) => parseQuizBehaviorResponse(content, fallback),
    );
    return result.data;
  }

  async generateTeacherDashboardAnalysis(
    input: TeacherDashboardPromptInput,
  ): Promise<TeacherDashboardAnalysisResponse> {
    const fallback = fallbackTeacherDashboardResponse(input);
    const result = await runWithPuqAiFallback(
      'teacherDashboard',
      fallback,
      () =>
        puqAiService.completePrompt(
          TEACHER_DASHBOARD_SYSTEM_PROMPT,
          buildTeacherDashboardUserPrompt(input),
          520,
          'Class analysis workflow',
        ),
      (content) => parseTeacherDashboardResponse(content, fallback),
    );
    return result.data;
  }

  async generateMeetPlanningWorkflow(
    input: MeetPlanningPromptInput,
  ): Promise<MeetWorkflowResponse> {
    const fallback = fallbackMeetWorkflowResponse(input);
    const result = await runWithPuqAiFallback(
      'meetPlanning',
      fallback,
      () =>
        puqAiService.completePrompt(
          MEET_PLANNING_SYSTEM_PROMPT,
          buildMeetPlanningUserPrompt(input),
          420,
          'meetPlanning',
        ),
      (content) => parseMeetWorkflowResponse(content, fallback),
    );
    return result.data;
  }

  async generateSupportPlanWorkflow(
    input: SupportPlanPromptInput,
  ): Promise<SupportPlanWorkflowResponse> {
    const fallback = fallbackSupportPlanWorkflowResponse(input);
    const result = await runWithPuqAiFallback(
      'supportPlan',
      fallback,
      () =>
        puqAiService.completePrompt(
          SUPPORT_PLAN_SYSTEM_PROMPT,
          buildSupportPlanUserPrompt(input),
          480,
          'supportPlan',
        ),
      (content) => parseSupportPlanWorkflowResponse(content, fallback),
    );
    return result.data;
  }

  async generateWeeklyReportWorkflow(
    input: WeeklyReportPromptInput,
  ): Promise<WeeklyReportWorkflowResponse> {
    const fallback = fallbackWeeklyReportWorkflowResponse(input);
    const result = await runWithPuqAiFallback(
      'weeklyReport',
      fallback,
      () =>
        puqAiService.completePrompt(
          WEEKLY_REPORT_SYSTEM_PROMPT,
          buildWeeklyReportUserPrompt(input),
          520,
          'Weekly report workflow',
        ),
      (content) => parseWeeklyReportWorkflowResponse(content, fallback),
    );
    return result.data;
  }
}

export const aiPromptService = new AiPromptService();
