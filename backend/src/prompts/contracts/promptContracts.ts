/** Shared signal levels for prompt JSON outputs */
export type SignalLevel = 'low' | 'medium' | 'high';

export type WorkflowPriority = 'low' | 'medium' | 'high';

export type ConfidenceLevel = 'low' | 'medium' | 'high';

export type PerformanceLevel = 'low' | 'medium' | 'high';

export type ProgressTrend = 'improving' | 'stable' | 'decreasing';

export type ContentStyle = 'visual' | 'text' | 'step_by_step' | 'practice_based';

export type QuizDifficultySuggestion = 'easier' | 'same' | 'harder';

export type SupportTypeSuggestion = 'hint' | 'example' | 'repetition' | 'challenge';

export type WorkflowSuggestionType =
  | 'meet_request'
  | 'support_plan'
  | 'weekly_report';

export interface AdaptiveUiSuggestion {
  contentStyle: ContentStyle;
  quizDifficulty: QuizDifficultySuggestion;
  supportType: SupportTypeSuggestion;
}

// --- Student feedback ---

export interface StudentFeedbackPromptInput {
  studentName?: string;
  lesson: string;
  topic: string;
  quizScore: number;
  classAverage?: number;
  mostDifficultTopic?: string;
  correctCount?: number;
  wrongCount?: number;
  skippedCount?: number;
  averageTimeSeconds?: number;
  difficultySignal?: SignalLevel;
  /** Öğrenme etkileşim sinyali — kesin dikkat ölçümü değildir */
  attentionSignal?: SignalLevel;
}

export interface StudentFeedbackResponse {
  studentGreeting: string;
  shortFeedback: string;
  motivationMessage: string;
  nextStep: string;
  focusTopic: string;
  confidence: ConfidenceLevel;
}

// --- Student analysis ---

export interface StudentAnalysisPromptInput {
  studentName?: string;
  lesson: string;
  topic: string;
  quizScore: number;
  classAverage?: number;
  mostDifficultTopic?: string;
  averageTimeSeconds?: number;
  behaviorSignals?: {
    fastWrongAnswers?: number;
    longHesitations?: number;
    skippedQuestions?: number;
    totalTimeSeconds?: number;
  };
  interactionSignals?: {
    idleTimeSeconds?: number;
    focusLostCount?: number;
    answerChangeCount?: number;
    mouseMovementLevel?: SignalLevel;
  };
}

export interface StudentAnalysisResponse {
  studentSummary: string;
  performanceLevel: PerformanceLevel;
  attentionSignal: SignalLevel;
  difficultySignal: SignalLevel;
  strengths: string[];
  needsSupport: string[];
  recommendedNextSteps: string[];
  teacherNote: string;
  adaptiveUiSuggestion: AdaptiveUiSuggestion;
  confidence: ConfidenceLevel;
}

// --- Quiz behavior ---

export interface QuizBehaviorPromptInput {
  studentId?: string;
  studentName?: string;
  lesson: string;
  topic: string;
  quizScore?: number;
  averageTimeSeconds?: number;
  answerChangeCount?: number;
  idleTimeMs?: number;
  mouseMovementCount?: number;
  mouseDirectionChanges?: number;
  focusLostCount?: number;
  optionHoverCount?: number;
  difficultySignal?: SignalLevel;
  attentionSignal?: SignalLevel;
  skippedQuestions?: number;
  longHesitations?: number;
  /** @deprecated use idleTimeMs */
  idleTimeSeconds?: number;
  mouseMovementLevel?: SignalLevel;
}

export interface QuizBehaviorAnalysisResponse {
  interactionSummary: string;
  attentionSignal: SignalLevel;
  engagementSignal: SignalLevel;
  confidenceSignal: SignalLevel;
  behaviorNotes: string[];
  safeInterpretation: string;
  confidence: ConfidenceLevel;
}

// --- Teacher dashboard ---

export interface TeacherDashboardStudentSnapshot {
  studentId: string;
  studentName: string;
  score: number;
  averageTimeSeconds: number;
  mostDifficultTopic: string;
  supportSummary?: string;
  lastQuizStatus?: string;
}

export interface TeacherDashboardPromptInput {
  teacherName?: string;
  className: string;
  lesson: string;
  topic: string;
  classAverage: number;
  averageResponseTime: number;
  supportSuggestedCount: number;
  challengeReadyCount: number;
  mostDifficultTopic: string;
  students: TeacherDashboardStudentSnapshot[];
}

export interface TeacherDashboardStudentAction {
  studentId: string;
  studentName: string;
  reason: string;
  suggestedAction: string;
  priority: WorkflowPriority;
}

export interface TeacherDashboardChallengeStudent {
  studentId: string;
  studentName: string;
  reason: string;
  suggestedAction: string;
}

export interface TeacherDashboardWorkflowSuggestion {
  type: WorkflowSuggestionType;
  title: string;
  reason: string;
  priority: WorkflowPriority;
}

export interface TeacherDashboardAnalysisResponse {
  classSummary: string;
  mostDifficultTopic: string;
  studentsNeedingSupport: TeacherDashboardStudentAction[];
  challengeReadyStudents: TeacherDashboardChallengeStudent[];
  recommendedTeacherActions: string[];
  workflowSuggestions: TeacherDashboardWorkflowSuggestion[];
  confidence: ConfidenceLevel;
}

// --- Workflows ---

export interface MeetPlanningPromptInput {
  studentId: string;
  studentName: string;
  lesson: string;
  topic: string;
  quizScore?: number;
  mostDifficultTopic?: string;
  supportReason?: string;
  classAverage?: number;
}

export interface MeetWorkflowResponse {
  workflowType: 'meet_request';
  priority: WorkflowPriority;
  studentName: string;
  studentId: string;
  lesson: string;
  topic: string;
  meetingReason: string;
  teacherMessage: string;
  suggestedDurationMinutes: number;
  recommendedDateLabel: string;
  recommendedTime: string;
  suggestedAgenda: string[];
  studentSupportFocus: string[];
  parentOrGuardianNote: string;
  dashboardSummary: string;
  confidence: ConfidenceLevel;
}

export interface SupportPlanPromptInput {
  studentId: string;
  studentName: string;
  lesson: string;
  topic: string;
  quizScore?: number;
  mostDifficultTopic?: string;
  difficultySignal?: SignalLevel;
  behaviorSummary?: string;
}

export interface SupportPlanStudyStep {
  step: number;
  title: string;
  description: string;
  durationMinutes: number;
}

export interface SupportPlanWorkflowResponse {
  workflowType: 'support_plan';
  priority: WorkflowPriority;
  studentId: string;
  studentName: string;
  lesson: string;
  topic: string;
  studentSummary: string;
  supportReason: string;
  recommendedStudyPlan: SupportPlanStudyStep[];
  practiceSuggestions: string[];
  teacherNote: string;
  studentMotivationMessage: string;
  adaptiveUiSuggestion: AdaptiveUiSuggestion;
  dashboardSummary: string;
  confidence: ConfidenceLevel;
}

export interface WeeklyReportPromptInput {
  teacherName?: string;
  classId?: string;
  className: string;
  lesson: string;
  topic: string;
  week?: string;
  classAverage: number;
  previousWeekAverage?: number;
  mostDifficultTopic: string;
  studentCount: number;
  supportSuggestedCount: number;
  studentsNeedingSupport?: TeacherDashboardStudentSnapshot[];
}

export interface WeeklyReportSupportSummaryItem {
  studentId: string;
  studentName: string;
  reason: string;
  suggestedAction: string;
}

export interface WeeklyReportWorkflowResponse {
  workflowType: 'weekly_report';
  teacherName: string;
  classId: string;
  className: string;
  lesson: string;
  week: string;
  classSummary: string;
  progressTrend: ProgressTrend;
  mostDifficultTopic: string;
  keyFindings: string[];
  studentsNeedingSupportSummary: WeeklyReportSupportSummaryItem[];
  recommendedTeacherActions: string[];
  nextWeekFocus: string[];
  dashboardSummary: string;
  confidence: ConfidenceLevel;
}

// --- Legacy teacher insight (existing Puq.ai report contract) ---

export interface TeacherInsightPromptInput {
  quizTitle?: string;
  totalQuestions: number;
  correctCount: number;
  wrongCount: number;
  skippedCount: number;
  averageAnswerTimeMs?: number;
  slowQuestionIds?: string[];
  hesitationCount?: number;
  mostDifficultTopic?: string;
}

export interface TeacherInsightPromptJson {
  summary: string;
  observations: string[];
  recommendations: string[];
  teacherNote?: string;
}
