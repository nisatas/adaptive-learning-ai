export interface StudentNotification {
  id: string;
  type: string;
  title: string;
  message: string;
  lesson: string;
  topic: string;
  duration?: number;
  status: 'read' | 'unread';
}

export interface LearningSummary {
  activeLesson: string;
  activeTopic: string;
  lastQuizScore: number;
  progressPercentage: number;
}

export interface SupportPlan {
  title: string;
  description: string;
  steps: string[];
  nextQuizDifficulty: string;
}

export interface TodayRecommendation {
  title: string;
  message: string;
  actionLabel: string;
  targetRoute: string;
}

export interface StudentUiSettings {
  largerText: boolean;
  showHints: boolean;
  stepByStepMode: boolean;
  reduceDistractions: boolean;
  showProgressFocus: boolean;
  showChallengeQuestions: boolean;
}

export interface StudentPanelResponse {
  studentId: string;
  studentName: string;
  lesson: string;
  topic: string;
  score: number;
  studentMessage: string;
  learningSummary: LearningSummary;
  supportPlan: SupportPlan;
  todayRecommendation: TodayRecommendation;
  uiSettings: StudentUiSettings;
  notifications: StudentNotification[];
}