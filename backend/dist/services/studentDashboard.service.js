"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StudentDashboardServiceError = void 0;
exports.buildLearningSummary = buildLearningSummary;
exports.buildSupportPlan = buildSupportPlan;
exports.buildTodayRecommendation = buildTodayRecommendation;
exports.getStudentDashboard = getStudentDashboard;
const mockData_1 = require("../data/mockData");
const inMemoryStore_1 = require("../data/inMemoryStore");
const quiz_service_1 = require("./quiz.service");
const DEFAULT_UI_SETTINGS = {
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
function safeStr(value, fallback) {
    if (value == null) {
        return fallback;
    }
    const text = String(value).trim();
    return text.length > 0 ? text : fallback;
}
function safeScore(value, fallback = DEFAULT_LAST_QUIZ_SCORE) {
    const n = typeof value === 'number' ? value : Number(value);
    if (!Number.isFinite(n)) {
        return fallback;
    }
    return Math.min(100, Math.max(0, Math.round(n)));
}
function normalizeProgressPercentage(value, lastQuizScore, hasQuizResult) {
    const n = typeof value === 'number' ? value : Number(value);
    if (Number.isFinite(n)) {
        return Math.min(100, Math.max(0, Math.round(n)));
    }
    if (hasQuizResult && lastQuizScore > 0) {
        return Math.min(100, Math.max(0, Math.round(lastQuizScore * 0.515)));
    }
    return DEFAULT_PROGRESS_PERCENTAGE;
}
function resolveLastQuizScore(score, hasQuizResult) {
    if (hasQuizResult) {
        return safeScore(score, DEFAULT_LAST_QUIZ_SCORE);
    }
    if (Number.isFinite(score) && score > 0) {
        return safeScore(score, DEFAULT_LAST_QUIZ_SCORE);
    }
    return DEFAULT_LAST_QUIZ_SCORE;
}
function buildLearningSummary(dashboard, hasQuizResult = false) {
    const activeLesson = safeStr(dashboard.lesson, DEFAULT_ACTIVE_LESSON);
    const activeTopic = safeStr(dashboard.topic, DEFAULT_ACTIVE_TOPIC);
    const lastQuizScore = resolveLastQuizScore(dashboard.score, hasQuizResult);
    const progressPercentage = normalizeProgressPercentage(undefined, lastQuizScore, hasQuizResult);
    return {
        activeLesson,
        activeTopic,
        lastQuizScore,
        progressPercentage,
    };
}
function buildSupportPlanSteps(lastQuizScore) {
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
function buildNextQuizDifficulty(lastQuizScore) {
    if (lastQuizScore < 70) {
        return 'Biraz daha kolay, ipuçlu sorular';
    }
    if (lastQuizScore <= 85) {
        return 'Orta seviye pekiştirme soruları';
    }
    return 'Biraz daha zor, yeni nesil sorular';
}
function buildSupportPlan(dashboard, learningSummary) {
    const summary = learningSummary ?? buildLearningSummary(dashboard, dashboard.score > 0);
    const steps = buildSupportPlanSteps(summary.lastQuizScore);
    return {
        title: SUPPORT_PLAN_TITLE,
        description: SUPPORT_PLAN_DESCRIPTION,
        steps: steps.length >= 3 ? steps : buildSupportPlanSteps(DEFAULT_LAST_QUIZ_SCORE),
        nextQuizDifficulty: buildNextQuizDifficulty(summary.lastQuizScore),
    };
}
function buildTodayRecommendation(dashboard, learningSummary) {
    const summary = learningSummary ?? buildLearningSummary(dashboard, dashboard.score > 0);
    const activeTopic = safeStr(summary.activeTopic, DEFAULT_ACTIVE_TOPIC);
    const studentId = safeStr(dashboard.studentId, 'stu-1');
    return {
        title: TODAY_RECOMMENDATION_TITLE,
        message: `${activeTopic} konusuna devam et ve ardından kısa quiz'i tamamla.`,
        actionLabel: TODAY_RECOMMENDATION_ACTION_LABEL,
        targetRoute: `/student/${studentId}`,
    };
}
function ensureStringArray(value, fallback) {
    const items = (value ?? [])
        .map((item) => safeStr(item, ''))
        .filter((item) => item.length > 0);
    return items.length > 0 ? items : fallback;
}
function ensureLearningSummary(summary, dashboard, hasQuizResult) {
    const fallback = buildLearningSummary(dashboard, hasQuizResult);
    if (!summary) {
        return fallback;
    }
    return {
        activeLesson: safeStr(summary.activeLesson, fallback.activeLesson),
        activeTopic: safeStr(summary.activeTopic, fallback.activeTopic),
        lastQuizScore: safeScore(summary.lastQuizScore, fallback.lastQuizScore),
        progressPercentage: normalizeProgressPercentage(summary.progressPercentage, safeScore(summary.lastQuizScore, fallback.lastQuizScore), hasQuizResult),
    };
}
function ensureSupportPlan(plan, dashboard, learningSummary) {
    const fallback = buildSupportPlan(dashboard, learningSummary);
    if (!plan) {
        return fallback;
    }
    const steps = ensureStringArray(plan.steps, fallback.steps);
    return {
        title: safeStr(plan.title, SUPPORT_PLAN_TITLE),
        description: safeStr(plan.description, SUPPORT_PLAN_DESCRIPTION),
        steps: steps.length >= 3 ? steps : fallback.steps,
        nextQuizDifficulty: safeStr(plan.nextQuizDifficulty, fallback.nextQuizDifficulty),
    };
}
function ensureTodayRecommendation(recommendation, dashboard, learningSummary) {
    const fallback = buildTodayRecommendation(dashboard, learningSummary);
    if (!recommendation) {
        return fallback;
    }
    const studentId = safeStr(dashboard.studentId, 'stu-1');
    return {
        title: safeStr(recommendation.title, TODAY_RECOMMENDATION_TITLE),
        message: safeStr(recommendation.message, fallback.message),
        actionLabel: safeStr(recommendation.actionLabel, TODAY_RECOMMENDATION_ACTION_LABEL),
        targetRoute: safeStr(recommendation.targetRoute, `/student/${studentId}`),
    };
}
function finalizeStudentDashboard(dashboard, hasQuizResult) {
    const buildInput = {
        studentId: dashboard.studentId,
        studentName: dashboard.studentName,
        lesson: dashboard.lesson,
        topic: dashboard.topic,
        score: dashboard.score,
    };
    const learningSummary = ensureLearningSummary(dashboard.learningSummary, buildInput, hasQuizResult);
    const supportPlan = ensureSupportPlan(dashboard.supportPlan, buildInput, learningSummary);
    const todayRecommendation = ensureTodayRecommendation(dashboard.todayRecommendation, buildInput, learningSummary);
    return {
        ...dashboard,
        lesson: safeStr(dashboard.lesson, learningSummary.activeLesson),
        topic: safeStr(dashboard.topic, learningSummary.activeTopic),
        score: safeScore(dashboard.score, learningSummary.lastQuizScore),
        studentMessage: safeStr(dashboard.studentMessage, 'Kişiselleştirilmiş öğrenme görünümü hazır.'),
        learningSummary,
        supportPlan,
        todayRecommendation,
        uiSettings: dashboard.uiSettings ?? DEFAULT_UI_SETTINGS,
        notifications: Array.isArray(dashboard.notifications)
            ? dashboard.notifications
            : [],
    };
}
class StudentDashboardServiceError extends Error {
    statusCode;
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
        this.name = 'StudentDashboardServiceError';
    }
}
exports.StudentDashboardServiceError = StudentDashboardServiceError;
function getStudentDashboard(studentId) {
    if (!(0, quiz_service_1.isValidStudent)(studentId)) {
        throw new StudentDashboardServiceError(`Bilinmeyen öğrenci kimliği: ${studentId}`, 404);
    }
    const live = (0, inMemoryStore_1.getLastQuizResult)(studentId);
    const hasQuizResult = Boolean(live);
    const notifications = (0, inMemoryStore_1.getStudentNotifications)(studentId);
    const studentName = (0, quiz_service_1.getStudentName)(studentId);
    const lesson = safeStr(live?.lesson ?? mockData_1.demoQuiz.lesson, DEFAULT_ACTIVE_LESSON);
    const topic = safeStr(live?.topic ?? mockData_1.demoQuiz.topic, DEFAULT_ACTIVE_TOPIC);
    const score = safeScore(live?.score ?? 0, 0);
    const buildInput = {
        studentId,
        studentName,
        lesson,
        topic,
        score,
    };
    const learningSummary = buildLearningSummary(buildInput, hasQuizResult);
    const base = {
        studentId,
        studentName,
        lesson,
        topic,
        score,
        studentMessage: safeStr(live?.studentMessage, 'Kişiselleştirilmiş öğrenme görünümü hazır.'),
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
//# sourceMappingURL=studentDashboard.service.js.map