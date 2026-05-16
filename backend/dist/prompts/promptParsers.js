"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseStudentFeedbackResponse = parseStudentFeedbackResponse;
exports.parseStudentAnalysisResponse = parseStudentAnalysisResponse;
exports.parseQuizBehaviorResponse = parseQuizBehaviorResponse;
exports.parseTeacherDashboardResponse = parseTeacherDashboardResponse;
exports.parseMeetWorkflowResponse = parseMeetWorkflowResponse;
exports.parseSupportPlanWorkflowResponse = parseSupportPlanWorkflowResponse;
exports.parseWeeklyReportWorkflowResponse = parseWeeklyReportWorkflowResponse;
const promptResponse_util_1 = require("./promptResponse.util");
function parseStudentFeedbackResponse(content, fallback) {
    const parsed = (0, promptResponse_util_1.tryParsePromptJson)(content);
    if (!parsed) {
        return fallback;
    }
    return {
        studentGreeting: (0, promptResponse_util_1.asNonEmptyString)(parsed.studentGreeting, fallback.studentGreeting),
        shortFeedback: (0, promptResponse_util_1.asNonEmptyString)(parsed.shortFeedback, fallback.shortFeedback),
        motivationMessage: (0, promptResponse_util_1.asNonEmptyString)(parsed.motivationMessage, fallback.motivationMessage),
        nextStep: (0, promptResponse_util_1.asNonEmptyString)(parsed.nextStep, fallback.nextStep),
        focusTopic: (0, promptResponse_util_1.asNonEmptyString)(parsed.focusTopic, fallback.focusTopic),
        confidence: (0, promptResponse_util_1.asConfidence)(parsed.confidence, fallback.confidence),
    };
}
function parseStudentAnalysisResponse(content, fallback) {
    const parsed = (0, promptResponse_util_1.tryParsePromptJson)(content);
    if (!parsed) {
        return fallback;
    }
    const ui = parsed.adaptiveUiSuggestion ?? fallback.adaptiveUiSuggestion;
    return {
        studentSummary: (0, promptResponse_util_1.asNonEmptyString)(parsed.studentSummary, fallback.studentSummary),
        performanceLevel: parsePerformanceLevel(parsed.performanceLevel, fallback.performanceLevel),
        attentionSignal: (0, promptResponse_util_1.asSignalLevel)(parsed.attentionSignal, fallback.attentionSignal),
        difficultySignal: (0, promptResponse_util_1.asSignalLevel)(parsed.difficultySignal, fallback.difficultySignal),
        strengths: (0, promptResponse_util_1.asStringArray)(parsed.strengths, fallback.strengths),
        needsSupport: (0, promptResponse_util_1.asStringArray)(parsed.needsSupport, fallback.needsSupport),
        recommendedNextSteps: (0, promptResponse_util_1.asStringArray)(parsed.recommendedNextSteps, fallback.recommendedNextSteps),
        teacherNote: (0, promptResponse_util_1.asNonEmptyString)(parsed.teacherNote, fallback.teacherNote),
        adaptiveUiSuggestion: parseAdaptiveUi(ui, fallback.adaptiveUiSuggestion),
        confidence: (0, promptResponse_util_1.asConfidence)(parsed.confidence, fallback.confidence),
    };
}
function parseQuizBehaviorResponse(content, fallback) {
    const parsed = (0, promptResponse_util_1.tryParsePromptJson)(content);
    if (!parsed) {
        return fallback;
    }
    return {
        interactionSummary: (0, promptResponse_util_1.asNonEmptyString)(parsed.interactionSummary, fallback.interactionSummary),
        attentionSignal: (0, promptResponse_util_1.asSignalLevel)(parsed.attentionSignal, fallback.attentionSignal),
        engagementSignal: (0, promptResponse_util_1.asSignalLevel)(parsed.engagementSignal, fallback.engagementSignal),
        confidenceSignal: (0, promptResponse_util_1.asSignalLevel)(parsed.confidenceSignal, fallback.confidenceSignal),
        behaviorNotes: (0, promptResponse_util_1.asStringArray)(parsed.behaviorNotes, fallback.behaviorNotes),
        safeInterpretation: (0, promptResponse_util_1.asNonEmptyString)(parsed.safeInterpretation, fallback.safeInterpretation),
        confidence: (0, promptResponse_util_1.asConfidence)(parsed.confidence, fallback.confidence),
    };
}
function parseTeacherDashboardResponse(content, fallback) {
    const parsed = (0, promptResponse_util_1.tryParsePromptJson)(content);
    if (!parsed) {
        return fallback;
    }
    return {
        classSummary: (0, promptResponse_util_1.asNonEmptyString)(parsed.classSummary, fallback.classSummary),
        mostDifficultTopic: (0, promptResponse_util_1.asNonEmptyString)(parsed.mostDifficultTopic, fallback.mostDifficultTopic),
        studentsNeedingSupport: Array.isArray(parsed.studentsNeedingSupport) &&
            parsed.studentsNeedingSupport.length > 0
            ? parsed.studentsNeedingSupport.map((item, index) => ({
                studentId: (0, promptResponse_util_1.asNonEmptyString)(item.studentId, fallback.studentsNeedingSupport[index]?.studentId ?? 'unknown'),
                studentName: (0, promptResponse_util_1.asNonEmptyString)(item.studentName, fallback.studentsNeedingSupport[index]?.studentName ?? 'Öğrenci'),
                reason: (0, promptResponse_util_1.asNonEmptyString)(item.reason, fallback.studentsNeedingSupport[index]?.reason ?? ''),
                suggestedAction: (0, promptResponse_util_1.asNonEmptyString)(item.suggestedAction, fallback.studentsNeedingSupport[index]?.suggestedAction ?? ''),
                priority: (0, promptResponse_util_1.asSignalLevel)(item.priority, fallback.studentsNeedingSupport[index]?.priority ?? 'medium'),
            }))
            : fallback.studentsNeedingSupport,
        challengeReadyStudents: Array.isArray(parsed.challengeReadyStudents) &&
            parsed.challengeReadyStudents.length > 0
            ? parsed.challengeReadyStudents.map((item, index) => ({
                studentId: (0, promptResponse_util_1.asNonEmptyString)(item.studentId, fallback.challengeReadyStudents[index]?.studentId ?? 'unknown'),
                studentName: (0, promptResponse_util_1.asNonEmptyString)(item.studentName, fallback.challengeReadyStudents[index]?.studentName ??
                    'Öğrenci'),
                reason: (0, promptResponse_util_1.asNonEmptyString)(item.reason, fallback.challengeReadyStudents[index]?.reason ?? ''),
                suggestedAction: (0, promptResponse_util_1.asNonEmptyString)(item.suggestedAction, fallback.challengeReadyStudents[index]?.suggestedAction ?? ''),
            }))
            : fallback.challengeReadyStudents,
        recommendedTeacherActions: (0, promptResponse_util_1.asStringArray)(parsed.recommendedTeacherActions, fallback.recommendedTeacherActions),
        workflowSuggestions: Array.isArray(parsed.workflowSuggestions) &&
            parsed.workflowSuggestions.length > 0
            ? parsed.workflowSuggestions.map((item, index) => ({
                type: item.type === 'meet_request' ||
                    item.type === 'support_plan' ||
                    item.type === 'weekly_report'
                    ? item.type
                    : (fallback.workflowSuggestions[index]?.type ?? 'weekly_report'),
                title: (0, promptResponse_util_1.asNonEmptyString)(item.title, fallback.workflowSuggestions[index]?.title ?? 'Workflow'),
                reason: (0, promptResponse_util_1.asNonEmptyString)(item.reason, fallback.workflowSuggestions[index]?.reason ?? ''),
                priority: (0, promptResponse_util_1.asSignalLevel)(item.priority, fallback.workflowSuggestions[index]?.priority ?? 'medium'),
            }))
            : fallback.workflowSuggestions,
        confidence: (0, promptResponse_util_1.asConfidence)(parsed.confidence, fallback.confidence),
    };
}
function parseMeetWorkflowResponse(content, fallback) {
    const parsed = (0, promptResponse_util_1.tryParsePromptJson)(content);
    if (!parsed) {
        return fallback;
    }
    return {
        ...fallback,
        workflowType: 'meet_request',
        priority: (0, promptResponse_util_1.asSignalLevel)(parsed.priority, fallback.priority),
        studentName: (0, promptResponse_util_1.asNonEmptyString)(parsed.studentName, fallback.studentName),
        studentId: (0, promptResponse_util_1.asNonEmptyString)(parsed.studentId, fallback.studentId),
        lesson: (0, promptResponse_util_1.asNonEmptyString)(parsed.lesson, fallback.lesson),
        topic: (0, promptResponse_util_1.asNonEmptyString)(parsed.topic, fallback.topic),
        meetingReason: (0, promptResponse_util_1.asNonEmptyString)(parsed.meetingReason, fallback.meetingReason),
        teacherMessage: (0, promptResponse_util_1.asNonEmptyString)(parsed.teacherMessage, fallback.teacherMessage),
        suggestedDurationMinutes: typeof parsed.suggestedDurationMinutes === 'number' &&
            parsed.suggestedDurationMinutes > 0
            ? parsed.suggestedDurationMinutes
            : fallback.suggestedDurationMinutes,
        suggestedAgenda: (0, promptResponse_util_1.asStringArray)(parsed.suggestedAgenda, fallback.suggestedAgenda),
        studentSupportFocus: (0, promptResponse_util_1.asStringArray)(parsed.studentSupportFocus, fallback.studentSupportFocus),
        parentOrGuardianNote: (0, promptResponse_util_1.asNonEmptyString)(parsed.parentOrGuardianNote, fallback.parentOrGuardianNote),
        dashboardSummary: (0, promptResponse_util_1.asNonEmptyString)(parsed.dashboardSummary, fallback.dashboardSummary),
        confidence: (0, promptResponse_util_1.asConfidence)(parsed.confidence, fallback.confidence),
    };
}
function parseSupportPlanWorkflowResponse(content, fallback) {
    const parsed = (0, promptResponse_util_1.tryParsePromptJson)(content);
    if (!parsed) {
        return fallback;
    }
    const plan = parseStudyPlan(parsed.recommendedStudyPlan, fallback.recommendedStudyPlan);
    return {
        ...fallback,
        workflowType: 'support_plan',
        priority: (0, promptResponse_util_1.asSignalLevel)(parsed.priority, fallback.priority),
        studentId: (0, promptResponse_util_1.asNonEmptyString)(parsed.studentId, fallback.studentId),
        studentName: (0, promptResponse_util_1.asNonEmptyString)(parsed.studentName, fallback.studentName),
        lesson: (0, promptResponse_util_1.asNonEmptyString)(parsed.lesson, fallback.lesson),
        topic: (0, promptResponse_util_1.asNonEmptyString)(parsed.topic, fallback.topic),
        studentSummary: (0, promptResponse_util_1.asNonEmptyString)(parsed.studentSummary, fallback.studentSummary),
        supportReason: (0, promptResponse_util_1.asNonEmptyString)(parsed.supportReason, fallback.supportReason),
        recommendedStudyPlan: plan,
        practiceSuggestions: (0, promptResponse_util_1.asStringArray)(parsed.practiceSuggestions, fallback.practiceSuggestions),
        teacherNote: (0, promptResponse_util_1.asNonEmptyString)(parsed.teacherNote, fallback.teacherNote),
        studentMotivationMessage: (0, promptResponse_util_1.asNonEmptyString)(parsed.studentMotivationMessage, fallback.studentMotivationMessage),
        adaptiveUiSuggestion: parseAdaptiveUi(parsed.adaptiveUiSuggestion, fallback.adaptiveUiSuggestion),
        dashboardSummary: (0, promptResponse_util_1.asNonEmptyString)(parsed.dashboardSummary, fallback.dashboardSummary),
        confidence: (0, promptResponse_util_1.asConfidence)(parsed.confidence, fallback.confidence),
    };
}
function parseWeeklyReportWorkflowResponse(content, fallback) {
    const parsed = (0, promptResponse_util_1.tryParsePromptJson)(content);
    if (!parsed) {
        return fallback;
    }
    return {
        ...fallback,
        workflowType: 'weekly_report',
        teacherName: (0, promptResponse_util_1.asNonEmptyString)(parsed.teacherName, fallback.teacherName),
        classId: (0, promptResponse_util_1.asNonEmptyString)(parsed.classId, fallback.classId),
        className: (0, promptResponse_util_1.asNonEmptyString)(parsed.className, fallback.className),
        lesson: (0, promptResponse_util_1.asNonEmptyString)(parsed.lesson, fallback.lesson),
        week: (0, promptResponse_util_1.asNonEmptyString)(parsed.week, fallback.week),
        classSummary: (0, promptResponse_util_1.asNonEmptyString)(parsed.classSummary, fallback.classSummary),
        progressTrend: parseProgressTrend(parsed.progressTrend, fallback.progressTrend),
        mostDifficultTopic: (0, promptResponse_util_1.asNonEmptyString)(parsed.mostDifficultTopic, fallback.mostDifficultTopic),
        keyFindings: (0, promptResponse_util_1.asStringArray)(parsed.keyFindings, fallback.keyFindings),
        studentsNeedingSupportSummary: Array.isArray(parsed.studentsNeedingSupportSummary) &&
            parsed.studentsNeedingSupportSummary.length > 0
            ? parsed.studentsNeedingSupportSummary.map((item, index) => ({
                studentId: (0, promptResponse_util_1.asNonEmptyString)(item.studentId, fallback.studentsNeedingSupportSummary[index]?.studentId ??
                    'unknown'),
                studentName: (0, promptResponse_util_1.asNonEmptyString)(item.studentName, fallback.studentsNeedingSupportSummary[index]?.studentName ??
                    'Öğrenci'),
                reason: (0, promptResponse_util_1.asNonEmptyString)(item.reason, fallback.studentsNeedingSupportSummary[index]?.reason ?? ''),
                suggestedAction: (0, promptResponse_util_1.asNonEmptyString)(item.suggestedAction, fallback.studentsNeedingSupportSummary[index]?.suggestedAction ??
                    ''),
            }))
            : fallback.studentsNeedingSupportSummary,
        recommendedTeacherActions: (0, promptResponse_util_1.asStringArray)(parsed.recommendedTeacherActions, fallback.recommendedTeacherActions),
        nextWeekFocus: (0, promptResponse_util_1.asStringArray)(parsed.nextWeekFocus, fallback.nextWeekFocus),
        dashboardSummary: (0, promptResponse_util_1.asNonEmptyString)(parsed.dashboardSummary, fallback.dashboardSummary),
        confidence: (0, promptResponse_util_1.asConfidence)(parsed.confidence, fallback.confidence),
    };
}
function parsePerformanceLevel(value, fallback) {
    if (value === 'low' || value === 'medium' || value === 'high') {
        return value;
    }
    return fallback;
}
function parseProgressTrend(value, fallback) {
    if (value === 'improving' ||
        value === 'stable' ||
        value === 'decreasing') {
        return value;
    }
    return fallback;
}
function parseAdaptiveUi(value, fallback) {
    if (!value) {
        return fallback;
    }
    const contentStyles = ['visual', 'text', 'step_by_step', 'practice_based'];
    const difficulties = ['easier', 'same', 'harder'];
    const supportTypes = ['hint', 'example', 'repetition', 'challenge'];
    return {
        contentStyle: contentStyles.includes(value.contentStyle)
            ? value.contentStyle
            : fallback.contentStyle,
        quizDifficulty: difficulties.includes(value.quizDifficulty)
            ? value.quizDifficulty
            : fallback.quizDifficulty,
        supportType: supportTypes.includes(value.supportType)
            ? value.supportType
            : fallback.supportType,
    };
}
function parseStudyPlan(value, fallback) {
    if (!Array.isArray(value) || value.length === 0) {
        return fallback;
    }
    const steps = value
        .map((item, index) => {
        if (!item || typeof item !== 'object') {
            return fallback[index];
        }
        const row = item;
        return {
            step: typeof row.step === 'number' && row.step > 0
                ? row.step
                : index + 1,
            title: (0, promptResponse_util_1.asNonEmptyString)(row.title, fallback[index]?.title ?? 'Adım'),
            description: (0, promptResponse_util_1.asNonEmptyString)(row.description, fallback[index]?.description ?? ''),
            durationMinutes: typeof row.durationMinutes === 'number' && row.durationMinutes > 0
                ? Math.min(15, row.durationMinutes)
                : (fallback[index]?.durationMinutes ?? 10),
        };
    })
        .filter((step) => Boolean(step));
    return steps.length > 0 ? steps.slice(0, 3) : fallback;
}
//# sourceMappingURL=promptParsers.js.map