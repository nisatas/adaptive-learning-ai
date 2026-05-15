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

export interface QuizSubmissionRequest {
  studentId: string;
  answers: QuizAnswerSubmission[];
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

/** Student-facing — numeric only, no diagnostic labels */
export interface BehaviorSignalsPublic {
  fastWrongAnswers: number;
  longHesitations: number;
  skippedQuestions: number;
  totalTimeSeconds: number;
}

export interface UiSettings {
  largerText: boolean;
  showHints: boolean;
  stepByStepMode: boolean;
  reduceDistractions: boolean;
  showProgressFocus: boolean;
  showChallengeQuestions: boolean;
}

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
}

export interface StoredQuizResult extends QuizResultResponse {
  behaviorSignalsInternal: BehaviorSignals;
  internalProfile: InternalLearningProfile;
  submittedAt: string;
}

// --- Teacher ---

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
}

export interface TeacherStudentListItem {
  studentId: string;
  studentName: string;
  score: number;
  averageTimeSeconds: number;
  mostDifficultTopic: string;
  supportSummary: string;
  personalizationStatus: string;
}

export interface TeacherStudentsListResponse {
  className: string;
  lesson: string;
  topic: string;
  students: TeacherStudentListItem[];
}

export interface TeacherReport {
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

export interface TeacherInsightReport {
  summary: string;
  observations: string[];
  recommendations: string[];
  generatedBy: 'puq-ai' | 'fallback';
}

export interface HealthResponse {
  status: string;
  message: string;
}

export interface AiStatusResponse {
  provider: string;
  configured: boolean;
  message: string;
}
