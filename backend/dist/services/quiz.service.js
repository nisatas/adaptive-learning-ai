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
exports.QuizServiceError = void 0;
exports.getDemoQuizPublic = getDemoQuizPublic;
exports.isValidStudent = isValidStudent;
exports.getStudentLastResult = getStudentLastResult;
exports.getStudentName = getStudentName;
exports.submitDemoQuiz = submitDemoQuiz;
const mockData_1 = require("../data/mockData");
const inMemoryStore_1 = require("../data/inMemoryStore");
const adaptation_service_1 = require("./adaptation.service");
const aiPrompt_service_1 = require("./aiPrompt.service");
const persistenceService = __importStar(require("./persistence.service"));
const sanitizeAiOutput_1 = require("../utils/sanitizeAiOutput");
const VALID_STUDENT_IDS = new Set(mockData_1.mockStudentProfiles.map((s) => s.studentId));
class QuizServiceError extends Error {
    statusCode;
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
        this.name = 'QuizServiceError';
    }
}
exports.QuizServiceError = QuizServiceError;
function getDemoQuizPublic() {
    return {
        quizId: mockData_1.demoQuiz.quizId,
        lesson: mockData_1.demoQuiz.lesson,
        gradeLevel: mockData_1.demoQuiz.gradeLevel,
        topic: mockData_1.demoQuiz.topic,
        totalQuestions: mockData_1.TOTAL_QUESTIONS,
        questions: mockData_1.demoQuiz.questions.map(({ correctOptionId: _correct, ...question }) => question),
    };
}
function isValidStudent(studentId) {
    return VALID_STUDENT_IDS.has(studentId);
}
function getStudentLastResult(studentId) {
    return (0, inMemoryStore_1.getLastQuizResult)(studentId);
}
function getStudentName(studentId) {
    return (mockData_1.mockStudentProfiles.find((s) => s.studentId === studentId)?.name ??
        'Öğrenci');
}
async function submitDemoQuiz(request) {
    validateSubmission(request);
    if (request.quizMeta) {
        return submitTopicQuiz(request);
    }
    return submitFullDemoQuiz(request);
}
async function submitTopicQuiz(request) {
    const meta = request.quizMeta;
    const evaluatedAnswers = meta.answerDetails.map((a) => ({
        questionId: a.questionId,
        selectedOptionId: '',
        isCorrect: a.isCorrect,
        isSkipped: false,
        timeSpentSeconds: a.timeSpentSeconds,
        topic: a.topic,
    }));
    const behaviorSignalsInternal = (0, adaptation_service_1.computeBehaviorSignals)(evaluatedAnswers);
    const timeSum = evaluatedAnswers.reduce((s, a) => s + a.timeSpentSeconds, 0);
    const averageTimeSeconds = evaluatedAnswers.length > 0
        ? Math.round(timeSum / evaluatedAnswers.length)
        : 0;
    const adaptation = (0, adaptation_service_1.determineAdaptation)(meta.score, meta.wrongCount, averageTimeSeconds, behaviorSignalsInternal, meta);
    const topicLabel = meta.topicId === 'paragrafta-anlam'
        ? 'Paragrafta Anlam'
        : mockData_1.demoQuiz.topic;
    const response = {
        studentId: request.studentId,
        quizId: `topic-${meta.topicId}`,
        lesson: mockData_1.demoQuiz.lesson,
        gradeLevel: mockData_1.demoQuiz.gradeLevel,
        topic: topicLabel,
        totalQuestions: meta.totalQuestions,
        score: meta.score,
        correctCount: meta.correctCount,
        wrongCount: meta.wrongCount,
        skippedCount: Math.max(0, meta.totalQuestions - meta.correctCount - meta.wrongCount),
        averageTimeSeconds,
        mostDifficultTopic: topicLabel,
        studentMessage: adaptation.studentMessage,
        uiSettings: adaptation.uiSettings,
        behaviorSignals: (0, adaptation_service_1.toPublicBehaviorSignals)(behaviorSignalsInternal),
        learningMode: adaptation.learningMode,
        learningModeLabel: adaptation.learningModeLabel,
        supportProfile: adaptation.supportProfile,
        recommendation: adaptation.recommendation,
        topicId: meta.topicId,
    };
    const stored = {
        ...response,
        behaviorSignalsInternal,
        internalProfile: adaptation.internalProfile,
        submittedAt: new Date().toISOString(),
    };
    (0, inMemoryStore_1.saveQuizResult)(stored);
    void persistenceService.saveQuizSubmission(stored, evaluatedAnswers.map((answer) => ({
        questionId: answer.questionId,
        selectedOptionId: answer.selectedOptionId ?? '',
        isCorrect: answer.isCorrect,
        skipped: answer.isSkipped,
        timeSpentSeconds: answer.timeSpentSeconds,
        topic: answer.topic,
    })), getStudentName(request.studentId));
    return response;
}
async function submitFullDemoQuiz(request) {
    const answerByQuestionId = new Map(request.answers.map((a) => [a.questionId, a]));
    let correctCount = 0;
    let wrongCount = 0;
    let skippedCount = 0;
    let timeSum = 0;
    let timeCount = 0;
    const topicWrongCount = new Map();
    const evaluatedAnswers = [];
    for (const question of mockData_1.demoQuiz.questions) {
        const raw = answerByQuestionId.get(question.questionId);
        const normalized = normalizeAnswer(raw);
        if (normalized.isSkipped) {
            skippedCount += 1;
            evaluatedAnswers.push({
                questionId: question.questionId,
                selectedOptionId: normalized.selectedOptionId,
                isCorrect: false,
                isSkipped: true,
                timeSpentSeconds: normalized.timeSpentSeconds,
                topic: question.topic,
            });
            continue;
        }
        if (normalized.timeSpentSeconds > 0) {
            timeSum += normalized.timeSpentSeconds;
            timeCount += 1;
        }
        const isCorrect = normalized.selectedOptionId === question.correctOptionId;
        if (isCorrect) {
            correctCount += 1;
        }
        else {
            wrongCount += 1;
            topicWrongCount.set(question.topic, (topicWrongCount.get(question.topic) ?? 0) + 1);
        }
        evaluatedAnswers.push({
            questionId: question.questionId,
            selectedOptionId: normalized.selectedOptionId,
            isCorrect,
            isSkipped: false,
            timeSpentSeconds: normalized.timeSpentSeconds,
            topic: question.topic,
        });
    }
    const averageTimeSeconds = timeCount > 0 ? Math.round(timeSum / timeCount) : 0;
    const score = Math.round((correctCount / mockData_1.TOTAL_QUESTIONS) * 100);
    const mostDifficultTopic = resolveMostDifficultTopic(topicWrongCount);
    const behaviorSignalsInternal = (0, adaptation_service_1.computeBehaviorSignals)(evaluatedAnswers);
    const adaptation = (0, adaptation_service_1.determineAdaptation)(score, wrongCount, averageTimeSeconds, behaviorSignalsInternal);
    const baseBehaviorSignals = (0, adaptation_service_1.toPublicBehaviorSignals)(behaviorSignalsInternal);
    const [studentMessage, behaviorSignals] = await Promise.all([
        resolveStudentMessage({
            studentId: request.studentId,
            score,
            correctCount,
            wrongCount,
            skippedCount,
            averageTimeSeconds,
            mostDifficultTopic,
            behaviorSignals: behaviorSignalsInternal,
            fallbackMessage: adaptation.studentMessage,
        }),
        enrichBehaviorSignalsWithAi({
            studentId: request.studentId,
            score,
            wrongCount,
            averageTimeSeconds,
            mostDifficultTopic,
            answers: request.answers,
            behaviorSignalsInternal,
            base: baseBehaviorSignals,
        }),
    ]);
    const response = {
        studentId: request.studentId,
        quizId: mockData_1.demoQuiz.quizId,
        lesson: mockData_1.demoQuiz.lesson,
        gradeLevel: mockData_1.demoQuiz.gradeLevel,
        topic: mockData_1.demoQuiz.topic,
        totalQuestions: mockData_1.TOTAL_QUESTIONS,
        score,
        correctCount,
        wrongCount,
        skippedCount,
        averageTimeSeconds,
        mostDifficultTopic,
        studentMessage,
        uiSettings: adaptation.uiSettings,
        behaviorSignals,
        learningMode: adaptation.learningMode,
        learningModeLabel: adaptation.learningModeLabel,
        supportProfile: adaptation.supportProfile,
        recommendation: adaptation.recommendation,
    };
    const stored = {
        ...response,
        behaviorSignalsInternal,
        internalProfile: adaptation.internalProfile,
        submittedAt: new Date().toISOString(),
    };
    (0, inMemoryStore_1.saveQuizResult)(stored);
    void persistenceService.saveQuizSubmission(stored, evaluatedAnswers.map((answer) => ({
        questionId: answer.questionId,
        selectedOptionId: answer.selectedOptionId ?? '',
        isCorrect: answer.isCorrect,
        skipped: answer.isSkipped,
        timeSpentSeconds: answer.timeSpentSeconds,
        topic: answer.topic,
    })), getStudentName(request.studentId));
    return response;
}
function normalizeAnswer(raw) {
    if (!raw) {
        return { isSkipped: true, timeSpentSeconds: 0 };
    }
    const timeSpentSeconds = typeof raw.timeSpentSeconds === 'number' && raw.timeSpentSeconds >= 0
        ? raw.timeSpentSeconds
        : 0;
    const hasSelection = typeof raw.selectedOptionId === 'string' &&
        raw.selectedOptionId.trim().length > 0;
    const isSkipped = raw.skipped === true || !hasSelection;
    return {
        isSkipped,
        selectedOptionId: hasSelection ? raw.selectedOptionId : undefined,
        timeSpentSeconds,
    };
}
function validateSubmission(request) {
    if (!request.studentId) {
        throw new QuizServiceError('studentId zorunludur.', 400);
    }
    if (!isValidStudent(request.studentId)) {
        throw new QuizServiceError(`Bilinmeyen öğrenci kimliği: ${request.studentId}`, 404);
    }
    if (request.quizMeta) {
        const meta = request.quizMeta;
        if (!meta.topicId) {
            throw new QuizServiceError('quizMeta.topicId zorunludur.', 400);
        }
        if (typeof meta.score !== 'number' ||
            typeof meta.totalQuestions !== 'number') {
            throw new QuizServiceError('quizMeta.score ve totalQuestions zorunludur.', 400);
        }
        return;
    }
    if (!request.answers || !Array.isArray(request.answers)) {
        throw new QuizServiceError('answers dizisi zorunludur.', 400);
    }
    const expectedIds = new Set(mockData_1.demoQuiz.questions.map((q) => q.questionId));
    const receivedIds = new Set();
    for (const answer of request.answers) {
        if (!answer.questionId) {
            throw new QuizServiceError('Her cevapta questionId zorunludur.', 400);
        }
        if (receivedIds.has(answer.questionId)) {
            throw new QuizServiceError(`Tekrarlanan questionId: ${answer.questionId}`, 400);
        }
        receivedIds.add(answer.questionId);
        if (!expectedIds.has(answer.questionId)) {
            throw new QuizServiceError(`Bilinmeyen soru kimliği: ${answer.questionId}`, 400);
        }
        if (answer.timeSpentSeconds !== undefined &&
            (typeof answer.timeSpentSeconds !== 'number' ||
                answer.timeSpentSeconds < 0)) {
            throw new QuizServiceError('timeSpentSeconds geçerli bir sayı olmalıdır.', 400);
        }
    }
}
async function resolveStudentMessage(options) {
    const fallbackMessage = options.fallbackMessage.trim() ||
        'Kişiselleştirilmiş öğrenme görünümü hazır.';
    try {
        const feedback = await aiPrompt_service_1.aiPromptService.generateStudentFeedback({
            studentName: getStudentName(options.studentId),
            lesson: mockData_1.demoQuiz.lesson,
            topic: mockData_1.demoQuiz.topic,
            quizScore: options.score,
            classAverage: mockData_1.CLASS_META.classAverage,
            mostDifficultTopic: options.mostDifficultTopic,
            correctCount: options.correctCount,
            wrongCount: options.wrongCount,
            skippedCount: options.skippedCount,
            averageTimeSeconds: options.averageTimeSeconds,
            difficultySignal: deriveDifficultySignal(options.score, options.wrongCount),
            attentionSignal: deriveAttentionSignal(options.behaviorSignals),
        });
        const composed = composeStudentMessageFromFeedback(feedback);
        if (!composed) {
            return fallbackMessage;
        }
        const sanitized = (0, sanitizeAiOutput_1.sanitizeAiOutput)(composed, fallbackMessage);
        return sanitized.text.trim() || fallbackMessage;
    }
    catch {
        return fallbackMessage;
    }
}
function composeStudentMessageFromFeedback(feedback) {
    const greeting = feedback.studentGreeting.trim();
    let shortFeedback = feedback.shortFeedback.trim();
    const nextStep = feedback.nextStep.trim();
    const motivationMessage = feedback.motivationMessage.trim();
    if (greeting && shortFeedback) {
        const greetingName = greeting.replace(/,+$/, '').trim();
        if (greetingName &&
            !shortFeedback.toLowerCase().startsWith(greetingName.toLowerCase())) {
            shortFeedback = `${greeting} ${shortFeedback}`;
        }
    }
    return [shortFeedback, nextStep, motivationMessage]
        .filter(Boolean)
        .join(' ');
}
function deriveDifficultySignal(score, wrongCount) {
    if (score < 60 || wrongCount >= 3) {
        return 'high';
    }
    if (score < 75 || wrongCount >= 2) {
        return 'medium';
    }
    return 'low';
}
function deriveAttentionSignal(signals) {
    if (signals.longHesitations >= 3 || signals.fastWrongAnswers >= 2) {
        return 'high';
    }
    if (signals.longHesitations >= 1 || signals.fastWrongAnswers >= 1) {
        return 'medium';
    }
    return 'low';
}
function safeMetric(value) {
    const n = typeof value === 'number' ? value : Number(value);
    if (!Number.isFinite(n) || n < 0) {
        return 0;
    }
    return Math.round(n);
}
function extractInteractionMetrics(answers, _behavior) {
    let answerChangeCount = 0;
    let idleTimeMs = 0;
    let mouseMovementCount = 0;
    let mouseDirectionChanges = 0;
    let focusLostCount = 0;
    let optionHoverCount = 0;
    for (const answer of answers) {
        const raw = answer;
        answerChangeCount += safeMetric(raw.answerChangeCount);
        idleTimeMs += safeMetric(raw.idleTimeMs);
        mouseMovementCount += safeMetric(raw.mouseMovementCount);
        mouseDirectionChanges += safeMetric(raw.mouseDirectionChanges);
        focusLostCount += safeMetric(raw.focusLostCount);
        optionHoverCount += safeMetric(raw.optionHoverCount);
    }
    return {
        answerChangeCount,
        idleTimeMs,
        mouseMovementCount,
        mouseDirectionChanges,
        focusLostCount,
        optionHoverCount,
    };
}
function deriveMouseMovementLevel(mouseMovementCount, mouseDirectionChanges) {
    const activity = mouseMovementCount + mouseDirectionChanges;
    if (activity <= 0) {
        return undefined;
    }
    if (activity >= 80) {
        return 'high';
    }
    if (activity >= 25) {
        return 'medium';
    }
    return 'low';
}
function buildQuizBehaviorPromptInput(options) {
    const interaction = extractInteractionMetrics(options.answers, options.behaviorSignalsInternal);
    const difficultySignal = deriveDifficultySignal(options.score, options.wrongCount);
    const attentionSignal = deriveAttentionSignal(options.behaviorSignalsInternal);
    return {
        studentId: options.studentId,
        studentName: getStudentName(options.studentId),
        lesson: mockData_1.demoQuiz.lesson,
        topic: mockData_1.demoQuiz.topic,
        quizScore: options.score,
        averageTimeSeconds: options.averageTimeSeconds,
        answerChangeCount: interaction.answerChangeCount,
        idleTimeMs: interaction.idleTimeMs,
        mouseMovementCount: interaction.mouseMovementCount,
        mouseDirectionChanges: interaction.mouseDirectionChanges,
        focusLostCount: interaction.focusLostCount,
        optionHoverCount: interaction.optionHoverCount,
        difficultySignal,
        attentionSignal,
        skippedQuestions: options.behaviorSignalsInternal.skippedQuestions,
        longHesitations: options.behaviorSignalsInternal.longHesitations,
        mouseMovementLevel: deriveMouseMovementLevel(interaction.mouseMovementCount, interaction.mouseDirectionChanges),
    };
}
function applyQuizBehaviorAnalysis(base, analysis) {
    const fallbackSummary = 'Analiz sınırlı veriyle oluşturuldu. Quiz etkileşim verileri birlikte değerlendirildi.';
    const interactionSummary = (0, sanitizeAiOutput_1.sanitizeAiOutput)(analysis.interactionSummary.trim() || fallbackSummary, fallbackSummary).text;
    const safeInterpretation = (0, sanitizeAiOutput_1.sanitizeAiOutput)(analysis.safeInterpretation.trim() ||
        'Bu yorum yalnızca quiz etkileşim verilerine dayalı sınırlı bir öğrenme sinyalidir.', 'Adım adım çözüm desteği faydalı olabilir.').text;
    const behaviorNotes = analysis.behaviorNotes
        .map((note) => (0, sanitizeAiOutput_1.sanitizeAiOutput)(note, '').text)
        .filter((note) => note.length > 0)
        .slice(0, 4);
    return {
        ...base,
        interactionSummary,
        safeInterpretation,
        behaviorNotes: behaviorNotes.length > 0
            ? behaviorNotes
            : [
                'Cevap süresi ve etkileşim verileri öğrenme süreci desteği için kullanıldı.',
            ],
        attentionSignal: toLearningSignalLevel(analysis.attentionSignal),
        engagementSignal: toLearningSignalLevel(analysis.engagementSignal),
        confidenceSignal: toLearningSignalLevel(analysis.confidenceSignal),
        analysisConfidence: toLearningSignalLevel(analysis.confidence),
    };
}
function toLearningSignalLevel(value) {
    if (value === 'low' || value === 'medium' || value === 'high') {
        return value;
    }
    return 'low';
}
async function enrichBehaviorSignalsWithAi(options) {
    try {
        const analysis = await aiPrompt_service_1.aiPromptService.generateQuizBehaviorAnalysis(buildQuizBehaviorPromptInput(options));
        return applyQuizBehaviorAnalysis(options.base, analysis);
    }
    catch {
        return options.base;
    }
}
function resolveMostDifficultTopic(topicWrongCount) {
    if (topicWrongCount.size === 0) {
        return mockData_1.demoQuiz.questions[0]?.topic ?? mockData_1.demoQuiz.topic;
    }
    let maxTopic = '';
    let maxCount = 0;
    for (const [topic, count] of topicWrongCount) {
        if (count > maxCount) {
            maxCount = count;
            maxTopic = topic;
        }
    }
    return maxTopic;
}
//# sourceMappingURL=quiz.service.js.map