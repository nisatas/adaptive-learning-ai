import {
  AdaptiveUiSuggestion,
  MeetWorkflowResponse,
  PerformanceLevel,
  ProgressTrend,
  QuizBehaviorAnalysisResponse,
  StudentAnalysisResponse,
  StudentFeedbackResponse,
  SupportPlanStudyStep,
  SupportPlanWorkflowResponse,
  TeacherDashboardAnalysisResponse,
  WeeklyReportWorkflowResponse,
} from './contracts/promptContracts';
import {
  asConfidence,
  asNonEmptyString,
  asSignalLevel,
  asStringArray,
  tryParsePromptJson,
} from './promptResponse.util';

export function parseStudentFeedbackResponse(
  content: string,
  fallback: StudentFeedbackResponse
): StudentFeedbackResponse {
  const parsed = tryParsePromptJson<StudentFeedbackResponse>(content);
  if (!parsed) {
    return fallback;
  }

  return {
    studentGreeting: asNonEmptyString(
      parsed.studentGreeting,
      fallback.studentGreeting
    ),
    shortFeedback: asNonEmptyString(parsed.shortFeedback, fallback.shortFeedback),
    motivationMessage: asNonEmptyString(
      parsed.motivationMessage,
      fallback.motivationMessage
    ),
    nextStep: asNonEmptyString(parsed.nextStep, fallback.nextStep),
    focusTopic: asNonEmptyString(parsed.focusTopic, fallback.focusTopic),
    confidence: asConfidence(parsed.confidence, fallback.confidence),
  };
}

export function parseStudentAnalysisResponse(
  content: string,
  fallback: StudentAnalysisResponse
): StudentAnalysisResponse {
  const parsed = tryParsePromptJson<StudentAnalysisResponse>(content);
  if (!parsed) {
    return fallback;
  }

  const ui = parsed.adaptiveUiSuggestion ?? fallback.adaptiveUiSuggestion;

  return {
    studentSummary: asNonEmptyString(
      parsed.studentSummary,
      fallback.studentSummary
    ),
    performanceLevel: parsePerformanceLevel(
      parsed.performanceLevel,
      fallback.performanceLevel
    ),
    attentionSignal: asSignalLevel(
      parsed.attentionSignal,
      fallback.attentionSignal
    ),
    difficultySignal: asSignalLevel(
      parsed.difficultySignal,
      fallback.difficultySignal
    ),
    strengths: asStringArray(parsed.strengths, fallback.strengths),
    needsSupport: asStringArray(parsed.needsSupport, fallback.needsSupport),
    recommendedNextSteps: asStringArray(
      parsed.recommendedNextSteps,
      fallback.recommendedNextSteps
    ),
    teacherNote: asNonEmptyString(parsed.teacherNote, fallback.teacherNote),
    adaptiveUiSuggestion: parseAdaptiveUi(ui, fallback.adaptiveUiSuggestion),
    confidence: asConfidence(parsed.confidence, fallback.confidence),
  };
}

export function parseQuizBehaviorResponse(
  content: string,
  fallback: QuizBehaviorAnalysisResponse
): QuizBehaviorAnalysisResponse {
  const parsed = tryParsePromptJson<QuizBehaviorAnalysisResponse>(content);
  if (!parsed) {
    return fallback;
  }

  return {
    interactionSummary: asNonEmptyString(
      parsed.interactionSummary,
      fallback.interactionSummary
    ),
    attentionSignal: asSignalLevel(
      parsed.attentionSignal,
      fallback.attentionSignal
    ),
    engagementSignal: asSignalLevel(
      parsed.engagementSignal,
      fallback.engagementSignal
    ),
    confidenceSignal: asSignalLevel(
      parsed.confidenceSignal,
      fallback.confidenceSignal
    ),
    behaviorNotes: asStringArray(parsed.behaviorNotes, fallback.behaviorNotes),
    safeInterpretation: asNonEmptyString(
      parsed.safeInterpretation,
      fallback.safeInterpretation
    ),
    confidence: asConfidence(parsed.confidence, fallback.confidence),
  };
}

export function parseTeacherDashboardResponse(
  content: string,
  fallback: TeacherDashboardAnalysisResponse
): TeacherDashboardAnalysisResponse {
  const parsed = tryParsePromptJson<TeacherDashboardAnalysisResponse>(content);
  if (!parsed) {
    return fallback;
  }

  return {
    classSummary: asNonEmptyString(parsed.classSummary, fallback.classSummary),
    mostDifficultTopic: asNonEmptyString(
      parsed.mostDifficultTopic,
      fallback.mostDifficultTopic
    ),
    studentsNeedingSupport:
      Array.isArray(parsed.studentsNeedingSupport) &&
      parsed.studentsNeedingSupport.length > 0
        ? parsed.studentsNeedingSupport.map((item, index) => ({
            studentId: asNonEmptyString(
              item.studentId,
              fallback.studentsNeedingSupport[index]?.studentId ?? 'unknown'
            ),
            studentName: asNonEmptyString(
              item.studentName,
              fallback.studentsNeedingSupport[index]?.studentName ?? 'Öğrenci'
            ),
            reason: asNonEmptyString(
              item.reason,
              fallback.studentsNeedingSupport[index]?.reason ?? ''
            ),
            suggestedAction: asNonEmptyString(
              item.suggestedAction,
              fallback.studentsNeedingSupport[index]?.suggestedAction ?? ''
            ),
            priority: asSignalLevel(
              item.priority,
              fallback.studentsNeedingSupport[index]?.priority ?? 'medium'
            ),
          }))
        : fallback.studentsNeedingSupport,
    challengeReadyStudents:
      Array.isArray(parsed.challengeReadyStudents) &&
      parsed.challengeReadyStudents.length > 0
        ? parsed.challengeReadyStudents.map((item, index) => ({
            studentId: asNonEmptyString(
              item.studentId,
              fallback.challengeReadyStudents[index]?.studentId ?? 'unknown'
            ),
            studentName: asNonEmptyString(
              item.studentName,
              fallback.challengeReadyStudents[index]?.studentName ??
                'Öğrenci'
            ),
            reason: asNonEmptyString(
              item.reason,
              fallback.challengeReadyStudents[index]?.reason ?? ''
            ),
            suggestedAction: asNonEmptyString(
              item.suggestedAction,
              fallback.challengeReadyStudents[index]?.suggestedAction ?? ''
            ),
          }))
        : fallback.challengeReadyStudents,
    recommendedTeacherActions: asStringArray(
      parsed.recommendedTeacherActions,
      fallback.recommendedTeacherActions
    ),
    workflowSuggestions:
      Array.isArray(parsed.workflowSuggestions) &&
      parsed.workflowSuggestions.length > 0
        ? parsed.workflowSuggestions.map((item, index) => ({
            type:
              item.type === 'meet_request' ||
              item.type === 'support_plan' ||
              item.type === 'weekly_report'
                ? item.type
                : (fallback.workflowSuggestions[index]?.type ?? 'weekly_report'),
            title: asNonEmptyString(
              item.title,
              fallback.workflowSuggestions[index]?.title ?? 'Öneri'
            ),
            reason: asNonEmptyString(
              item.reason,
              fallback.workflowSuggestions[index]?.reason ?? ''
            ),
            priority: asSignalLevel(
              item.priority,
              fallback.workflowSuggestions[index]?.priority ?? 'medium'
            ),
          }))
        : fallback.workflowSuggestions,
    confidence: asConfidence(parsed.confidence, fallback.confidence),
  };
}

export function parseMeetWorkflowResponse(
  content: string,
  fallback: MeetWorkflowResponse
): MeetWorkflowResponse {
  const parsed = tryParsePromptJson<MeetWorkflowResponse>(content);
  if (!parsed) {
    return fallback;
  }

  return {
    ...fallback,
    workflowType: 'meet_request',
    priority: asSignalLevel(parsed.priority, fallback.priority),
    studentName: asNonEmptyString(parsed.studentName, fallback.studentName),
    studentId: asNonEmptyString(parsed.studentId, fallback.studentId),
    lesson: asNonEmptyString(parsed.lesson, fallback.lesson),
    topic: asNonEmptyString(parsed.topic, fallback.topic),
    meetingReason: asNonEmptyString(
      parsed.meetingReason,
      fallback.meetingReason
    ),
    teacherMessage: asNonEmptyString(
      parsed.teacherMessage,
      fallback.teacherMessage
    ),
    suggestedDurationMinutes:
      typeof parsed.suggestedDurationMinutes === 'number' &&
      parsed.suggestedDurationMinutes > 0
        ? parsed.suggestedDurationMinutes
        : fallback.suggestedDurationMinutes,
    recommendedDateLabel: asNonEmptyString(
      parsed.recommendedDateLabel,
      fallback.recommendedDateLabel,
    ),
    recommendedTime: asNonEmptyString(
      parsed.recommendedTime,
      fallback.recommendedTime,
    ),
    suggestedAgenda: asStringArray(
      parsed.suggestedAgenda,
      fallback.suggestedAgenda
    ),
    studentSupportFocus: asStringArray(
      parsed.studentSupportFocus,
      fallback.studentSupportFocus
    ),
    parentOrGuardianNote: asNonEmptyString(
      parsed.parentOrGuardianNote,
      fallback.parentOrGuardianNote
    ),
    dashboardSummary: asNonEmptyString(
      parsed.dashboardSummary,
      fallback.dashboardSummary
    ),
    confidence: asConfidence(parsed.confidence, fallback.confidence),
  };
}

export function parseSupportPlanWorkflowResponse(
  content: string,
  fallback: SupportPlanWorkflowResponse
): SupportPlanWorkflowResponse {
  const parsed = tryParsePromptJson<SupportPlanWorkflowResponse>(content);
  if (!parsed) {
    return fallback;
  }

  const plan = parseStudyPlan(
    parsed.recommendedStudyPlan,
    fallback.recommendedStudyPlan
  );

  return {
    ...fallback,
    workflowType: 'support_plan',
    priority: asSignalLevel(parsed.priority, fallback.priority),
    studentId: asNonEmptyString(parsed.studentId, fallback.studentId),
    studentName: asNonEmptyString(parsed.studentName, fallback.studentName),
    lesson: asNonEmptyString(parsed.lesson, fallback.lesson),
    topic: asNonEmptyString(parsed.topic, fallback.topic),
    studentSummary: asNonEmptyString(
      parsed.studentSummary,
      fallback.studentSummary
    ),
    supportReason: asNonEmptyString(parsed.supportReason, fallback.supportReason),
    recommendedStudyPlan: plan,
    practiceSuggestions: asStringArray(
      parsed.practiceSuggestions,
      fallback.practiceSuggestions
    ),
    teacherNote: asNonEmptyString(parsed.teacherNote, fallback.teacherNote),
    studentMotivationMessage: asNonEmptyString(
      parsed.studentMotivationMessage,
      fallback.studentMotivationMessage
    ),
    adaptiveUiSuggestion: parseAdaptiveUi(
      parsed.adaptiveUiSuggestion,
      fallback.adaptiveUiSuggestion
    ),
    dashboardSummary: asNonEmptyString(
      parsed.dashboardSummary,
      fallback.dashboardSummary
    ),
    confidence: asConfidence(parsed.confidence, fallback.confidence),
  };
}

export function parseWeeklyReportWorkflowResponse(
  content: string,
  fallback: WeeklyReportWorkflowResponse
): WeeklyReportWorkflowResponse {
  const parsed = tryParsePromptJson<WeeklyReportWorkflowResponse>(content);
  if (!parsed) {
    return fallback;
  }

  return {
    ...fallback,
    workflowType: 'weekly_report',
    teacherName: asNonEmptyString(parsed.teacherName, fallback.teacherName),
    classId: asNonEmptyString(parsed.classId, fallback.classId),
    className: asNonEmptyString(parsed.className, fallback.className),
    lesson: asNonEmptyString(parsed.lesson, fallback.lesson),
    week: asNonEmptyString(parsed.week, fallback.week),
    classSummary: asNonEmptyString(parsed.classSummary, fallback.classSummary),
    progressTrend: parseProgressTrend(
      parsed.progressTrend,
      fallback.progressTrend
    ),
    mostDifficultTopic: asNonEmptyString(
      parsed.mostDifficultTopic,
      fallback.mostDifficultTopic
    ),
    keyFindings: asStringArray(parsed.keyFindings, fallback.keyFindings),
    studentsNeedingSupportSummary:
      Array.isArray(parsed.studentsNeedingSupportSummary) &&
      parsed.studentsNeedingSupportSummary.length > 0
        ? parsed.studentsNeedingSupportSummary.map((item, index) => ({
            studentId: asNonEmptyString(
              item.studentId,
              fallback.studentsNeedingSupportSummary[index]?.studentId ??
                'unknown'
            ),
            studentName: asNonEmptyString(
              item.studentName,
              fallback.studentsNeedingSupportSummary[index]?.studentName ??
                'Öğrenci'
            ),
            reason: asNonEmptyString(
              item.reason,
              fallback.studentsNeedingSupportSummary[index]?.reason ?? ''
            ),
            suggestedAction: asNonEmptyString(
              item.suggestedAction,
              fallback.studentsNeedingSupportSummary[index]?.suggestedAction ??
                ''
            ),
          }))
        : fallback.studentsNeedingSupportSummary,
    recommendedTeacherActions: asStringArray(
      parsed.recommendedTeacherActions,
      fallback.recommendedTeacherActions
    ),
    nextWeekFocus: asStringArray(parsed.nextWeekFocus, fallback.nextWeekFocus),
    dashboardSummary: asNonEmptyString(
      parsed.dashboardSummary,
      fallback.dashboardSummary
    ),
    confidence: asConfidence(parsed.confidence, fallback.confidence),
  };
}

function parsePerformanceLevel(
  value: unknown,
  fallback: PerformanceLevel
): PerformanceLevel {
  if (value === 'low' || value === 'medium' || value === 'high') {
    return value;
  }
  return fallback;
}

function parseProgressTrend(
  value: unknown,
  fallback: ProgressTrend
): ProgressTrend {
  if (
    value === 'improving' ||
    value === 'stable' ||
    value === 'decreasing'
  ) {
    return value;
  }
  return fallback;
}

function parseAdaptiveUi(
  value: Partial<AdaptiveUiSuggestion> | undefined,
  fallback: AdaptiveUiSuggestion
): AdaptiveUiSuggestion {
  if (!value) {
    return fallback;
  }

  const contentStyles = ['visual', 'text', 'step_by_step', 'practice_based'] as const;
  const difficulties = ['easier', 'same', 'harder'] as const;
  const supportTypes = ['hint', 'example', 'repetition', 'challenge'] as const;

  return {
    contentStyle: contentStyles.includes(value.contentStyle as typeof contentStyles[number])
      ? (value.contentStyle as AdaptiveUiSuggestion['contentStyle'])
      : fallback.contentStyle,
    quizDifficulty: difficulties.includes(
      value.quizDifficulty as typeof difficulties[number]
    )
      ? (value.quizDifficulty as AdaptiveUiSuggestion['quizDifficulty'])
      : fallback.quizDifficulty,
    supportType: supportTypes.includes(
      value.supportType as typeof supportTypes[number]
    )
      ? (value.supportType as AdaptiveUiSuggestion['supportType'])
      : fallback.supportType,
  };
}

function parseStudyPlan(
  value: unknown,
  fallback: SupportPlanStudyStep[]
): SupportPlanStudyStep[] {
  if (!Array.isArray(value) || value.length === 0) {
    return fallback;
  }

  const steps = value
    .map((item, index) => {
      if (!item || typeof item !== 'object') {
        return fallback[index];
      }
      const row = item as Partial<SupportPlanStudyStep>;
      return {
        step:
          typeof row.step === 'number' && row.step > 0
            ? row.step
            : index + 1,
        title: asNonEmptyString(row.title, fallback[index]?.title ?? 'Adım'),
        description: asNonEmptyString(
          row.description,
          fallback[index]?.description ?? ''
        ),
        durationMinutes:
          typeof row.durationMinutes === 'number' && row.durationMinutes > 0
            ? Math.min(15, row.durationMinutes)
            : (fallback[index]?.durationMinutes ?? 10),
      };
    })
    .filter((step): step is SupportPlanStudyStep => Boolean(step));

  return steps.length > 0 ? steps.slice(0, 3) : fallback;
}
