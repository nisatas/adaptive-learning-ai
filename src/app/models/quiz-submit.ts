import { UiSettings } from './ui-settings';

export interface QuizAnswer {
  questionId: string;
  selectedOptionId: string;
  timeSpentSeconds: number;
  skipped: boolean;
}

export interface QuizSubmitRequest {
  studentId: string;
  answers: QuizAnswer[];
}

export interface QuizSubmitResponse {
  message: string;
  uiSettings: UiSettings;
}