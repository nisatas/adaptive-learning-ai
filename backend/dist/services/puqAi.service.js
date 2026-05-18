"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.puqAiService = exports.PuqAiService = void 0;
exports.formatInsightAsText = formatInsightAsText;
const env_1 = require("../config/env");
const teacherInsight_prompt_1 = require("../prompts/teacherInsight.prompt");
const fallbackTeacherReport_1 = require("../utils/fallbackTeacherReport");
const puqAiClient_1 = require("../utils/puqAiClient");
const sanitizeAiOutput_1 = require("../utils/sanitizeAiOutput");
const AI_PROVIDER = 'Puq.ai';
const MODELS_ENDPOINT = '/router/models';
const CHAT_ENDPOINT_CANDIDATES = [
    '/chat/completions',
    '/router/chat/completions',
    '/v1/chat/completions',
    '/router/completions',
    '/completions',
];
class PuqAiService {
    isConfigured() {
        return (0, env_1.isPuqAiConfigured)();
    }
    getStatusMessage() {
        if (this.isConfigured()) {
            return {
                configured: true,
                message: 'Puq.ai configuration is available',
            };
        }
        return {
            configured: false,
            message: 'Puq.ai configuration is missing. Please check environment variables.',
        };
    }
    isProbeReady() {
        const { apiKey, baseUrl, model } = env_1.env.puqAi;
        return Boolean(apiKey && baseUrl && model);
    }
    async probeChatEndpoints() {
        if (!this.isProbeReady()) {
            return {
                provider: AI_PROVIDER,
                configured: false,
                tested: [],
                message: 'Puq.ai probe için PUQ_AI_API_KEY, PUQ_AI_BASE_URL ve PUQ_AI_MODEL gerekli.',
            };
        }
        console.log('Puq.ai chat endpoint probe started');
        const tested = [];
        for (const endpoint of CHAT_ENDPOINT_CANDIDATES) {
            tested.push(await this.probeSingleChatEndpoint(endpoint));
        }
        const successCount = tested.filter((item) => item.success).length;
        return {
            provider: AI_PROVIDER,
            configured: true,
            tested,
            message: successCount > 0
                ? `${successCount} endpoint başarılı test edildi.`
                : 'Hiçbir aday endpoint başarılı olmadı.',
        };
    }
    async probeSingleChatEndpoint(endpoint) {
        try {
            const url = (0, puqAiClient_1.buildPuqAiUrl)(endpoint);
            const response = await fetch(url, {
                method: 'POST',
                headers: (0, puqAiClient_1.buildPuqAiHeaders)(),
                body: JSON.stringify({
                    model: env_1.env.puqAi.model,
                    messages: [
                        {
                            role: 'user',
                            content: 'Tek kelimelik Türkçe cevap ver: çalışıyor',
                        },
                    ],
                    temperature: 0.1,
                    max_tokens: 20,
                }),
            });
            if (!response.ok) {
                const errorDetails = (0, puqAiClient_1.mapPuqAiHttpErrorForProbe)(response.status);
                return {
                    endpoint,
                    success: false,
                    statusCode: errorDetails.statusCode,
                    errorType: errorDetails.errorType,
                    safeMessage: errorDetails.safeMessage,
                };
            }
            const data = await response.json();
            const content = (0, puqAiClient_1.extractPuqAiContent)(data);
            if (!content) {
                return {
                    endpoint,
                    success: false,
                    statusCode: 200,
                    errorType: 'UNKNOWN_ERROR',
                    safeMessage: 'Endpoint yanıt verdi ancak metin çıkarılamadı.',
                };
            }
            return {
                endpoint,
                success: true,
                statusCode: 200,
                message: 'Endpoint çalışıyor.',
                sampleText: (0, puqAiClient_1.truncateSampleText)(content),
            };
        }
        catch (error) {
            const errorDetails = (0, puqAiClient_1.classifyPuqAiError)(error, 'Endpoint testi başarısız.');
            return {
                endpoint,
                success: false,
                statusCode: errorDetails.statusCode,
                errorType: errorDetails.errorType,
                safeMessage: errorDetails.safeMessage,
            };
        }
    }
    async fetchModels() {
        if (!this.isConfigured()) {
            return {
                provider: AI_PROVIDER,
                configured: false,
                success: false,
                models: [],
                statusCode: null,
                errorType: 'UNKNOWN_ERROR',
                safeMessage: 'Puq.ai ortam değişkenleri eksik. backend/.env dosyasını kontrol edin.',
                message: 'Puq.ai configuration is missing',
            };
        }
        console.log('Puq.ai model fetch started');
        try {
            const url = (0, puqAiClient_1.buildPuqAiUrl)(MODELS_ENDPOINT);
            const response = await fetch(url, {
                method: 'GET',
                headers: (0, puqAiClient_1.buildPuqAiHeaders)(),
            });
            if (!response.ok) {
                const errorDetails = (0, puqAiClient_1.mapPuqAiHttpError)(response.status);
                return this.buildModelsErrorResponse(errorDetails);
            }
            const data = await response.json();
            const models = (0, puqAiClient_1.parseModelsFromResponse)(data);
            console.log('Puq.ai models fetched successfully');
            return {
                provider: AI_PROVIDER,
                configured: true,
                success: true,
                models,
                message: 'Puq.ai models fetched successfully',
            };
        }
        catch (error) {
            const errorDetails = (0, puqAiClient_1.classifyPuqAiError)(error);
            return this.buildModelsErrorResponse(errorDetails);
        }
    }
    buildModelsErrorResponse(errorDetails) {
        return {
            provider: AI_PROVIDER,
            configured: true,
            success: false,
            models: [],
            statusCode: errorDetails.statusCode,
            errorType: errorDetails.errorType,
            safeMessage: errorDetails.safeMessage,
            message: errorDetails.message,
        };
    }
    /**
     * Generic Puq.ai JSON/text completion for modular prompts.
     * Returns null when config missing or request fails — callers use fallback responses.
     */
    async completePrompt(systemPrompt, userPrompt, maxTokens = 300, contextLabel = 'completePrompt') {
        if ((0, env_1.isDemoModeEnabled)()) {
            console.log(`[Puq.ai] ${contextLabel} skipped: DEMO_MODE=true`);
            return null;
        }
        if (!this.isConfigured()) {
            console.warn(`[Puq.ai] ${contextLabel} skipped: missing PUQ_AI_* configuration`);
            return null;
        }
        const { chatEndpoint, model } = env_1.env.puqAi;
        const url = (0, puqAiClient_1.buildPuqAiUrl)(chatEndpoint);
        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: (0, puqAiClient_1.buildPuqAiHeaders)(),
                body: JSON.stringify({
                    model,
                    messages: [
                        { role: 'system', content: systemPrompt },
                        { role: 'user', content: userPrompt },
                    ],
                    temperature: 0.3,
                    max_tokens: maxTokens,
                }),
            });
            if (!response.ok) {
                const errorDetails = (0, puqAiClient_1.mapPuqAiHttpError)(response.status);
                console.error(`[Puq.ai] ${contextLabel} HTTP ${response.status}: ${errorDetails.safeMessage}`);
                return null;
            }
            const data = await response.json();
            const content = (0, puqAiClient_1.extractPuqAiContent)(data);
            if (!content) {
                console.warn(`[Puq.ai] ${contextLabel} empty content in response (parse failed)`);
                return null;
            }
            console.log(`[Puq.ai] ${contextLabel} success`);
            return content;
        }
        catch (error) {
            const errorDetails = (0, puqAiClient_1.classifyPuqAiError)(error, `${contextLabel} request failed.`);
            console.error(`[Puq.ai] ${contextLabel} ${errorDetails.errorType}: ${errorDetails.safeMessage}`);
            return null;
        }
    }
    async generateTeacherInsightReport(input) {
        console.log('Puq.ai teacher report generation started');
        const generatedAt = new Date().toISOString();
        const fallbackReport = (0, fallbackTeacherReport_1.buildFallbackTeacherReport)(input);
        const safeFallbackText = formatInsightAsText(fallbackReport);
        if (!this.isConfigured()) {
            console.log('Puq.ai config missing, fallback used');
            return this.buildResult(fallbackReport, {
                aiUsed: false,
                fallbackUsed: true,
                aiStatus: 'missing_config',
                generatedAt,
                safeFallbackText,
                errorDetails: {
                    statusCode: null,
                    errorType: 'UNKNOWN_ERROR',
                    safeMessage: 'Puq.ai yapılandırması eksik. PUQ_AI_* ortam değişkenlerini kontrol edin.',
                    message: 'Puq.ai teacher report generation failed.',
                },
            });
        }
        try {
            const puqReport = await this.callPuqAiChat(input, fallbackReport);
            console.log('Puq.ai teacher report generated');
            return this.buildResult(puqReport, {
                aiUsed: true,
                fallbackUsed: false,
                aiStatus: 'configured',
                generatedAt,
                safeFallbackText,
            });
        }
        catch (error) {
            console.log('Puq.ai request failed, fallback used');
            const errorDetails = (0, puqAiClient_1.classifyPuqAiError)(error, 'Puq.ai teacher report generation failed.');
            return this.buildResult(fallbackReport, {
                aiUsed: false,
                fallbackUsed: true,
                aiStatus: 'request_failed',
                generatedAt,
                safeFallbackText,
                errorDetails,
            });
        }
    }
    buildResult(report, options) {
        const sanitized = (0, sanitizeAiOutput_1.sanitizeInsightParts)({
            summary: report.summary,
            observations: report.observations,
            recommendations: report.recommendations,
        }, options.safeFallbackText);
        let aiStatus = options.aiStatus;
        let fallbackUsed = options.fallbackUsed;
        let aiUsed = options.aiUsed;
        if (sanitized.wasSanitized) {
            aiStatus = 'fallback';
            fallbackUsed = true;
            aiUsed = false;
        }
        const textRaw = report.teacherNote
            ? report.teacherNote
            : formatInsightAsText({
                summary: sanitized.summary,
                observations: sanitized.observations,
                recommendations: sanitized.recommendations,
            });
        const textResult = (0, sanitizeAiOutput_1.sanitizeAiOutput)(textRaw, options.safeFallbackText);
        if (textResult.wasSanitized) {
            aiStatus = 'fallback';
            fallbackUsed = true;
            aiUsed = false;
        }
        const result = {
            text: textResult.text,
            summary: sanitized.summary,
            observations: sanitized.observations,
            recommendations: sanitized.recommendations,
            aiProvider: AI_PROVIDER,
            aiUsed,
            fallbackUsed,
            aiStatus,
            generatedAt: options.generatedAt,
        };
        if (options.errorDetails) {
            result.statusCode = options.errorDetails.statusCode;
            result.errorType = options.errorDetails.errorType;
            result.safeMessage = options.errorDetails.safeMessage;
        }
        if (aiStatus === 'fallback' && !options.errorDetails) {
            result.statusCode = null;
            result.errorType = 'UNKNOWN_ERROR';
            result.safeMessage =
                'Yapay zeka çıktısı etik dil filtresinden geçirilemedi; güvenli fallback rapor kullanıldı.';
        }
        return result;
    }
    async callPuqAiChat(input, fallbackReport) {
        const content = await this.completePrompt(teacherInsight_prompt_1.TEACHER_INSIGHT_SYSTEM_PROMPT, (0, teacherInsight_prompt_1.buildTeacherInsightUserPrompt)({
            quizTitle: input.quizTitle,
            totalQuestions: input.totalQuestions,
            correctCount: input.correctCount,
            wrongCount: input.wrongCount,
            skippedCount: input.skippedCount,
            averageAnswerTimeMs: input.averageAnswerTimeMs,
            slowQuestionIds: input.slowQuestionIds,
            hesitationCount: input.hesitationCount,
            mostDifficultTopic: input.mostDifficultTopic,
        }), 300, 'teacherInsightReport');
        if (!content) {
            throw new puqAiClient_1.PuqAiHttpError(502);
        }
        return this.parseInsightContent(content, fallbackReport);
    }
    parseInsightContent(content, fallbackReport) {
        const json = tryParseInsightJson(content);
        if (json) {
            return {
                summary: json.summary || fallbackReport.summary,
                observations: json.observations.length > 0
                    ? json.observations
                    : fallbackReport.observations,
                recommendations: json.recommendations.length > 0
                    ? json.recommendations
                    : fallbackReport.recommendations,
                teacherNote: json.teacherNote,
                generatedBy: 'puq-ai',
            };
        }
        return {
            summary: fallbackReport.summary,
            observations: fallbackReport.observations,
            recommendations: fallbackReport.recommendations,
            teacherNote: content,
            generatedBy: 'puq-ai',
        };
    }
}
exports.PuqAiService = PuqAiService;
function tryParseInsightJson(content) {
    const trimmed = content.trim();
    const jsonCandidate = trimmed.startsWith('{')
        ? trimmed
        : extractJsonBlock(trimmed);
    if (!jsonCandidate) {
        return null;
    }
    try {
        const parsed = JSON.parse(jsonCandidate);
        const observations = Array.isArray(parsed.observations)
            ? parsed.observations.filter((o) => typeof o === 'string')
            : [];
        const recommendations = Array.isArray(parsed.recommendations)
            ? parsed.recommendations.filter((r) => typeof r === 'string')
            : [];
        const summary = typeof parsed.summary === 'string' ? parsed.summary : '';
        const teacherNote = typeof parsed.teacherNote === 'string' ? parsed.teacherNote : undefined;
        if (!summary && !teacherNote && observations.length === 0) {
            return null;
        }
        return {
            summary,
            observations,
            recommendations,
            teacherNote,
        };
    }
    catch {
        return null;
    }
}
function extractJsonBlock(text) {
    const start = text.indexOf('{');
    const end = text.lastIndexOf('}');
    if (start === -1 || end === -1 || end <= start) {
        return null;
    }
    return text.slice(start, end + 1);
}
function formatInsightAsText(report) {
    if (report.teacherNote) {
        return report.teacherNote;
    }
    const parts = [report.summary];
    if (report.observations.length > 0) {
        parts.push(report.observations.join(' '));
    }
    if (report.recommendations.length > 0) {
        parts.push(report.recommendations.join(' '));
    }
    return parts.filter(Boolean).join(' ');
}
exports.puqAiService = new PuqAiService();
//# sourceMappingURL=puqAi.service.js.map