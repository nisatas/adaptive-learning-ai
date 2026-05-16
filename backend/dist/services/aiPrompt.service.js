"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.aiPromptService = exports.AiPromptService = void 0;
const fallbackResponses_1 = require("../prompts/fallbackResponses");
const meetPlanning_prompt_1 = require("../prompts/workflows/meetPlanning.prompt");
const supportPlan_prompt_1 = require("../prompts/workflows/supportPlan.prompt");
const weeklyReport_prompt_1 = require("../prompts/workflows/weeklyReport.prompt");
const promptParsers_1 = require("../prompts/promptParsers");
const quizBehavior_prompt_1 = require("../prompts/quizBehavior.prompt");
const studentAnalysis_prompt_1 = require("../prompts/studentAnalysis.prompt");
const studentFeedback_prompt_1 = require("../prompts/studentFeedback.prompt");
const teacherDashboard_prompt_1 = require("../prompts/teacherDashboard.prompt");
const puqAi_service_1 = require("./puqAi.service");
/**
 * Modular AI prompt orchestration.
 * Endpoints keep existing response contracts; call these methods when wiring new AI features.
 */
class AiPromptService {
    async generateStudentFeedback(input) {
        const fallback = (0, fallbackResponses_1.fallbackStudentFeedbackResponse)(input);
        const content = await puqAi_service_1.puqAiService.completePrompt(studentFeedback_prompt_1.STUDENT_FEEDBACK_SYSTEM_PROMPT, (0, studentFeedback_prompt_1.buildStudentFeedbackUserPrompt)(input), 280);
        if (!content) {
            return fallback;
        }
        return (0, promptParsers_1.parseStudentFeedbackResponse)(content, fallback);
    }
    async generateStudentAnalysis(input) {
        const fallback = (0, fallbackResponses_1.fallbackStudentAnalysisResponse)(input);
        const content = await puqAi_service_1.puqAiService.completePrompt(studentAnalysis_prompt_1.STUDENT_ANALYSIS_SYSTEM_PROMPT, (0, studentAnalysis_prompt_1.buildStudentAnalysisUserPrompt)(input), 420);
        if (!content) {
            return fallback;
        }
        return (0, promptParsers_1.parseStudentAnalysisResponse)(content, fallback);
    }
    async generateQuizBehaviorAnalysis(input) {
        const fallback = (0, fallbackResponses_1.fallbackQuizBehaviorResponse)(input);
        const content = await puqAi_service_1.puqAiService.completePrompt(quizBehavior_prompt_1.QUIZ_BEHAVIOR_SYSTEM_PROMPT, (0, quizBehavior_prompt_1.buildQuizBehaviorUserPrompt)(input), 320);
        if (!content) {
            return fallback;
        }
        return (0, promptParsers_1.parseQuizBehaviorResponse)(content, fallback);
    }
    async generateTeacherDashboardAnalysis(input) {
        const fallback = (0, fallbackResponses_1.fallbackTeacherDashboardResponse)(input);
        const content = await puqAi_service_1.puqAiService.completePrompt(teacherDashboard_prompt_1.TEACHER_DASHBOARD_SYSTEM_PROMPT, (0, teacherDashboard_prompt_1.buildTeacherDashboardUserPrompt)(input), 520);
        if (!content) {
            return fallback;
        }
        return (0, promptParsers_1.parseTeacherDashboardResponse)(content, fallback);
    }
    async generateMeetPlanningWorkflow(input) {
        const fallback = (0, fallbackResponses_1.fallbackMeetWorkflowResponse)(input);
        const content = await puqAi_service_1.puqAiService.completePrompt(meetPlanning_prompt_1.MEET_PLANNING_SYSTEM_PROMPT, (0, meetPlanning_prompt_1.buildMeetPlanningUserPrompt)(input), 420);
        if (!content) {
            return fallback;
        }
        return (0, promptParsers_1.parseMeetWorkflowResponse)(content, fallback);
    }
    async generateSupportPlanWorkflow(input) {
        const fallback = (0, fallbackResponses_1.fallbackSupportPlanWorkflowResponse)(input);
        const content = await puqAi_service_1.puqAiService.completePrompt(supportPlan_prompt_1.SUPPORT_PLAN_SYSTEM_PROMPT, (0, supportPlan_prompt_1.buildSupportPlanUserPrompt)(input), 480);
        if (!content) {
            return fallback;
        }
        return (0, promptParsers_1.parseSupportPlanWorkflowResponse)(content, fallback);
    }
    async generateWeeklyReportWorkflow(input) {
        const fallback = (0, fallbackResponses_1.fallbackWeeklyReportWorkflowResponse)(input);
        const content = await puqAi_service_1.puqAiService.completePrompt(weeklyReport_prompt_1.WEEKLY_REPORT_SYSTEM_PROMPT, (0, weeklyReport_prompt_1.buildWeeklyReportUserPrompt)(input), 520);
        if (!content) {
            return fallback;
        }
        return (0, promptParsers_1.parseWeeklyReportWorkflowResponse)(content, fallback);
    }
}
exports.AiPromptService = AiPromptService;
exports.aiPromptService = new AiPromptService();
//# sourceMappingURL=aiPrompt.service.js.map