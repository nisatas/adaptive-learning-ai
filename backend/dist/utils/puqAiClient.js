"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PuqAiHttpError = void 0;
exports.buildPuqAiUrl = buildPuqAiUrl;
exports.buildPuqAiHeaders = buildPuqAiHeaders;
exports.mapPuqAiHttpErrorForProbe = mapPuqAiHttpErrorForProbe;
exports.mapPuqAiHttpError = mapPuqAiHttpError;
exports.classifyPuqAiError = classifyPuqAiError;
exports.extractPuqAiContent = extractPuqAiContent;
exports.parseModelsFromResponse = parseModelsFromResponse;
exports.truncateSampleText = truncateSampleText;
const env_1 = require("../config/env");
const runtimeDiagnostics_1 = require("./runtimeDiagnostics");
class PuqAiHttpError extends Error {
    statusCode;
    constructor(statusCode) {
        super(`Puq.ai HTTP error: ${statusCode}`);
        this.statusCode = statusCode;
        this.name = 'PuqAiHttpError';
    }
}
exports.PuqAiHttpError = PuqAiHttpError;
function buildPuqAiUrl(endpointPath) {
    const base = env_1.env.puqAi.baseUrl.replace(/\/$/, '');
    const path = endpointPath.startsWith('/') ? endpointPath : `/${endpointPath}`;
    return `${base}${path}`;
}
function buildPuqAiHeaders() {
    return {
        'Content-Type': 'application/json',
        Authorization: `Token ${env_1.env.puqAi.apiKey}`,
    };
}
function mapPuqAiHttpErrorForProbe(status) {
    if (status === 401 || status === 403) {
        return {
            statusCode: status,
            errorType: 'AUTH_ERROR',
            safeMessage: 'API key veya yetki bilgisi hatalı olabilir.',
            message: 'Endpoint testi başarısız.',
        };
    }
    if (status === 402) {
        return {
            statusCode: 402,
            errorType: 'CREDIT_ERROR',
            safeMessage: 'Hesapta yeterli bakiye veya kredi bulunmuyor.',
            message: 'Endpoint testi başarısız.',
        };
    }
    if (status === 404) {
        return {
            statusCode: 404,
            errorType: 'ENDPOINT_NOT_FOUND',
            safeMessage: 'Endpoint bulunamadı.',
            message: 'Endpoint testi başarısız.',
        };
    }
    return {
        statusCode: status >= 500 ? 502 : status,
        errorType: 'UNKNOWN_ERROR',
        safeMessage: `İstek başarısız oldu (HTTP ${status}).`,
        message: 'Endpoint testi başarısız.',
    };
}
function mapPuqAiHttpError(status) {
    if (status === 401 || status === 403) {
        return {
            statusCode: status,
            errorType: 'AUTH_ERROR',
            safeMessage: 'Puq.ai API key veya yetki bilgisi hatalı olabilir. Anahtar ve model erişimini kontrol edin.',
            message: 'Puq.ai model listesi alınamadı.',
        };
    }
    if (status === 402) {
        return {
            statusCode: 402,
            errorType: 'CREDIT_ERROR',
            safeMessage: 'Puq.ai hesabında yeterli bakiye veya kredi bulunmuyor. Balance/credit durumunu kontrol edin.',
            message: 'Puq.ai model listesi alınamadı.',
        };
    }
    if (status === 404) {
        return {
            statusCode: 404,
            errorType: 'ENDPOINT_NOT_FOUND',
            safeMessage: 'Puq.ai endpoint bulunamadı. BASE_URL ve CHAT_ENDPOINT değerlerini kontrol edin.',
            message: 'Puq.ai model listesi alınamadı.',
        };
    }
    const responseStatus = status >= 500 ? 502 : status;
    return {
        statusCode: responseStatus,
        errorType: 'UNKNOWN_ERROR',
        safeMessage: `Puq.ai isteği başarısız oldu (HTTP ${status}).`,
        message: 'Puq.ai model listesi alınamadı.',
    };
}
function collectErrorText(error) {
    const parts = [];
    let current = error;
    while (current instanceof Error) {
        parts.push(current.message);
        const code = current.code;
        if (code)
            parts.push(code);
        current = current.cause;
    }
    if (parts.length === 0 && error !== undefined) {
        parts.push(String(error));
    }
    return parts.join(' ').toLowerCase();
}
function isSslError(error) {
    const message = collectErrorText(error);
    return (message.includes('certificate') ||
        message.includes('ssl') ||
        message.includes('unable to verify') ||
        message.includes('leaf signature') ||
        message.includes('self signed') ||
        message.includes('cert_'));
}
function isNetworkError(error) {
    const message = collectErrorText(error);
    const code = error?.code?.toUpperCase() ?? '';
    return (message.includes('fetch failed') ||
        message.includes('network') ||
        message.includes('econnrefused') ||
        message.includes('enotfound') ||
        message.includes('etimedout') ||
        message.includes('getaddrinfo') ||
        code === 'ECONNREFUSED' ||
        code === 'ENOTFOUND' ||
        code === 'ETIMEDOUT' ||
        code === 'EAI_AGAIN');
}
function classifyPuqAiError(error, fallbackMessage = 'Puq.ai model listesi alınamadı.') {
    if (error instanceof PuqAiHttpError) {
        const mapped = mapPuqAiHttpError(error.statusCode);
        return { ...mapped, message: fallbackMessage };
    }
    if (isSslError(error)) {
        return {
            statusCode: null,
            errorType: 'SSL_ERROR',
            safeMessage: runtimeDiagnostics_1.SSL_ERROR_SAFE_MESSAGE,
            message: fallbackMessage,
        };
    }
    if (isNetworkError(error)) {
        return {
            statusCode: null,
            errorType: 'NETWORK_ERROR',
            safeMessage: 'Puq.ai sunucusuna bağlanılamadı. İnternet bağlantısı, firewall veya proxy ayarlarını kontrol edin.',
            message: fallbackMessage,
        };
    }
    return {
        statusCode: null,
        errorType: 'UNKNOWN_ERROR',
        safeMessage: 'Puq.ai isteği beklenmeyen bir hata ile sonuçlandı.',
        message: fallbackMessage,
    };
}
function extractPuqAiContent(data) {
    if (!data || typeof data !== 'object') {
        return null;
    }
    const root = data;
    const nested = root.data && typeof root.data === 'object'
        ? root.data
        : null;
    const choices = nested?.choices ??
        root.choices;
    const choiceContent = choices?.[0]?.message?.content;
    const candidates = [
        choiceContent,
        nested?.output,
        root.output,
        nested?.text,
        root.text,
        nested?.message,
        root.message,
        nested?.content,
        root.content,
    ];
    for (const candidate of candidates) {
        if (typeof candidate === 'string' && candidate.trim().length > 0) {
            return candidate.trim();
        }
    }
    return null;
}
function parseModelsFromResponse(data) {
    const ids = new Set();
    const addModel = (value) => {
        if (typeof value === 'string' && value.trim()) {
            ids.add(value.trim());
            return;
        }
        if (value && typeof value === 'object') {
            const obj = value;
            if (typeof obj.id === 'string')
                ids.add(obj.id);
            if (typeof obj.model === 'string')
                ids.add(obj.model);
            if (typeof obj.name === 'string')
                ids.add(obj.name);
        }
    };
    const walk = (node) => {
        if (Array.isArray(node)) {
            node.forEach(walk);
            return;
        }
        if (!node || typeof node !== 'object') {
            return;
        }
        const obj = node;
        if (Array.isArray(obj.models)) {
            obj.models.forEach(addModel);
        }
        if (Array.isArray(obj.data)) {
            obj.data.forEach(addModel);
        }
        addModel(node);
    };
    walk(data);
    return Array.from(ids).sort();
}
function truncateSampleText(text, maxLength = 120) {
    const trimmed = text.trim();
    if (trimmed.length <= maxLength) {
        return trimmed;
    }
    return `${trimmed.slice(0, maxLength)}...`;
}
//# sourceMappingURL=puqAiClient.js.map