import { CLASS_META, demoQuiz, mockStudentProfiles } from '../data/mockData';
import { getLastSubmitAt, getLastQuizResult } from '../data/inMemoryStore';
import {
  buildPersonalizationStatus,
  buildSupportSummary,
} from './adaptation.service';
import {
  TeacherDashboardSummary,
  TeacherStudentListItem,
  TeacherStudentsListResponse,
} from '../types';

export function getTeacherDashboard(): TeacherDashboardSummary {
  return {
    ...CLASS_META,
    lastUpdated: getLastSubmitAt(),
  };
}

export function getTeacherStudentsList(): TeacherStudentsListResponse {
  const students: TeacherStudentListItem[] = mockStudentProfiles.map(
    (profile) => {
      const live = getLastQuizResult(profile.studentId);

      if (live) {
        return {
          studentId: profile.studentId,
          studentName: profile.name,
          score: live.score,
          averageTimeSeconds: live.averageTimeSeconds,
          mostDifficultTopic: live.mostDifficultTopic,
          supportSummary: buildSupportSummary(live.score),
          personalizationStatus: buildPersonalizationStatus(
            live.internalProfile
          ),
        };
      }

      return {
        studentId: profile.studentId,
        studentName: profile.name,
        score: profile.score,
        averageTimeSeconds: profile.averageTimeSeconds,
        mostDifficultTopic: profile.mostDifficultTopic,
        supportSummary: profile.supportSummary,
        personalizationStatus: profile.personalizationStatus,
      };
    }
  );

  return {
    className: CLASS_META.className,
    lesson: demoQuiz.lesson,
    topic: demoQuiz.topic,
    students,
  };
}
