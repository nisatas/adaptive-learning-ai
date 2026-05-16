import { demoQuiz } from '../data/mockData';
import { getLastQuizResult, getStudentNotifications } from '../data/inMemoryStore';
import { getStudentName, isValidStudent } from './quiz.service';
import { StudentDashboardResponse, UiSettings } from '../types';

const DEFAULT_UI_SETTINGS: UiSettings = {
  largerText: false,
  showHints: true,
  stepByStepMode: false,
  reduceDistractions: false,
  showProgressFocus: true,
  showChallengeQuestions: false,
};

export class StudentDashboardServiceError extends Error {
  constructor(
    message: string,
    public statusCode: number
  ) {
    super(message);
    this.name = 'StudentDashboardServiceError';
  }
}

export function getStudentDashboard(
  studentId: string
): StudentDashboardResponse {
  if (!isValidStudent(studentId)) {
    throw new StudentDashboardServiceError(
      `Bilinmeyen öğrenci kimliği: ${studentId}`,
      404
    );
  }

  const live = getLastQuizResult(studentId);
  const notifications = getStudentNotifications(studentId);

  return {
    studentId,
    studentName: getStudentName(studentId),
    lesson: live?.lesson ?? demoQuiz.lesson,
    topic: live?.topic ?? demoQuiz.topic,
    score: live?.score ?? 0,
    studentMessage:
      live?.studentMessage ?? 'Kişiselleştirilmiş öğrenme görünümü hazır.',
    uiSettings: live?.uiSettings ?? DEFAULT_UI_SETTINGS,
    notifications,
  };
}
