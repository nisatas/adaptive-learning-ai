"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildRecommendedActions = buildRecommendedActions;
exports.buildSupportDistribution = buildSupportDistribution;
exports.buildPuqAiAgentFeed = buildPuqAiAgentFeed;
exports.getTeacherDashboard = getTeacherDashboard;
exports.getTeacherStudentsList = getTeacherStudentsList;
const mockData_1 = require("../data/mockData");
const inMemoryStore_1 = require("../data/inMemoryStore");
const adaptation_service_1 = require("./adaptation.service");
const aiPrompt_service_1 = require("./aiPrompt.service");
const sanitizeAiOutput_1 = require("../utils/sanitizeAiOutput");
const persistence_service_1 = require("./persistence.service");
const TEACHER_DISPLAY_NAME = 'Zeynep Demir';
const TEACHER_ROLE = 'Türkçe Öğretmeni';
const DASHBOARD_FRONTEND_HINTS = {
    recommendedActionsTarget: 'Önerilen Aksiyonlar',
    supportDistributionTarget: 'Öğrenme Destek Dağılımı',
    agentFeedTarget: 'Puq.ai Agent Feed',
    settingsStatus: 'Yakında',
};
const DEFAULT_RECOMMENDED_ACTIONS = [
    'Uzun metinli içeriklerde sadeleştirilmiş anlatım kullanılması önerilir.',
    'İlgili konuda kısa tekrar ve örnek çözüm etkinliği yapılabilir.',
    'Boş bırakılan sorular için düşük baskılı mini alıştırmalar planlanabilir.',
];
const FALLBACK_MOST_DIFFICULT_TOPIC = 'Genel tekrar';
const SAFE_FEED_FALLBACK_BY_TYPE = {
    insight: 'Son quiz özetlerine göre sınıf çalışmaları takip edilebilir ve planlanabilir.',
    recommendation: 'Önümüzdeki derste kısa tekrar, örnek çözüm ve mini alıştırma akışı kullanılabilir.',
    adaptation: 'Gerekli olduğunda ipucu kutusu ve adım adım anlatım araçları kullanılabilir.',
};
const SUPPORT_LABEL_BY_PROFILE = {
    FOCUS_SUPPORT: 'Odak desteği',
    READING_FRIENDLY: 'Okuma desteği',
    STEP_BY_STEP: 'Adım adım destek',
    CHALLENGE_MODE: 'Ek pratik',
    BALANCED: 'Standart deneyim',
};
const PROFILE_ORDER = [
    'FOCUS_SUPPORT',
    'READING_FRIENDLY',
    'STEP_BY_STEP',
    'CHALLENGE_MODE',
    'BALANCED',
];
const MIN_RECOMMENDED_ACTIONS = 3;
const MIN_FEED_ITEMS = 3;
function safeNumber(n, fallback = 0) {
    const x = typeof n === 'number' ? n : Number(n);
    return Number.isFinite(x) ? x : fallback;
}
function safeStr(s, fallback) {
    if (s == null)
        return fallback;
    const t = String(s).trim();
    return t.length > 0 ? t : fallback;
}
function resolveInternalProfile(studentId, mockScore, mockAvgSeconds) {
    const live = (0, inMemoryStore_1.getLastQuizResult)(studentId);
    if (live) {
        return live.internalProfile;
    }
    if (mockScore >= 85) {
        return 'CHALLENGE_MODE';
    }
    if (mockAvgSeconds >= 29 || mockScore < 60) {
        return 'STEP_BY_STEP';
    }
    if (mockScore < 74 && mockAvgSeconds >= 23) {
        return 'READING_FRIENDLY';
    }
    if (mockScore <= 66 && mockAvgSeconds <= 21) {
        return 'FOCUS_SUPPORT';
    }
    return 'BALANCED';
}
/** Integer percentages that sum to exactly 100 when total > 0. */
function percentagesFromCounts(counts, total) {
    if (total <= 0 || counts.length === 0) {
        return counts.map(() => 0);
    }
    const exact = counts.map((c) => (c / total) * 100);
    const floor = exact.map((e) => Math.floor(e));
    let remainder = 100 - floor.reduce((a, b) => a + b, 0);
    const byFrac = exact
        .map((e, i) => ({ i, frac: e - Math.floor(e) }))
        .sort((a, b) => b.frac - a.frac);
    for (let k = 0; k < byFrac.length && remainder > 0; k++) {
        floor[byFrac[k].i]++;
        remainder--;
    }
    return floor;
}
/** Boş öğrenci listesinde bile 5 dilim, yüzdeler toplamı 100. */
function equalSupportDistributionZeroCounts() {
    return PROFILE_ORDER.map((profile) => ({
        label: SUPPORT_LABEL_BY_PROFILE[profile],
        percentage: 20,
        count: 0,
    }));
}
function buildRecommendedActions(mostDifficultTopic) {
    const focus = safeStr(mostDifficultTopic, FALLBACK_MOST_DIFFICULT_TOPIC) ===
        FALLBACK_MOST_DIFFICULT_TOPIC
        ? 'ilgili içerik alanları'
        : safeStr(mostDifficultTopic, FALLBACK_MOST_DIFFICULT_TOPIC);
    return [
        'Uzun metinli içeriklerde sadeleştirilmiş anlatım kullanılması önerilir.',
        `${focus} konusunda kısa tekrar ve örnek çözüm etkinliği yapılabilir.`,
        'Boş bırakılan sorular için düşük baskılı mini alıştırmalar planlanabilir.',
    ];
}
function ensureRecommendedActions(actions) {
    const cleaned = actions
        .map((a) => safeStr(a, ''))
        .filter((a) => a.length > 0);
    const merged = [...cleaned];
    for (let i = 0; merged.length < MIN_RECOMMENDED_ACTIONS; i++) {
        merged.push(DEFAULT_RECOMMENDED_ACTIONS[i % DEFAULT_RECOMMENDED_ACTIONS.length]);
    }
    return merged.slice(0, Math.max(MIN_RECOMMENDED_ACTIONS, merged.length));
}
function buildSupportDistribution(profilesResolved) {
    const totalStudents = profilesResolved.length;
    if (totalStudents === 0) {
        return equalSupportDistributionZeroCounts();
    }
    const buckets = {
        FOCUS_SUPPORT: 0,
        READING_FRIENDLY: 0,
        STEP_BY_STEP: 0,
        CHALLENGE_MODE: 0,
        BALANCED: 0,
    };
    for (const p of profilesResolved) {
        buckets[p]++;
    }
    const counts = PROFILE_ORDER.map((p) => buckets[p]);
    const pct = percentagesFromCounts(counts, totalStudents);
    return PROFILE_ORDER.map((profile, i) => ({
        label: SUPPORT_LABEL_BY_PROFILE[profile],
        count: counts[i],
        percentage: pct[i],
    }));
}
/** Yüzde toplamını 100'e sabitler (yuvarlama kayması veya demo fallback). */
function rebalanceSupportDistributionPercentages(items) {
    if (items.length === 0) {
        return equalSupportDistributionZeroCounts();
    }
    const copy = items.map((i) => ({ ...i }));
    let sum = copy.reduce((a, b) => a + b.percentage, 0);
    if (sum !== 100) {
        const idx = copy.findIndex((c) => c.count > 0) >= 0
            ? copy.findIndex((c) => c.count > 0)
            : 0;
        copy[idx].percentage = Math.max(0, copy[idx].percentage + (100 - sum));
    }
    return copy;
}
function truncateForFeed(text, maxLen) {
    const t = text.trim();
    if (t.length <= maxLen) {
        return t;
    }
    return `${t.slice(0, maxLen - 1).trimEnd()}…`;
}
async function buildPuqAiAgentFeed(ctx) {
    const nowIso = new Date().toISOString();
    const rows = await (0, persistence_service_1.getLatestTeacherReportsForDashboardFeed)(1);
    const lessonLabel = safeStr(ctx.lesson, 'ders');
    const topicLabel = safeStr(ctx.mostDifficultTopic, FALLBACK_MOST_DIFFICULT_TOPIC) ===
        FALLBACK_MOST_DIFFICULT_TOPIC
        ? 'ilgili içerik'
        : safeStr(ctx.mostDifficultTopic, FALLBACK_MOST_DIFFICULT_TOPIC);
    const adaptationActive = ctx.supportDistribution.some((d) => d.count > 0 &&
        d.label !== 'Standart deneyim' &&
        d.label !== 'Ek pratik');
    let insightMessage = `Son quiz sonuçlarına göre öğrencilerin en çok zaman ayırdığı alanlar arasında ${topicLabel} öne çıkmaktadır.`;
    let insightCreatedAt = nowIso;
    if (rows[0]?.aiTeacherNote) {
        const snippet = truncateForFeed(rows[0].aiTeacherNote, 320);
        const { text } = (0, sanitizeAiOutput_1.sanitizeAiOutput)(snippet, insightMessage);
        insightMessage = text;
        insightCreatedAt = rows[0].generatedAt.toISOString();
    }
    const feed = [
        {
            id: 'feed-1',
            type: 'insight',
            title: 'Sınıf içgörüsü',
            message: insightMessage,
            source: 'Puq.ai',
            createdAt: insightCreatedAt,
        },
        {
            id: 'feed-2',
            type: 'recommendation',
            title: 'Önerilen öğretim aksiyonu',
            message: `Bir sonraki ${lessonLabel} oturumunda kısa tekrar, örnek çözüm ve mini alıştırma akışı planlanabilir.`,
            source: 'Puq.ai',
            createdAt: nowIso,
        },
        {
            id: 'feed-3',
            type: 'adaptation',
            title: 'Arayüz kişiselleştirme özeti',
            message: adaptationActive
                ? 'Bazı öğrenciler için ipucu kutusu, adım adım anlatım ve sadeleştirilmiş görünüm etkinleştirilmiştir.'
                : 'Öğrencilerin çoğunluğu için standart deneyim sunulmaktadır; gerektiğinde destek araçları yine de açılabilir.',
            source: 'NeuroAdapt Engine',
            createdAt: nowIso,
        },
    ];
    return feed;
}
/** Tüm feed mesajlarını sanitizeAiOutput ile geçirir. */
function sanitizePuqAiAgentFeedMessages(feed) {
    return feed.map((item) => ({
        ...item,
        message: (0, sanitizeAiOutput_1.sanitizeAiOutput)(safeStr(item.message, ''), SAFE_FEED_FALLBACK_BY_TYPE[item.type]).text,
    }));
}
function ensurePuqAiAgentFeed(feed) {
    const nowIso = new Date().toISOString();
    const templates = [
        {
            id: 'feed-1',
            type: 'insight',
            title: 'Sınıf içgörüsü',
            message: SAFE_FEED_FALLBACK_BY_TYPE.insight,
            source: 'Puq.ai',
            createdAt: nowIso,
        },
        {
            id: 'feed-2',
            type: 'recommendation',
            title: 'Önerilen öğretim aksiyonu',
            message: SAFE_FEED_FALLBACK_BY_TYPE.recommendation,
            source: 'Puq.ai',
            createdAt: nowIso,
        },
        {
            id: 'feed-3',
            type: 'adaptation',
            title: 'Arayüz kişiselleştirme özeti',
            message: SAFE_FEED_FALLBACK_BY_TYPE.adaptation,
            source: 'NeuroAdapt Engine',
            createdAt: nowIso,
        },
    ];
    const merged = [];
    for (let i = 0; i < MIN_FEED_ITEMS; i++) {
        merged.push(feed[i] ?? templates[i]);
    }
    return sanitizePuqAiAgentFeedMessages(merged);
}
function buildTeacherDashboardStudentSnapshots() {
    return mockData_1.mockStudentProfiles.map((profile) => {
        const live = (0, inMemoryStore_1.getLastQuizResult)(profile.studentId);
        const score = live ? live.score : profile.score;
        const averageTimeSeconds = live
            ? live.averageTimeSeconds
            : profile.averageTimeSeconds;
        const mostDifficultTopic = live
            ? live.mostDifficultTopic
            : profile.mostDifficultTopic;
        return {
            studentId: profile.studentId,
            studentName: profile.name,
            score: Math.min(100, Math.max(0, Math.round(safeNumber(score, 0)))),
            averageTimeSeconds: Math.max(0, Math.round(safeNumber(averageTimeSeconds, 0))),
            mostDifficultTopic: safeStr(mostDifficultTopic, FALLBACK_MOST_DIFFICULT_TOPIC),
            supportSummary: live
                ? (0, adaptation_service_1.buildSupportSummary)(live.score)
                : safeStr(profile.supportSummary, (0, adaptation_service_1.buildSupportSummary)(score)),
            lastQuizStatus: live ? 'Tamamlandı' : 'Bekleniyor',
        };
    });
}
function buildTeacherDashboardPromptInput(dashboard, students) {
    return {
        teacherName: dashboard.teacherName,
        className: dashboard.className,
        lesson: dashboard.lesson,
        topic: dashboard.topic,
        classAverage: dashboard.classAverage,
        averageResponseTime: dashboard.averageResponseTime,
        supportSuggestedCount: dashboard.supportSuggestedCount,
        challengeReadyCount: dashboard.challengeReadyCount,
        mostDifficultTopic: dashboard.mostDifficultTopic,
        students,
    };
}
function mergeAiTeacherActions(aiActions, fallback) {
    const seen = new Set();
    const merged = [];
    for (const raw of aiActions) {
        const candidate = safeStr(raw, '');
        if (!candidate) {
            continue;
        }
        const { text } = (0, sanitizeAiOutput_1.sanitizeAiOutput)(candidate, '');
        if (text && !seen.has(text)) {
            seen.add(text);
            merged.push(text);
        }
    }
    for (const item of fallback) {
        const candidate = safeStr(item, '');
        if (candidate && !seen.has(candidate)) {
            seen.add(candidate);
            merged.push(candidate);
        }
    }
    return merged;
}
function formatWorkflowSuggestionLine(suggestion) {
    if (!suggestion) {
        return '';
    }
    const title = safeStr(suggestion.title, '');
    const reason = safeStr(suggestion.reason, '');
    if (title && reason) {
        return `${title}: ${reason}`;
    }
    return title || reason;
}
function formatStudentsNeedingSupportLine(analysis) {
    if (analysis.studentsNeedingSupport.length === 0) {
        return '';
    }
    const lines = analysis.studentsNeedingSupport
        .slice(0, 2)
        .map((student) => `${safeStr(student.studentName, 'Öğrenci')} için ${safeStr(student.suggestedAction, 'kısa tekrar önerilir')}`);
    return `Destek önerisi: ${lines.join('; ')}.`;
}
function enrichPuqAiAgentFeedFromAnalysis(feed, analysis, lessonLabel) {
    const copy = feed.map((item) => ({ ...item }));
    const classSummary = safeStr(analysis.classSummary, '');
    if (classSummary && copy[0]) {
        copy[0] = {
            ...copy[0],
            title: 'Sınıf özeti',
            message: (0, sanitizeAiOutput_1.sanitizeAiOutput)(classSummary, copy[0].message).text,
        };
    }
    const primaryAction = safeStr(analysis.recommendedTeacherActions[0], '') ||
        formatWorkflowSuggestionLine(analysis.workflowSuggestions[0]) ||
        `Bir sonraki ${lessonLabel} oturumunda kısa tekrar ve mini alıştırma planlanabilir.`;
    if (copy[1]) {
        copy[1] = {
            ...copy[1],
            title: 'Önerilen öğretim aksiyonu',
            message: (0, sanitizeAiOutput_1.sanitizeAiOutput)(primaryAction, copy[1].message).text,
        };
    }
    const supportLine = formatStudentsNeedingSupportLine(analysis) ||
        (analysis.challengeReadyStudents[0]
            ? `${safeStr(analysis.challengeReadyStudents[0].studentName, 'Öğrenci')} için ${safeStr(analysis.challengeReadyStudents[0].suggestedAction, 'ek pratik önerilir')}.`
            : '');
    const workflowLine = formatWorkflowSuggestionLine(analysis.workflowSuggestions[1] ?? analysis.workflowSuggestions[0]);
    const adaptationMessage = [supportLine, workflowLine]
        .filter((line) => line.length > 0)
        .join(' ');
    if (adaptationMessage && copy[2]) {
        copy[2] = {
            ...copy[2],
            title: 'Destek ve workflow özeti',
            message: (0, sanitizeAiOutput_1.sanitizeAiOutput)(adaptationMessage, copy[2].message).text,
        };
    }
    return copy;
}
function applyTeacherDashboardAnalysis(base, analysis) {
    const aiTopic = safeStr(analysis.mostDifficultTopic, '');
    const mostDifficultTopic = aiTopic && aiTopic !== FALLBACK_MOST_DIFFICULT_TOPIC
        ? aiTopic
        : base.mostDifficultTopic;
    const recommendedActions = ensureRecommendedActions(mergeAiTeacherActions(analysis.recommendedTeacherActions, base.recommendedActions));
    const lessonLabel = safeStr(base.lesson, 'ders');
    const puqAiAgentFeed = ensurePuqAiAgentFeed(enrichPuqAiAgentFeedFromAnalysis(base.puqAiAgentFeed, analysis, lessonLabel));
    return {
        ...base,
        mostDifficultTopic: safeStr(mostDifficultTopic, base.mostDifficultTopic),
        recommendedActions,
        puqAiAgentFeed,
    };
}
async function enrichTeacherDashboardWithAi(base, students) {
    try {
        const analysis = await aiPrompt_service_1.aiPromptService.generateTeacherDashboardAnalysis(buildTeacherDashboardPromptInput(base, students));
        return applyTeacherDashboardAnalysis(base, analysis);
    }
    catch {
        return base;
    }
}
async function getTeacherDashboard() {
    const profilesResolved = mockData_1.mockStudentProfiles.map((p) => resolveInternalProfile(p.studentId, p.score, p.averageTimeSeconds));
    let supportDistribution = rebalanceSupportDistributionPercentages(buildSupportDistribution(profilesResolved));
    const topicSafe = safeStr(mockData_1.CLASS_META.mostDifficultTopic, FALLBACK_MOST_DIFFICULT_TOPIC);
    let puqAiAgentFeed = await buildPuqAiAgentFeed({
        mostDifficultTopic: topicSafe,
        lesson: safeStr(mockData_1.CLASS_META.lesson, 'Türkçe'),
        supportDistribution,
    });
    puqAiAgentFeed = ensurePuqAiAgentFeed(puqAiAgentFeed);
    const studentSnapshots = buildTeacherDashboardStudentSnapshots();
    const studentCountEffective = Math.max(safeNumber(mockData_1.CLASS_META.studentCount, mockData_1.mockStudentProfiles.length), mockData_1.mockStudentProfiles.length, 0);
    const baseDashboard = {
        className: safeStr(mockData_1.CLASS_META.className, 'Sınıf'),
        lesson: safeStr(mockData_1.CLASS_META.lesson, 'Türkçe'),
        topic: safeStr(mockData_1.CLASS_META.topic, 'Ders özeti'),
        studentCount: studentCountEffective,
        classAverage: Math.round(safeNumber(mockData_1.CLASS_META.classAverage, 0)),
        averageResponseTime: Math.round(safeNumber(mockData_1.CLASS_META.averageResponseTime, 0)),
        supportSuggestedCount: Math.max(0, Math.round(safeNumber(mockData_1.CLASS_META.supportSuggestedCount, 0))),
        challengeReadyCount: Math.max(0, Math.round(safeNumber(mockData_1.CLASS_META.challengeReadyCount, 0))),
        mostDifficultTopic: topicSafe,
        lastUpdated: safeStr((0, inMemoryStore_1.getLastSubmitAt)(), new Date().toISOString()),
        teacherName: safeStr(TEACHER_DISPLAY_NAME, 'Öğretmen'),
        teacherRole: safeStr(TEACHER_ROLE, 'Öğretmen'),
        recommendedActions: ensureRecommendedActions(buildRecommendedActions(topicSafe)),
        supportDistribution,
        puqAiAgentFeed,
        frontendHints: { ...DASHBOARD_FRONTEND_HINTS },
    };
    return enrichTeacherDashboardWithAi(baseDashboard, studentSnapshots);
}
function normalizeLastQuizStatus(value) {
    const s = safeStr(value, '');
    return s === 'Tamamlandı' ? 'Tamamlandı' : 'Bekleniyor';
}
function normalizeTeacherStudentItem(item) {
    const score = safeNumber(item.score, 0);
    const averageTimeSeconds = Math.max(0, Math.round(safeNumber(item.averageTimeSeconds, 0)));
    let supportSummary = safeStr(item.supportSummary, '');
    if (!supportSummary) {
        supportSummary = (0, adaptation_service_1.buildSupportSummary)(score);
    }
    let personalizationStatus = safeStr(item.personalizationStatus, '');
    if (!personalizationStatus) {
        personalizationStatus = 'Kişiselleştirilmiş görünüm hazır.';
    }
    return {
        studentId: safeStr(item.studentId, 'öğrenci-kimlik'),
        studentName: safeStr(item.studentName, 'Öğrenci'),
        score: Math.min(100, Math.max(0, Math.round(score))),
        averageTimeSeconds,
        mostDifficultTopic: safeStr(item.mostDifficultTopic, FALLBACK_MOST_DIFFICULT_TOPIC),
        supportSummary,
        personalizationStatus,
        lastQuizStatus: normalizeLastQuizStatus(item.lastQuizStatus),
    };
}
function getTeacherStudentsList() {
    const rawStudents = mockData_1.mockStudentProfiles.map((profile) => {
        const live = (0, inMemoryStore_1.getLastQuizResult)(profile.studentId);
        const lastQuizStatus = live ? 'Tamamlandı' : 'Bekleniyor';
        if (live) {
            return {
                studentId: profile.studentId,
                studentName: profile.name,
                score: live.score,
                averageTimeSeconds: live.averageTimeSeconds,
                mostDifficultTopic: live.mostDifficultTopic,
                supportSummary: (0, adaptation_service_1.buildSupportSummary)(live.score),
                personalizationStatus: (0, adaptation_service_1.buildPersonalizationStatus)(live.internalProfile),
                lastQuizStatus,
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
            lastQuizStatus,
        };
    });
    const students = rawStudents.map(normalizeTeacherStudentItem);
    return {
        className: safeStr(mockData_1.CLASS_META.className, 'Sınıf'),
        lesson: safeStr(mockData_1.demoQuiz.lesson, 'Türkçe'),
        topic: safeStr(mockData_1.demoQuiz.topic, 'Ders özeti'),
        students,
    };
}
//# sourceMappingURL=teacher.service.js.map