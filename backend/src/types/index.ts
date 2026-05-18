// --- Core entities ---

export interface Student {
  studentId: string;
  name: string;
  className: string;
}

export interface QuestionOption {
  id: string;
  text: string;
}

export interface Question {
  questionId: string;
  questionText: string;
  topic: string;
  options: QuestionOption[];
  correctOptionId: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface Quiz {
  quizId: string;
  lesson: string;
  gradeLevel: number;
  topic: string;
  questions: Question[];
}

export interface QuestionPublic {
  questionId: string;
  questionText: string;
  topic: string;
  options: QuestionOption[];
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface QuizPublic {
  quizId: string;
  lesson: string;
  gradeLevel: number;
  topic: string;
  totalQuestions: number;
  questions: QuestionPublic[];
}

// --- Quiz submission ---

export interface QuizAnswerSubmission {
  questionId: string;
  selectedOptionId?: string;
  timeSpentSeconds?: number;
  skipped?: boolean;
}

export interface QuizAnswerDetailMeta {
  questionId: string;
  topic: string;
  isCorrect: boolean;
  timeSpentSeconds: number;
}

export interface QuizSubmissionMeta {
  topicId: string;
  totalQuestions: number;
  correctCount: number;
  wrongCount: number;
  score: number;
  answerDetails: QuizAnswerDetailMeta[];
}

export interface QuizSubmissionRequest {
  studentId: string;
  answers: QuizAnswerSubmission[];
  /** Paragraf / konu bazlı mini quiz gönderiminde kullanılır */
  quizMeta?: QuizSubmissionMeta;
}

/** Internal — includes question ids for adaptation engine */
export interface BehaviorSignals {
  fastWrongAnswers: number;
  longHesitations: number;
  skippedQuestions: number;
  totalTimeSeconds: number;
  slowQuestionIds: string[];
  hesitationCount: number;
}

export type LearningSignalLevel = 'low' | 'medium' | 'high';

/** Student-facing — numeric core + optional safe AI interpretation */
export interface BehaviorSignalsPublic {
  fastWrongAnswers: number;
  longHesitations: number;
  skippedQuestions: number;
  totalTimeSeconds: number;
  /** Pedagojik etkileşim özeti (AI veya fallback) */
  interactionSummary?: string;
  safeInterpretation?: string;
  behaviorNotes?: string[];
  attentionSignal?: LearningSignalLevel;
  engagementSignal?: LearningSignalLevel;
  confidenceSignal?: LearningSignalLevel;
  analysisConfidence?: LearningSignalLevel;
}

export interface UiSettings {
  largerText: boolean;
  showHints: boolean;
  stepByStepMode: boolean;
  reduceDistractions: boolean;
  showProgressFocus: boolean;
  showChallengeQuestions: boolean;
  simplifiedLayout?: boolean;
  increasedLineHeight?: boolean;
  highlightKeywords?: boolean;
}

export type LearningMode = 'STANDARD' | 'PERSONALIZED';

export type SupportProfile =
  | 'focus_support'
  | 'reading_support'
  | 'balanced_support'
  | null;

export type InternalLearningProfile =
  | 'FOCUS_SUPPORT'
  | 'STEP_BY_STEP'
  | 'READING_FRIENDLY'
  | 'CHALLENGE_MODE'
  | 'BALANCED';

export interface AdaptationResult {
  internalProfile: InternalLearningProfile;
  uiSettings: UiSettings;
  studentMessage: string;
  learningMode: LearningMode;
  learningModeLabel: string;
  supportProfile: SupportProfile;
  recommendation: string;
}

export interface QuizResultResponse {
  studentId: string;
  quizId: string;
  lesson: string;
  gradeLevel: number;
  topic: string;
  totalQuestions: number;
  score: number;
  correctCount: number;
  wrongCount: number;
  skippedCount: number;
  averageTimeSeconds: number;
  mostDifficultTopic: string;
  studentMessage: string;
  uiSettings: UiSettings;
  behaviorSignals: BehaviorSignalsPublic;
  learningMode: LearningMode;
  learningModeLabel: string;
  supportProfile: SupportProfile;
  recommendation: string;
  topicId?: string;
}

export interface StoredQuizResult extends QuizResultResponse {
  behaviorSignalsInternal: BehaviorSignals;
  internalProfile: InternalLearningProfile;
  submittedAt: string;
}

// --- Teacher ---

export type RecommendedAction = string;

export interface SupportDistributionItem {
  label: string;
  percentage: number;
  count: number;
}

export type PuqAiAgentFeedItemType = 'insight' | 'recommendation' | 'adaptation';

export interface PuqAiAgentFeedItem {
  id: string;
  type: PuqAiAgentFeedItemType;
  title: string;
  message: string;
  source: string;
  /** ISO 8601 */
  createdAt: string;
}

export interface TeacherDashboardFrontendHints {
  recommendedActionsTarget: string;
  supportDistributionTarget: string;
  agentFeedTarget: string;
  settingsStatus: string;
}

export type TeacherSupportPriority = 'low' | 'medium' | 'high';

export interface TeacherDashboardStudentNeedingSupport {
  studentId: string;
  studentName: string;
  lesson: string;
  topic: string;
  reason: string;
  suggestedAction: string;
  priority: TeacherSupportPriority;
}

export type TeacherDashboardProgressTrend =
  | 'improving'
  | 'stable'
  | 'declining';

export interface TeacherDashboardWeeklyReport {
  workflowType: 'weekly_report';
  classSummary: string;
  progressTrend: TeacherDashboardProgressTrend;
  mostDifficultTopic: string;
  keyFindings: string[];
  studentsNeedingSupportSummary: string[];
  recommendedTeacherActions: string[];
  nextWeekFocus: string[];
}

/** Frontend meet listesi — dashboard.html `students` alanı */
export interface TeacherDashboardMeetStudent {
  id: string;
  name: string;
  email: string;
  lesson: string;
  topic: string;
  reason: string;
  suggestedDuration: number;
  priority: TeacherSupportPriority;
}

export interface TeacherDashboardSummary {
  className: string;
  lesson: string;
  topic: string;
  studentCount: number;
  classAverage: number;
  averageResponseTime: number;
  supportSuggestedCount: number;
  challengeReadyCount: number;
  mostDifficultTopic: string;
  lastUpdated: string;
  teacherName: string;
  teacherRole: string;
  recommendedActions: RecommendedAction[];
  supportDistribution: SupportDistributionItem[];
  puqAiAgentFeed: PuqAiAgentFeedItem[];
  frontendHints: TeacherDashboardFrontendHints;
  studentsNeedingSupport: TeacherDashboardStudentNeedingSupport[];
  students: TeacherDashboardMeetStudent[];
  weeklyReport: TeacherDashboardWeeklyReport;
}

export type TeacherStudentLastQuizStatus = 'Tamamlandı' | 'Bekleniyor';

export interface TeacherStudentListItem {
  studentId: string;
  studentName: string;
  score: number;
  averageTimeSeconds: number;
  mostDifficultTopic: string;
  supportSummary: string;
  personalizationStatus: string;
  lastQuizStatus: TeacherStudentLastQuizStatus;
}

export interface TeacherStudentsListResponse {
  className: string;
  lesson: string;
  topic: string;
  students: TeacherStudentListItem[];
}

export type AiStatus =
  | 'configured'
  | 'missing_config'
  | 'request_failed'
  | 'fallback';

export interface AiMetadata {
  aiProvider: 'Puq.ai';
  aiUsed: boolean;
  fallbackUsed: boolean;
  aiStatus: AiStatus;
  generatedAt: string;
}

export interface TeacherReport extends AiMetadata {
  studentId: string;
  studentName: string;
  lesson: string;
  gradeLevel: number;
  topic: string;
  score: number;
  totalQuestions: number;
  correctCount: number;
  wrongCount: number;
  skippedCount: number;
  averageTimeSeconds: number;
  mostDifficultTopic: string;
  behaviorObservation: string;
  systemRecommendation: string;
  aiTeacherNote: string;
  reportSource: 'live' | 'default';
  persisted?: boolean;
}

// --- Puq.ai / health ---

export interface TeacherInsightInput {
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

/** Internal structured insight before metadata wrapping */
export interface TeacherInsightReport {
  summary: string;
  observations: string[];
  recommendations: string[];
  teacherNote?: string;
  generatedBy: 'puq-ai' | 'fallback';
}

export type PuqAiErrorType =
  | 'AUTH_ERROR'
  | 'CREDIT_ERROR'
  | 'ENDPOINT_NOT_FOUND'
  | 'NETWORK_ERROR'
  | 'SSL_ERROR'
  | 'UNKNOWN_ERROR';

export interface PuqAiErrorMetadata {
  statusCode?: number | null;
  errorType?: PuqAiErrorType;
  safeMessage?: string;
}

export interface AiModelsResponse extends PuqAiErrorMetadata {
  provider: 'Puq.ai';
  configured: boolean;
  success: boolean;
  models: string[];
  message: string;
}

export interface PuqAiInsightResult extends PuqAiErrorMetadata {
  text: string;
  summary: string;
  observations: string[];
  recommendations: string[];
  aiProvider: 'Puq.ai';
  aiUsed: boolean;
  fallbackUsed: boolean;
  aiStatus: AiStatus;
  generatedAt: string;
}

export interface AiTestTeacherReportRequest {
  studentName?: string;
  lesson: string;
  gradeLevel: number;
  topic: string;
  score: number;
  totalQuestions: number;
  correctCount: number;
  wrongCount: number;
  skippedCount: number;
  averageTimeSeconds: number;
  mostDifficultTopic: string;
  behaviorSignals?: BehaviorSignalsPublic;
}

export interface AiTestTeacherReportResponse extends AiMetadata, PuqAiErrorMetadata {
  teacherInsight: string;
}

export interface ChatEndpointProbeResult {
  endpoint: string;
  success: boolean;
  statusCode: number | null;
  errorType?: PuqAiErrorType;
  safeMessage?: string;
  message?: string;
  sampleText?: string;
}

export interface ChatEndpointProbeResponse {
  provider: 'Puq.ai';
  configured: boolean;
  tested: ChatEndpointProbeResult[];
  message: string;
}

export interface AiDiagnosticsResponse {
  node: {
    version: string;
    openssl: string;
    platform: string;
    arch: string;
  };
  tls: {
    nodeTlsRejectUnauthorized: 'set' | 'not_set';
    extraCaCerts: 'set' | 'not_set';
  };
  puqAi: {
    baseUrlConfigured: boolean;
    chatEndpointConfigured: boolean;
    modelConfigured: boolean;
    apiKeyConfigured: boolean;
    apiKeyPreview: 'hidden';
  };
  recommendation: string;
}

export interface HealthResponse {
  status: string;
  message: string;
}

export interface AiStatusResponse {
  provider: string;
  configured: boolean;
  requiredVariables: Record<string, boolean>;
  message: string;
}

// --- Workflows ---

export type WorkflowTriggerType = 'student_meet_request';

export type WorkflowPriority = 'low' | 'medium' | 'high';

export interface WorkflowTriggerRequest {
  workflowType: WorkflowTriggerType | string;
  teacherName?: string;
  teacherEmail?: string;
  studentName?: string;
  studentEmail?: string;
  lesson?: string;
  topic?: string;
  reason?: string;
  suggestedDuration?: number;
  selectedDate?: string;
  selectedTime?: string;
  priority?: WorkflowPriority | string;
}

export interface WorkflowTriggerResponse {
  success: boolean;
  message: string;
  notificationCreated: boolean;
}

export type StudentNotificationType = 'meet';

export type StudentNotificationStatus = 'unread' | 'read';

export interface StudentNotification {
  id: string;
  type: StudentNotificationType;
  title: string;
  message: string;
  lesson: string;
  topic: string;
  duration: number;
  scheduledDate?: string;
  scheduledTime?: string;
  dateDisplayLabel?: string;
  status: StudentNotificationStatus;
}

export interface StudentDashboardLearningSummary {
  activeLesson: string;
  activeTopic: string;
  lastQuizScore: number;
  progressPercentage: number;
}

export interface StudentDashboardSupportPlan {
  title: string;
  description: string;
  steps: string[];
  nextQuizDifficulty: string;
}

export interface StudentDashboardTodayRecommendation {
  title: string;
  message: string;
  actionLabel: string;
  targetRoute: string;
}

export interface StudentDashboardResponse {
  studentId: string;
  studentName: string;
  lesson: string;
  topic: string;
  score: number;
  studentMessage: string;
  learningSummary: StudentDashboardLearningSummary;
  supportPlan: StudentDashboardSupportPlan;
  todayRecommendation: StudentDashboardTodayRecommendation;
  uiSettings: UiSettings;
  notifications: StudentNotification[];
  learningMode?: LearningMode;
  learningModeLabel?: string;
  supportProfile?: SupportProfile;
  recommendation?: string;
}
