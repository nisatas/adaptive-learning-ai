"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SSL_ERROR_SAFE_MESSAGE = void 0;
exports.buildAiDiagnosticsResponse = buildAiDiagnosticsResponse;
exports.logStartupDiagnostics = logStartupDiagnostics;
const env_1 = require("../config/env");
exports.SSL_ERROR_SAFE_MESSAGE = 'Node.js sertifika doğrulaması başarısız oldu. Node.js LTS sürümünü güncelleyin veya NODE_EXTRA_CA_CERTS ile güvenilir sertifika ekleyin. Lokal test için geçici NODE_TLS_REJECT_UNAUTHORIZED=0 kullanılabilir.';
function buildRecommendation() {
    const tlsBypass = process.env.NODE_TLS_REJECT_UNAUTHORIZED === '0' ||
        process.env.NODE_TLS_REJECT_UNAUTHORIZED === 'false';
    const parts = [];
    if (tlsBypass) {
        parts.push('NODE_TLS_REJECT_UNAUTHORIZED devre dışı (yalnızca lokal geliştirme). Production ortamında kullanmayın.');
    }
    else {
        parts.push(exports.SSL_ERROR_SAFE_MESSAGE);
    }
    if (!process.env.NODE_EXTRA_CA_CERTS) {
        parts.push('Kurumsal ağ/proxy kullanıyorsanız NODE_EXTRA_CA_CERTS ile güvenilir CA sertifikası tanımlayın.');
    }
    parts.push('GET /api/ai/diagnostics ile Node.js ve TLS yapılandırmasını kontrol edin.');
    return parts.join(' ');
}
function buildAiDiagnosticsResponse() {
    return {
        node: {
            version: process.version,
            openssl: process.versions.openssl ?? 'unknown',
            platform: process.platform,
            arch: process.arch,
        },
        tls: {
            nodeTlsRejectUnauthorized: process.env.NODE_TLS_REJECT_UNAUTHORIZED !== undefined
                ? 'set'
                : 'not_set',
            extraCaCerts: process.env.NODE_EXTRA_CA_CERTS ? 'set' : 'not_set',
        },
        puqAi: {
            baseUrlConfigured: Boolean(env_1.env.puqAi.baseUrl),
            chatEndpointConfigured: Boolean(env_1.env.puqAi.chatEndpoint),
            modelConfigured: Boolean(env_1.env.puqAi.model),
            apiKeyConfigured: Boolean(env_1.env.puqAi.apiKey),
            apiKeyPreview: 'hidden',
        },
        recommendation: buildRecommendation(),
    };
}
function logStartupDiagnostics() {
    console.log('[NeuroAdapt] Node.js version:', process.version);
    console.log('[NeuroAdapt] OpenSSL version:', process.versions.openssl ?? 'unknown');
    console.log('[NeuroAdapt] Platform:', process.platform, process.arch);
    console.log('[NeuroAdapt] Puq.ai baseUrl configured:', Boolean(env_1.env.puqAi.baseUrl));
    console.log('[NeuroAdapt] Puq.ai model configured:', Boolean(env_1.env.puqAi.model));
    console.log('[NeuroAdapt] Puq.ai chat endpoint configured:', Boolean(env_1.env.puqAi.chatEndpoint));
    console.log('[NeuroAdapt] Puq.ai API key configured:', Boolean(env_1.env.puqAi.apiKey));
}
//# sourceMappingURL=runtimeDiagnostics.js.map