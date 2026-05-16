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
/** Demo: önceki hafta sınıf ortalaması (geçmiş veri yoksa) */
const DEMO_PREVIOUS_WEEK_CLASS_AVERAGE = 63;
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
function safeSupportPriority(value) {
    if (value === 'low' || value === 'high') {
        return value;
    }
    return 'medium';
}
function buildRuleBasedStudentsNeedingSupport(snapshots, lesson, classAverage, averageResponseTime) {
    const candidates = snapshots
        .filter((student) => student.score < Math.max(classAverage, 70) ||
        student.averageTimeSeconds > averageResponseTime)
        .sort((a, b) => a.score - b.score)
        .map((student) => ({
        studentId: student.studentId,
        studentName: student.studentName,
        lesson,
        topic: student.mostDifficultTopic,
        reason: `${student.mostDifficultTopic} konusunda başarı oranı sınıf ortalamasının altında görünüyor.`,
        suggestedAction: '10 dakikalık kısa tekrar ve 5 soruluk mini quiz önerilir.',
        priority: safeSupportPriority(student.score < 50 ? 'high' : student.score < 65 ? 'medium' : 'low'),
    }));
    if (candidates.length > 0) {
        return candidates;
    }
    const fallbackStudent = snapshots.find((student) => student.studentId === 'stu-1') ??
        snapshots[0];
    if (!fallbackStudent) {
        return [];
    }
    return [
        {
            studentId: fallbackStudent.studentId,
            studentName: fallbackStudent.studentName,
            lesson,
            topic: fallbackStudent.mostDifficultTopic,
            reason: `${fallbackStudent.mostDifficultTopic} konusunda ek destek faydalı olabilir.`,
            suggestedAction: '10 dakikalık kısa tekrar ve 5 soruluk mini quiz önerilir.',
            priority: 'medium',
        },
    ];
}
function normalizeStudentsNeedingSupportFromAi(items, snapshots, lesson, topicFallback) {
    if (!Array.isArray(items) || items.length === 0) {
        return [];
    }
    return items.map((item, index) => {
        const snapshot = snapshots.find((student) => student.studentId === item.studentId) ??
            snapshots[index];
        const topic = safeStr(snapshot?.mostDifficultTopic, topicFallback);
        return {
            studentId: safeStr(item.studentId, snapshot?.studentId ?? 'stu-1'),
            studentName: safeStr(item.studentName, snapshot?.studentName ?? 'Öğrenci'),
            lesson,
            topic,
            reason: (0, sanitizeAiOutput_1.sanitizeAiOutput)(safeStr(item.reason, ''), `${topic} konusunda kısa tekrar ve yönlendirilmiş alıştırma faydalı olabilir.`).text,
            suggestedAction: (0, sanitizeAiOutput_1.sanitizeAiOutput)(safeStr(item.suggestedAction, ''), '10 dakikalık kısa tekrar ve 5 soruluk mini quiz önerilir.').text,
            priority: safeSupportPriority(item.priority),
        };
    });
}
function ensureStudentsNeedingSupport(items, snapshots, lesson, classAverage, averageResponseTime, topicFallback) {
    const cleaned = (items ?? [])
        .map((item) => ({
        studentId: safeStr(item.studentId, ''),
        studentName: safeStr(item.studentName, 'Öğrenci'),
        lesson: safeStr(item.lesson, lesson),
        topic: safeStr(item.topic, topicFallback),
        reason: safeStr(item.reason, `${topicFallback} konusunda ek destek faydalı olabilir.`),
        suggestedAction: safeStr(item.suggestedAction, '10 dakikalık kısa tekrar ve 5 soruluk mini quiz önerilir.'),
        priority: safeSupportPriority(item.priority),
    }))
        .filter((item) => item.studentId.length > 0);
    if (cleaned.length > 0) {
        return cleaned;
    }
    return buildRuleBasedStudentsNeedingSupport(snapshots, lesson, classAverage, averageResponseTime);
}
function mapStudentsNeedingSupportToMeetList(items, defaultDuration = 15) {
    return items.map((item) => ({
        id: item.studentId,
        name: item.studentName,
        email: `${item.studentId}@demo.local`,
        lesson: item.lesson,
        topic: item.topic,
        reason: item.reason,
        suggestedDuration: defaultDuration,
        priority: item.priority,
    }));
}
function computeWeeklyProgressTrend(currentAverage, previousAverage = DEMO_PREVIOUS_WEEK_CLASS_AVERAGE) {
    if (currentAverage > previousAverage + 1) {
        return 'improving';
    }
    if (currentAverage < previousAverage - 1) {
        return 'declining';
    }
    return 'stable';
}
function progressTrendLabel(trend) {
    if (trend === 'improving') {
        return 'yükseldi';
    }
    if (trend === 'declining') {
        return 'düştü';
    }
    return 'stabil kaldı';
}
function buildStudentsNeedingSupportSummaryLines(students) {
    const lines = students.slice(0, 3).map((student) => {
        const reason = safeStr(student.reason, student.topic);
        const normalizedReason = reason.endsWith('.') ? reason : `${reason}.`;
        return `${student.studentName}: ${normalizedReason}`;
    });
    if (lines.length > 0) {
        return lines;
    }
    return ['Bu hafta belirgin ek destek ihtiyacı gösteren öğrenci bulunmuyor.'];
}
function buildWeeklyReportKeyFindings(dashboard) {
    return [
        `${dashboard.supportSuggestedCount} öğrenci destek ihtiyacı gösteriyor.`,
        `${dashboard.challengeReadyCount} öğrenci ileri seviye sorulara hazır.`,
        `Ortalama cevap süresi ${dashboard.averageResponseTime} saniye; sınıf takibi için izlenmeye devam edilmeli.`,
    ];
}
function buildWeeklyReportTeacherActions(mostDifficultTopic, recommendedActions) {
    const fromRecommended = recommendedActions
        .slice(0, 2)
        .map((action) => safeStr(action, ''))
        .filter((action) => action.length > 0);
    const topic = safeStr(mostDifficultTopic, FALLBACK_MOST_DIFFICULT_TOPIC);
    const defaults = [
        `Gelecek derste 10 dakikalık ${topic} tekrarı yapılması önerilir.`,
        'Kısa uygulama soruları ile pekiştirme yapılabilir.',
    ];
    const merged = [...fromRecommended];
    for (const item of defaults) {
        if (merged.length >= 2) {
            break;
        }
        if (!merged.includes(item)) {
            merged.push(item);
        }
    }
    return merged.slice(0, Math.max(2, merged.length));
}
function buildWeeklyReportNextWeekFocus(mostDifficultTopic) {
    const topic = safeStr(mostDifficultTopic, FALLBACK_MOST_DIFFICULT_TOPIC);
    return [topic, 'Problem çözme', 'Kısa tekrar etkinliği'];
}
function buildWeeklyReport(dashboard, _snapshots) {
    const mostDifficultTopic = safeStr(dashboard.mostDifficultTopic, FALLBACK_MOST_DIFFICULT_TOPIC);
    const progressTrend = computeWeeklyProgressTrend(dashboard.classAverage);
    const previousAverage = DEMO_PREVIOUS_WEEK_CLASS_AVERAGE;
    return {
        workflowType: 'weekly_report',
        classSummary: `Bu hafta sınıf ortalaması %${previousAverage}'ten %${dashboard.classAverage}'e ${progressTrendLabel(progressTrend)}.`,
        progressTrend,
        mostDifficultTopic,
        keyFindings: buildWeeklyReportKeyFindings(dashboard),
        studentsNeedingSupportSummary: buildStudentsNeedingSupportSummaryLines(dashboard.studentsNeedingSupport),
        recommendedTeacherActions: buildWeeklyReportTeacherActions(mostDifficultTopic, dashboard.recommendedActions),
        nextWeekFocus: buildWeeklyReportNextWeekFocus(mostDifficultTopic),
    };
}
function mapAiProgressTrend(value, fallback) {
    if (value === 'improving' || value === 'stable') {
        return value;
    }
    if (value === 'declining' || value === 'decreasing') {
        return 'declining';
    }
    return fallback;
}
function mapAiWeeklyReport(ai, fallback) {
    const keyFindings = asStringArray(ai.keyFindings, fallback.keyFindings).slice(0, 6);
    const recommendedTeacherActions = asStringArray(ai.recommendedTeacherActions, fallback.recommendedTeacherActions).slice(0, 6);
    const nextWeekFocus = asStringArray(ai.nextWeekFocus, fallback.nextWeekFocus).slice(0, 6);
    const supportSummaryFromAi = Array.isArray(ai.studentsNeedingSupportSummary)
        ? ai.studentsNeedingSupportSummary
            .map((item) => {
            if (typeof item === 'string') {
                return safeStr(item, '');
            }
            const name = safeStr(item.studentName, 'Öğrenci');
            const reason = safeStr(item.reason, '');
            const action = safeStr(item.suggestedAction, '');
            if (reason && action) {
                return `${name}: ${reason} ${action}`.trim();
            }
            return reason ? `${name}: ${reason}` : `${name}: Ek destek önerilir.`;
        })
            .filter((line) => line.length > 0)
        : [];
    const studentsNeedingSupportSummary = supportSummaryFromAi.length > 0
        ? supportSummaryFromAi
        : fallback.studentsNeedingSupportSummary;
    const mostDifficultTopic = safeStr(ai.mostDifficultTopic, fallback.mostDifficultTopic);
    const progressTrend = mapAiProgressTrend(ai.progressTrend, fallback.progressTrend);
    return {
        workflowType: 'weekly_report',
        classSummary: (0, sanitizeAiOutput_1.sanitizeAiOutput)(safeStr(ai.classSummary, ''), fallback.classSummary).text,
        progressTrend,
        mostDifficultTopic,
        keyFindings: keyFindings.length >= 3 ? keyFindings : fallback.keyFindings,
        studentsNeedingSupportSummary,
        recommendedTeacherActions: recommendedTeacherActions.length >= 2
            ? recommendedTeacherActions
            : fallback.recommendedTeacherActions,
        nextWeekFocus: nextWeekFocus.length >= 3 ? nextWeekFocus : fallback.nextWeekFocus,
    };
}
function asStringArray(value, fallback) {
    if (!Array.isArray(value)) {
        return fallback;
    }
    const items = value
        .filter((item) => typeof item === 'string' && item.trim().length > 0)
        .map((item) => item.trim());
    return items.length > 0 ? items : fallback;
}
function ensureWeeklyReport(report, dashboard, snapshots) {
    const fallback = buildWeeklyReport(dashboard, snapshots);
    if (!report) {
        return fallback;
    }
    const keyFindings = asStringArray(report.keyFindings, fallback.keyFindings);
    const recommendedTeacherActions = asStringArray(report.recommendedTeacherActions, fallback.recommendedTeacherActions);
    const nextWeekFocus = asStringArray(report.nextWeekFocus, fallback.nextWeekFocus);
    const studentsNeedingSupportSummary = asStringArray(report.studentsNeedingSupportSummary, fallback.studentsNeedingSupportSummary);
    return {
        workflowType: 'weekly_report',
        classSummary: safeStr(report.classSummary, fallback.classSummary),
        progressTrend: mapAiProgressTrend(report.progressTrend, fallback.progressTrend),
        mostDifficultTopic: safeStr(report.mostDifficultTopic, fallback.mostDifficultTopic),
        keyFindings: keyFindings.length >= 3 ? keyFindings : fallback.keyFindings,
        studentsNeedingSupportSummary,
        recommendedTeacherActions: recommendedTeacherActions.length >= 2
            ? recommendedTeacherActions
            : fallback.recommendedTeacherActions,
        nextWeekFocus: nextWeekFocus.length >= 3 ? nextWeekFocus : fallback.nextWeekFocus,
    };
}
async function enrichTeacherDashboardWeeklyReport(dashboard, snapshots) {
    const fallback = buildWeeklyReport(dashboard, snapshots);
    try {
        const ai = await aiPrompt_service_1.aiPromptService.generateWeeklyReportWorkflow({
            teacherName: dashboard.teacherName,
            className: dashboard.className,
            lesson: dashboard.lesson,
            topic: dashboard.topic,
            classAverage: dashboard.classAverage,
            previousWeekAverage: DEMO_PREVIOUS_WEEK_CLASS_AVERAGE,
            mostDifficultTopic: dashboard.mostDifficultTopic,
            studentCount: dashboard.studentCount,
            supportSuggestedCount: dashboard.supportSuggestedCount,
            studentsNeedingSupport: snapshots,
        });
        return {
            ...dashboard,
            weeklyReport: mapAiWeeklyReport(ai, fallback),
        };
    }
    catch {
        return {
            ...dashboard,
            weeklyReport: fallback,
        };
    }
}
function finalizeTeacherDashboard(dashboard, snapshots) {
    const lesson = safeStr(dashboard.lesson, 'Türkçe');
    const topicFallback = safeStr(dashboard.mostDifficultTopic, FALLBACK_MOST_DIFFICULT_TOPIC);
    const studentsNeedingSupport = ensureStudentsNeedingSupport(dashboard.studentsNeedingSupport, snapshots, lesson, dashboard.classAverage, dashboard.averageResponseTime, topicFallback);
    const dashboardWithStudents = {
        ...dashboard,
        studentsNeedingSupport,
        students: mapStudentsNeedingSupportToMeetList(studentsNeedingSupport),
    };
    return {
        ...dashboardWithStudents,
        weeklyReport: ensureWeeklyReport(dashboardWithStudents.weeklyReport, dashboardWithStudents, snapshots),
    };
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
function applyTeacherDashboardAnalysis(base, analysis, snapshots) {
    const aiTopic = safeStr(analysis.mostDifficultTopic, '');
    const mostDifficultTopic = aiTopic && aiTopic !== FALLBACK_MOST_DIFFICULT_TOPIC
        ? aiTopic
        : base.mostDifficultTopic;
    const recommendedActions = ensureRecommendedActions(mergeAiTeacherActions(analysis.recommendedTeacherActions, base.recommendedActions));
    const lessonLabel = safeStr(base.lesson, 'ders');
    const puqAiAgentFeed = ensurePuqAiAgentFeed(enrichPuqAiAgentFeedFromAnalysis(base.puqAiAgentFeed, analysis, lessonLabel));
    const lesson = safeStr(base.lesson, 'Türkçe');
    const topicFallback = safeStr(mostDifficultTopic, base.mostDifficultTopic);
    const aiSupport = normalizeStudentsNeedingSupportFromAi(analysis.studentsNeedingSupport, snapshots, lesson, topicFallback);
    const studentsNeedingSupport = aiSupport.length > 0 ? aiSupport : base.studentsNeedingSupport;
    return {
        ...base,
        mostDifficultTopic: safeStr(mostDifficultTopic, base.mostDifficultTopic),
        recommendedActions,
        puqAiAgentFeed,
        studentsNeedingSupport,
        students: mapStudentsNeedingSupportToMeetList(studentsNeedingSupport),
    };
}
async function enrichTeacherDashboardWithAi(base, students) {
    try {
        const analysis = await aiPrompt_service_1.aiPromptService.generateTeacherDashboardAnalysis(buildTeacherDashboardPromptInput(base, students));
        return applyTeacherDashboardAnalysis(base, analysis, students);
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
    const lessonLabel = safeStr(mockData_1.CLASS_META.lesson, 'Türkçe');
    const classAverage = Math.round(safeNumber(mockData_1.CLASS_META.classAverage, 0));
    const averageResponseTime = Math.round(safeNumber(mockData_1.CLASS_META.averageResponseTime, 0));
    const ruleBasedSupport = buildRuleBasedStudentsNeedingSupport(studentSnapshots, lessonLabel, classAverage, averageResponseTime);
    const dashboardCore = {
        className: safeStr(mockData_1.CLASS_META.className, 'Sınıf'),
        lesson: lessonLabel,
        topic: safeStr(mockData_1.CLASS_META.topic, 'Ders özeti'),
        studentCount: studentCountEffective,
        classAverage,
        averageResponseTime,
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
        studentsNeedingSupport: ruleBasedSupport,
        students: mapStudentsNeedingSupportToMeetList(ruleBasedSupport),
    };
    const baseDashboard = {
        ...dashboardCore,
        weeklyReport: buildWeeklyReport({ ...dashboardCore, weeklyReport: undefined }, studentSnapshots),
    };
    const enriched = await enrichTeacherDashboardWithAi(baseDashboard, studentSnapshots);
    const withWeeklyReport = await enrichTeacherDashboardWeeklyReport(enriched, studentSnapshots);
    return finalizeTeacherDashboard(withWeeklyReport, studentSnapshots);
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