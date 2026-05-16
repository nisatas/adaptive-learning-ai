"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isDatabaseAvailable = isDatabaseAvailable;
exports.saveQuizSubmission = saveQuizSubmission;
exports.saveTeacherReport = saveTeacherReport;
exports.getLatestSubmissionByStudentId = getLatestSubmissionByStudentId;
exports.getLatestTeacherReportsForDashboardFeed = getLatestTeacherReportsForDashboardFeed;
exports.getLatestTeacherReportByStudentId = getLatestTeacherReportByStudentId;
const crypto_1 = require("crypto");
const prisma_1 = require("../config/prisma");
let cachedAvailability = null;
let lastAvailabilityCheck = 0;
const AVAILABILITY_CACHE_MS = 30_000;
async function isDatabaseAvailable() {
    const now = Date.now();
    if (cachedAvailability !== null &&
        now - lastAvailabilityCheck < AVAILABILITY_CACHE_MS) {
        return cachedAvailability;
    }
    const prisma = (0, prisma_1.getPrismaClient)();
    if (!prisma) {
        cachedAvailability = false;
        lastAvailabilityCheck = now;
        return false;
    }
    try {
        await prisma.$queryRaw `SELECT 1`;
        cachedAvailability = true;
    }
    catch {
        cachedAvailability = false;
    }
    lastAvailabilityCheck = now;
    return cachedAvailability;
}
async function saveQuizSubmission(result, answers, studentName) {
    const prisma = (0, prisma_1.getPrismaClient)();
    if (!prisma) {
        return false;
    }
    try {
        await prisma.studentsubmission.create({
            data: {
                id: (0, crypto_1.randomUUID)(),
                studentId: result.studentId,
                studentName: studentName ?? null,
                quizId: result.quizId,
                lesson: result.lesson,
                gradeLevel: result.gradeLevel,
                topic: result.topic,
                totalQuestions: result.totalQuestions,
                score: result.score,
                correctCount: result.correctCount,
                wrongCount: result.wrongCount,
                skippedCount: result.skippedCount,
                averageTimeSeconds: result.averageTimeSeconds,
                mostDifficultTopic: result.mostDifficultTopic,
                studentMessage: result.studentMessage,
                uiSettingsJson: result.uiSettings,
                behaviorSignalsJson: result.behaviorSignalsInternal,
                quizanswerrecord: {
                    create: answers.map((answer) => ({
                        id: (0, crypto_1.randomUUID)(),
                        questionId: answer.questionId,
                        selectedOptionId: answer.selectedOptionId ?? null,
                        isCorrect: answer.isCorrect,
                        skipped: answer.skipped,
                        timeSpentSeconds: answer.timeSpentSeconds,
                        topic: answer.topic,
                    })),
                },
            },
        });
        return true;
    }
    catch {
        console.log('Database save failed, continuing with in-memory fallback');
        return false;
    }
}
async function saveTeacherReport(report, options) {
    const submissionId = options?.submissionId;
    const quizId = options?.quizId;
    const prisma = (0, prisma_1.getPrismaClient)();
    if (!prisma) {
        return false;
    }
    try {
        let linkedSubmissionId = submissionId ?? null;
        if (!linkedSubmissionId) {
            const latest = await prisma.studentsubmission.findFirst({
                where: { studentId: report.studentId },
                orderBy: { createdAt: 'desc' },
                select: { id: true },
            });
            linkedSubmissionId = latest?.id ?? null;
        }
        await prisma.teacherreportrecord.create({
            data: {
                id: (0, crypto_1.randomUUID)(),
                submissionId: linkedSubmissionId,
                studentId: report.studentId,
                studentName: report.studentName,
                quizId: quizId ?? null,
                lesson: report.lesson,
                gradeLevel: report.gradeLevel,
                topic: report.topic,
                score: report.score,
                totalQuestions: report.totalQuestions,
                correctCount: report.correctCount,
                wrongCount: report.wrongCount,
                skippedCount: report.skippedCount,
                averageTimeSeconds: report.averageTimeSeconds,
                mostDifficultTopic: report.mostDifficultTopic,
                behaviorObservation: report.behaviorObservation,
                systemRecommendation: report.systemRecommendation,
                aiTeacherNote: report.aiTeacherNote,
                aiProvider: report.aiProvider,
                aiUsed: report.aiUsed,
                fallbackUsed: report.fallbackUsed,
                aiStatus: report.aiStatus,
                reportSource: report.reportSource,
                generatedAt: new Date(report.generatedAt),
            },
        });
        return true;
    }
    catch {
        console.log('Database save failed, continuing with in-memory fallback');
        return false;
    }
}
async function getLatestSubmissionByStudentId(studentId) {
    const prisma = (0, prisma_1.getPrismaClient)();
    if (!prisma) {
        return null;
    }
    try {
        const row = await prisma.studentsubmission.findFirst({
            where: { studentId },
            orderBy: { createdAt: 'desc' },
        });
        if (!row) {
            return null;
        }
        return mapSubmissionRowToStored(row);
    }
    catch {
        return null;
    }
}
/** Latest stored notes for dashboard feed (no Puq.ai call). */
async function getLatestTeacherReportsForDashboardFeed(limit) {
    const prisma = (0, prisma_1.getPrismaClient)();
    if (!prisma || limit < 1) {
        return [];
    }
    try {
        const rows = await prisma.teacherreportrecord.findMany({
            take: Math.min(limit, 5),
            orderBy: { createdAt: 'desc' },
            select: {
                aiTeacherNote: true,
                generatedAt: true,
            },
        });
        return rows;
    }
    catch {
        return [];
    }
}
async function getLatestTeacherReportByStudentId(studentId) {
    const prisma = (0, prisma_1.getPrismaClient)();
    if (!prisma) {
        return null;
    }
    try {
        const row = await prisma.teacherreportrecord.findFirst({
            where: { studentId },
            orderBy: { createdAt: 'desc' },
        });
        if (!row) {
            return null;
        }
        return {
            studentId: row.studentId,
            studentName: row.studentName ?? 'Öğrenci',
            lesson: row.lesson,
            gradeLevel: row.gradeLevel,
            topic: row.topic,
            score: row.score,
            totalQuestions: row.totalQuestions,
            correctCount: row.correctCount,
            wrongCount: row.wrongCount,
            skippedCount: row.skippedCount,
            averageTimeSeconds: row.averageTimeSeconds,
            mostDifficultTopic: row.mostDifficultTopic ?? '',
            behaviorObservation: row.behaviorObservation,
            systemRecommendation: row.systemRecommendation,
            aiTeacherNote: row.aiTeacherNote,
            aiProvider: row.aiProvider,
            aiUsed: row.aiUsed,
            fallbackUsed: row.fallbackUsed,
            aiStatus: row.aiStatus,
            generatedAt: row.generatedAt.toISOString(),
            reportSource: row.reportSource,
        };
    }
    catch {
        return null;
    }
}
function mapSubmissionRowToStored(row) {
    const uiSettings = row.uiSettingsJson;
    const behaviorSignalsInternal = row.behaviorSignalsJson;
    return {
        studentId: row.studentId,
        quizId: row.quizId,
        lesson: row.lesson,
        gradeLevel: row.gradeLevel,
        topic: row.topic,
        totalQuestions: row.totalQuestions,
        score: row.score,
        correctCount: row.correctCount,
        wrongCount: row.wrongCount,
        skippedCount: row.skippedCount,
        averageTimeSeconds: row.averageTimeSeconds,
        mostDifficultTopic: row.mostDifficultTopic ?? '',
        studentMessage: row.studentMessage ?? '',
        uiSettings,
        behaviorSignals: {
            fastWrongAnswers: behaviorSignalsInternal.fastWrongAnswers ?? 0,
            longHesitations: behaviorSignalsInternal.longHesitations ?? 0,
            skippedQuestions: behaviorSignalsInternal.skippedQuestions ?? 0,
            totalTimeSeconds: behaviorSignalsInternal.totalTimeSeconds ?? 0,
        },
        behaviorSignalsInternal: {
            fastWrongAnswers: behaviorSignalsInternal.fastWrongAnswers ?? 0,
            longHesitations: behaviorSignalsInternal.longHesitations ?? 0,
            skippedQuestions: behaviorSignalsInternal.skippedQuestions ?? 0,
            totalTimeSeconds: behaviorSignalsInternal.totalTimeSeconds ?? 0,
            slowQuestionIds: behaviorSignalsInternal.slowQuestionIds ?? [],
            hesitationCount: behaviorSignalsInternal.hesitationCount ??
                behaviorSignalsInternal.longHesitations ??
                0,
        },
        internalProfile: 'BALANCED',
        submittedAt: row.createdAt.toISOString(),
    };
}
//# sourceMappingURL=persistence.service.js.map