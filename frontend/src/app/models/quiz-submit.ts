import { AdaptiveLearningState, LearningMode, SupportProfile } from './learning-mode';
import { UiSettings } from './ui-settings';

export interface QuizAnswer {
  questionId: string;
  selectedOptionId: string;
  timeSpentSeconds: number;
  skipped: boolean;
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

export interface QuizSubmitRequest {
  studentId: string;
  answers: QuizAnswer[];
  quizMeta?: QuizSubmissionMeta;
}

export interface QuizSubmitResponse extends AdaptiveLearningState {
  studentId: string;
  score: number;
  correctCount: number;
  wrongCount: number;
  studentMessage: string;
  uiSettings: UiSettings;
  learningMode: LearningMode;
  learningModeLabel: string;
  supportProfile: SupportProfile;
  recommendation: string;
  topicId?: string;
}
