import { demoQuiz } from '../data/mockData';
import { getLastQuizResult, getStudentNotifications } from '../data/inMemoryStore';
import { getStudentName, isValidStudent } from './quiz.service';
import {
  StudentDashboardLearningSummary,
  StudentDashboardResponse,
  StudentDashboardSupportPlan,
  StudentDashboardTodayRecommendation,
  UiSettings,
} from '../types';

const DEFAULT_UI_SETTINGS: UiSettings = {
  largerText: false,
  showHints: true,
  stepByStepMode: false,
  reduceDistractions: false,
  showProgressFocus: true,
  showChallengeQuestions: false,
};

const DEFAULT_ACTIVE_LESSON = 'Türkçe';
const DEFAULT_ACTIVE_TOPIC = 'Paragrafta Anlam';
const DEFAULT_LAST_QUIZ_SCORE = 68;
const DEFAULT_PROGRESS_PERCENTAGE = 35;

const SUPPORT_PLAN_TITLE = 'AI Destek Planın';
const SUPPORT_PLAN_DESCRIPTION = 'Quiz sonrası kişisel çalışma planı';

const TODAY_RECOMMENDATION_TITLE = 'Bugünkü Önerilen Adım';
const TODAY_RECOMMENDATION_ACTION_LABEL = 'Konuya Devam Et';

type StudentDashboardBuildInput = Pick<
  StudentDashboardResponse,
  'studentId' | 'studentName' | 'lesson' | 'topic' | 'score'
>;

function safeStr(value: unknown, fallback: string): string {
  if (value == null) {
    return fallback;
  }
  const text = String(value).trim();
  return text.length > 0 ? text : fallback;
}

function safeScore(value: unknown, fallback = DEFAULT_LAST_QUIZ_SCORE): number {
  const n = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(n)) {
    return fallback;
  }
  return Math.min(100, Math.max(0, Math.round(n)));
}

function normalizeProgressPercentage(
  value: unknown,
  lastQuizScore: number,
  hasQuizResult: boolean
): number {
  const n = typeof value === 'number' ? value : Number(value);
  if (Number.isFinite(n)) {
    return Math.min(100, Math.max(0, Math.round(n)));
  }

  if (hasQuizResult && lastQuizScore > 0) {
    return Math.min(100, Math.max(0, Math.round(lastQuizScore * 0.515)));
  }

  return DEFAULT_PROGRESS_PERCENTAGE;
}

function resolveLastQuizScore(
  score: number,
  hasQuizResult: boolean
): number {
  if (hasQuizResult) {
    return safeScore(score, DEFAULT_LAST_QUIZ_SCORE);
  }
  if (Number.isFinite(score) && score > 0) {
    return safeScore(score, DEFAULT_LAST_QUIZ_SCORE);
  }
  return DEFAULT_LAST_QUIZ_SCORE;
}

export function buildLearningSummary(
  dashboard: StudentDashboardBuildInput,
  hasQuizResult = false
): StudentDashboardLearningSummary {
  const activeLesson = safeStr(dashboard.lesson, DEFAULT_ACTIVE_LESSON);
  const activeTopic = safeStr(dashboard.topic, DEFAULT_ACTIVE_TOPIC);
  const lastQuizScore = resolveLastQuizScore(dashboard.score, hasQuizResult);
  const progressPercentage = normalizeProgressPercentage(
    undefined,
    lastQuizScore,
    hasQuizResult
  );

  return {
    activeLesson,
    activeTopic,
    lastQuizScore,
    progressPercentage,
  };
}

function buildSupportPlanSteps(lastQuizScore: number): string[] {
  if (lastQuizScore >= 85) {
    return [
      '5 dk hızlı tekrar',
      '10 dk yeni nesil soru çözümü',
      'Zorlayıcı mini quiz',
    ];
  }

  if (lastQuizScore >= 70) {
    return [
      '10 dk konu tekrarı',
      '10 dk orta seviye örnek çözüm',
      '5 soruluk pekiştirme quizi',
    ];
  }

  return [
    '10 dk konu tekrarı',
    '10 dk örnek çözüm',
    '5 soruluk mini quiz',
  ];
}

function buildNextQuizDifficulty(lastQuizScore: number): string {
  if (lastQuizScore < 70) {
    return 'Biraz daha kolay, ipuçlu sorular';
  }
  if (lastQuizScore <= 85) {
    return 'Orta seviye pekiştirme soruları';
  }
  return 'Biraz daha zor, yeni nesil sorular';
}

export function buildSupportPlan(
  dashboard: StudentDashboardBuildInput,
  learningSummary?: StudentDashboardLearningSummary
): StudentDashboardSupportPlan {
  const summary =
    learningSummary ?? buildLearningSummary(dashboard, dashboard.score > 0);
  const steps = buildSupportPlanSteps(summary.lastQuizScore);

  return {
    title: SUPPORT_PLAN_TITLE,
    description: SUPPORT_PLAN_DESCRIPTION,
    steps: steps.length >= 3 ? steps : buildSupportPlanSteps(DEFAULT_LAST_QUIZ_SCORE),
    nextQuizDifficulty: buildNextQuizDifficulty(summary.lastQuizScore),
  };
}

export function buildTodayRecommendation(
  dashboard: StudentDashboardBuildInput,
  learningSummary?: StudentDashboardLearningSummary
): StudentDashboardTodayRecommendation {
  const summary =
    learningSummary ?? buildLearningSummary(dashboard, dashboard.score > 0);
  const activeTopic = safeStr(summary.activeTopic, DEFAULT_ACTIVE_TOPIC);
  const studentId = safeStr(dashboard.studentId, 'stu-1');

  return {
    title: TODAY_RECOMMENDATION_TITLE,
    message: `${activeTopic} konusuna devam et ve ardından kısa quiz'i tamamla.`,
    actionLabel: TODAY_RECOMMENDATION_ACTION_LABEL,
    targetRoute: `/student/${studentId}`,
  };
}

function ensureStringArray(value: string[] | undefined, fallback: string[]): string[] {
  const items = (value ?? [])
    .map((item) => safeStr(item, ''))
    .filter((item) => item.length > 0);
  return items.length > 0 ? items : fallback;
}

function ensureLearningSummary(
  summary: StudentDashboardLearningSummary | undefined,
  dashboard: StudentDashboardBuildInput,
  hasQuizResult: boolean
): StudentDashboardLearningSummary {
  const fallback = buildLearningSummary(dashboard, hasQuizResult);
  if (!summary) {
    return fallback;
  }

  return {
    activeLesson: safeStr(summary.activeLesson, fallback.activeLesson),
    activeTopic: safeStr(summary.activeTopic, fallback.activeTopic),
    lastQuizScore: safeScore(summary.lastQuizScore, fallback.lastQuizScore),
    progressPercentage: normalizeProgressPercentage(
      summary.progressPercentage,
      safeScore(summary.lastQuizScore, fallback.lastQuizScore),
      hasQuizResult
    ),
  };
}

function ensureSupportPlan(
  plan: StudentDashboardSupportPlan | undefined,
  dashboard: StudentDashboardBuildInput,
  learningSummary: StudentDashboardLearningSummary
): StudentDashboardSupportPlan {
  const fallback = buildSupportPlan(dashboard, learningSummary);
  if (!plan) {
    return fallback;
  }

  const steps = ensureStringArray(plan.steps, fallback.steps);

  return {
    title: safeStr(plan.title, SUPPORT_PLAN_TITLE),
    description: safeStr(plan.description, SUPPORT_PLAN_DESCRIPTION),
    steps: steps.length >= 3 ? steps : fallback.steps,
    nextQuizDifficulty: safeStr(
      plan.nextQuizDifficulty,
      fallback.nextQuizDifficulty
    ),
  };
}

function ensureTodayRecommendation(
  recommendation: StudentDashboardTodayRecommendation | undefined,
  dashboard: StudentDashboardBuildInput,
  learningSummary: StudentDashboardLearningSummary
): StudentDashboardTodayRecommendation {
  const fallback = buildTodayRecommendation(dashboard, learningSummary);
  if (!recommendation) {
    return fallback;
  }

  const studentId = safeStr(dashboard.studentId, 'stu-1');

  return {
    title: safeStr(recommendation.title, TODAY_RECOMMENDATION_TITLE),
    message: safeStr(recommendation.message, fallback.message),
    actionLabel: safeStr(
      recommendation.actionLabel,
      TODAY_RECOMMENDATION_ACTION_LABEL
    ),
    targetRoute: safeStr(
      recommendation.targetRoute,
      `/student/${studentId}`
    ),
  };
}

function finalizeStudentDashboard(
  dashboard: StudentDashboardResponse,
  hasQuizResult: boolean
): StudentDashboardResponse {
  const buildInput: StudentDashboardBuildInput = {
    studentId: dashboard.studentId,
    studentName: dashboard.studentName,
    lesson: dashboard.lesson,
    topic: dashboard.topic,
    score: dashboard.score,
  };

  const learningSummary = ensureLearningSummary(
    dashboard.learningSummary,
    buildInput,
    hasQuizResult
  );
  const supportPlan = ensureSupportPlan(
    dashboard.supportPlan,
    buildInput,
    learningSummary
  );
  const todayRecommendation = ensureTodayRecommendation(
    dashboard.todayRecommendation,
    buildInput,
    learningSummary
  );

  return {
    ...dashboard,
    lesson: safeStr(dashboard.lesson, learningSummary.activeLesson),
    topic: safeStr(dashboard.topic, learningSummary.activeTopic),
    score: safeScore(dashboard.score, learningSummary.lastQuizScore),
    studentMessage: safeStr(
      dashboard.studentMessage,
      'Kişiselleştirilmiş öğrenme görünümü hazır.'
    ),
    learningSummary,
    supportPlan,
    todayRecommendation,
    uiSettings: dashboard.uiSettings ?? DEFAULT_UI_SETTINGS,
    notifications: Array.isArray(dashboard.notifications)
      ? dashboard.notifications
      : [],
  };
}

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
  const hasQuizResult = Boolean(live);
  const notifications = getStudentNotifications(studentId);

  const studentName = getStudentName(studentId);
  const lesson = safeStr(live?.lesson ?? demoQuiz.lesson, DEFAULT_ACTIVE_LESSON);
  const topic = safeStr(live?.topic ?? demoQuiz.topic, DEFAULT_ACTIVE_TOPIC);
  const score = safeScore(live?.score ?? 0, 0);

  const buildInput: StudentDashboardBuildInput = {
    studentId,
    studentName,
    lesson,
    topic,
    score,
  };

  const learningSummary = buildLearningSummary(buildInput, hasQuizResult);

  const base: StudentDashboardResponse = {
    studentId,
    studentName,
    lesson,
    topic,
    score,
    studentMessage: safeStr(
      live?.studentMessage,
      'Kişiselleştirilmiş öğrenme görünümü hazır.'
    ),
    learningSummary,
    supportPlan: buildSupportPlan(buildInput, learningSummary),
    todayRecommendation: buildTodayRecommendation(buildInput, learningSummary),
    uiSettings: live?.uiSettings ?? DEFAULT_UI_SETTINGS,
    notifications,
    learningMode: live?.learningMode,
    learningModeLabel: live?.learningModeLabel,
    supportProfile: live?.supportProfile,
    recommendation: live?.recommendation,
  };

  return finalizeStudentDashboard(base, hasQuizResult);
}
