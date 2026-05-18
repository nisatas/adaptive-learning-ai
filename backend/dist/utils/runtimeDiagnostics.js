"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SSL_ERROR_SAFE_MESSAGE = void 0;
exports.buildAiDiagnosticsResponse = buildAiDiagnosticsResponse;
exports.buildIntegrationsHealth = buildIntegrationsHealth;
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
    parts.push('GET /api/health/integrations ile entegrasyon durumunu kontrol edin.');
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
function buildIntegrationsHealth() {
    const puqStatus = (0, env_1.getPuqAiVariableStatus)();
    return {
        status: 'ok',
        demoMode: (0, env_1.isDemoModeEnabled)(),
        puqai: {
            configured: (0, env_1.isPuqAiConfigured)(),
            chat: puqStatus,
            meetWorkflowUrlConfigured: (0, env_1.isMeetWorkflowConfigured)(),
            supportPlanWorkflowUrlConfigured: Boolean(env_1.env.puqAi.supportPlanWorkflowUrl),
            weeklyReportWorkflowUrlConfigured: Boolean(env_1.env.puqAi.weeklyReportWorkflowUrl),
        },
    };
}
function logStartupDiagnostics() {
    console.log('[Config] NODE_ENV:', env_1.env.nodeEnv);
    console.log('[Config] Port:', env_1.env.port);
    console.log('[Config] Demo mode:', (0, env_1.isDemoModeEnabled)() ? 'enabled' : 'disabled');
    console.log('[Config] Puq.ai API key:', env_1.env.puqAi.apiKey ? 'configured' : 'missing');
    console.log('[Config] Puq.ai base URL:', env_1.env.puqAi.baseUrl ? 'configured' : 'missing');
    console.log('[Config] Puq.ai model:', env_1.env.puqAi.model ? 'configured' : 'missing');
    console.log('[Config] Puq.ai chat endpoint:', env_1.env.puqAi.chatEndpoint ? 'configured' : 'missing');
    console.log('[Config] Puq.ai meet workflow URL:', env_1.env.puqAi.meetWorkflowUrl ? 'configured' : 'missing');
    console.log('[Config] Puq.ai support plan workflow URL:', env_1.env.puqAi.supportPlanWorkflowUrl ? 'configured' : 'missing');
    console.log('[Config] Puq.ai weekly report workflow URL:', env_1.env.puqAi.weeklyReportWorkflowUrl ? 'configured' : 'missing');
    console.log('[NeuroAdapt] Node.js version:', process.version);
    console.log('[NeuroAdapt] OpenSSL version:', process.versions.openssl ?? 'unknown');
}
//# sourceMappingURL=runtimeDiagnostics.js.map