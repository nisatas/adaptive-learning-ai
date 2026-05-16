"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildTeacherReport = buildTeacherReport;
exports.buildInsightInputFromTestRequest = buildInsightInputFromTestRequest;
const mockData_1 = require("../data/mockData");
const puqAi_service_1 = require("./puqAi.service");
const quiz_service_1 = require("./quiz.service");
const teacherReportLanguage_1 = require("../utils/teacherReportLanguage");
const sanitizeAiOutput_1 = require("../utils/sanitizeAiOutput");
const persistenceService = __importStar(require("./persistence.service"));
async function buildTeacherReport(studentId) {
    const live = (0, quiz_service_1.getStudentLastResult)(studentId);
    const report = live
        ? await buildLiveTeacherReport(live)
        : await buildDefaultTeacherReport(studentId);
    const persisted = await persistenceService.saveTeacherReport(report, {
        quizId: live?.quizId ?? mockData_1.demoQuiz.quizId,
    });
    return { ...report, persisted };
}
async function buildLiveTeacherReport(result) {
    const insightInput = buildInsightInputFromResult(result);
    const insight = await puqAi_service_1.puqAiService.generateTeacherInsightReport(insightInput);
    const behaviorObservation = pickSafeObservation(result, insight);
    const systemRecommendation = pickSafeRecommendation(result, insight);
    const aiTeacherNote = pickSafeAiNote(result, insight);
    return {
        ...mapAiMetadata(insight),
        studentId: result.studentId,
        studentName: (0, quiz_service_1.getStudentName)(result.studentId),
        lesson: result.lesson,
        gradeLevel: result.gradeLevel,
        topic: result.topic,
        score: result.score,
        totalQuestions: result.totalQuestions,
        correctCount: result.correctCount,
        wrongCount: result.wrongCount,
        skippedCount: result.skippedCount,
        averageTimeSeconds: result.averageTimeSeconds,
        mostDifficultTopic: result.mostDifficultTopic,
        behaviorObservation,
        systemRecommendation,
        aiTeacherNote,
        reportSource: 'live',
    };
}
async function buildDefaultTeacherReport(studentId) {
    const profile = mockData_1.mockStudentProfiles.find((s) => s.studentId === studentId);
    const studentName = profile?.name ?? (0, quiz_service_1.getStudentName)(studentId);
    const correctCount = profile
        ? Math.round((profile.score / 100) * mockData_1.TOTAL_QUESTIONS)
        : 0;
    const wrongCount = profile
        ? Math.max(0, mockData_1.TOTAL_QUESTIONS - correctCount - 0)
        : 0;
    const insightInput = {
        quizTitle: `${mockData_1.demoQuiz.lesson} - ${mockData_1.demoQuiz.topic}`,
        totalQuestions: mockData_1.TOTAL_QUESTIONS,
        correctCount,
        wrongCount,
        skippedCount: 0,
        averageAnswerTimeMs: (profile?.averageTimeSeconds ?? 0) * 1000,
        mostDifficultTopic: profile?.mostDifficultTopic ?? 'Yazım kuralları',
    };
    const insight = await puqAi_service_1.puqAiService.generateTeacherInsightReport(insightInput);
    const behaviorObservation = (0, teacherReportLanguage_1.buildBehaviorObservation)(insightInput);
    const systemRecommendation = (0, teacherReportLanguage_1.buildSystemRecommendation)(insightInput);
    const demoNoteSuffix = insight.aiStatus === 'missing_config' || insight.fallbackUsed
        ? ' (Varsayılan demo raporu — canlı submit sonrası güncellenir.)'
        : '';
    const aiNoteSafe = (0, sanitizeAiOutput_1.sanitizeAiOutput)(insight.text, `${insightInput.quizTitle} için veri temelli öğretmen özeti hazırlandı.`);
    return {
        ...mapAiMetadata(insight),
        studentId,
        studentName,
        lesson: mockData_1.demoQuiz.lesson,
        gradeLevel: mockData_1.demoQuiz.gradeLevel,
        topic: mockData_1.demoQuiz.topic,
        score: profile?.score ?? 0,
        totalQuestions: mockData_1.TOTAL_QUESTIONS,
        correctCount,
        wrongCount,
        skippedCount: 0,
        averageTimeSeconds: profile?.averageTimeSeconds ?? 0,
        mostDifficultTopic: profile?.mostDifficultTopic ?? 'Yazım kuralları',
        behaviorObservation,
        systemRecommendation,
        aiTeacherNote: `${aiNoteSafe.text}${demoNoteSuffix}`,
        reportSource: 'default',
    };
}
function pickSafeObservation(result, insight) {
    const dataDriven = (0, teacherReportLanguage_1.buildBehaviorObservation)(result);
    const aiCandidate = insight.observations[0];
    if (!aiCandidate) {
        return dataDriven;
    }
    const sanitized = (0, sanitizeAiOutput_1.sanitizeAiOutput)(aiCandidate, dataDriven);
    return sanitized.wasSanitized ? dataDriven : sanitized.text;
}
function pickSafeRecommendation(result, insight) {
    const dataDriven = (0, teacherReportLanguage_1.buildSystemRecommendation)(result);
    const aiCandidate = insight.recommendations[0];
    if (!aiCandidate) {
        return dataDriven;
    }
    const sanitized = (0, sanitizeAiOutput_1.sanitizeAiOutput)(aiCandidate, dataDriven);
    return sanitized.wasSanitized ? dataDriven : sanitized.text;
}
function pickSafeAiNote(result, insight) {
    const fallbackNote = [
        (0, teacherReportLanguage_1.buildBehaviorObservation)(result),
        (0, teacherReportLanguage_1.buildSystemRecommendation)(result),
    ].join(' ');
    const sanitized = (0, sanitizeAiOutput_1.sanitizeAiOutput)(insight.text || insight.summary, fallbackNote);
    return sanitized.text;
}
function buildInsightInputFromTestRequest(body) {
    return {
        quizTitle: `${body.lesson} - ${body.topic}`,
        totalQuestions: body.totalQuestions,
        correctCount: body.correctCount,
        wrongCount: body.wrongCount,
        skippedCount: body.skippedCount,
        averageAnswerTimeMs: body.averageTimeSeconds * 1000,
        mostDifficultTopic: body.mostDifficultTopic,
        hesitationCount: body.behaviorSignals?.longHesitations,
    };
}
function buildInsightInputFromResult(result) {
    return {
        quizTitle: `${result.lesson} - ${result.topic}`,
        totalQuestions: result.totalQuestions,
        correctCount: result.correctCount,
        wrongCount: result.wrongCount,
        skippedCount: result.skippedCount,
        averageAnswerTimeMs: result.averageTimeSeconds * 1000,
        slowQuestionIds: result.behaviorSignalsInternal.slowQuestionIds,
        hesitationCount: result.behaviorSignalsInternal.hesitationCount,
        mostDifficultTopic: result.mostDifficultTopic,
    };
}
function mapAiMetadata(insight) {
    return {
        aiProvider: insight.aiProvider,
        aiUsed: insight.aiUsed,
        fallbackUsed: insight.fallbackUsed,
        aiStatus: insight.aiStatus,
        generatedAt: insight.generatedAt,
    };
}
//# sourceMappingURL=teacherReport.service.js.map