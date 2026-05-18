import {
  env,
  getPuqAiVariableStatus,
  isDemoModeEnabled,
  isMeetWorkflowConfigured,
  isPuqAiConfigured,
} from '../config/env';
import { AiDiagnosticsResponse } from '../types';

export const SSL_ERROR_SAFE_MESSAGE =
  'Node.js sertifika doğrulaması başarısız oldu. Node.js LTS sürümünü güncelleyin veya NODE_EXTRA_CA_CERTS ile güvenilir sertifika ekleyin. Lokal test için geçici NODE_TLS_REJECT_UNAUTHORIZED=0 kullanılabilir.';

function buildRecommendation(): string {
  const tlsBypass =
    process.env.NODE_TLS_REJECT_UNAUTHORIZED === '0' ||
    process.env.NODE_TLS_REJECT_UNAUTHORIZED === 'false';

  const parts: string[] = [];

  if (tlsBypass) {
    parts.push(
      'NODE_TLS_REJECT_UNAUTHORIZED devre dışı (yalnızca lokal geliştirme). Production ortamında kullanmayın.',
    );
  } else {
    parts.push(SSL_ERROR_SAFE_MESSAGE);
  }

  if (!process.env.NODE_EXTRA_CA_CERTS) {
    parts.push(
      'Kurumsal ağ/proxy kullanıyorsanız NODE_EXTRA_CA_CERTS ile güvenilir CA sertifikası tanımlayın.',
    );
  }

  parts.push(
    'GET /api/health/integrations ile entegrasyon durumunu kontrol edin.',
  );

  return parts.join(' ');
}

export function buildAiDiagnosticsResponse(): AiDiagnosticsResponse {
  return {
    node: {
      version: process.version,
      openssl: process.versions.openssl ?? 'unknown',
      platform: process.platform,
      arch: process.arch,
    },
    tls: {
      nodeTlsRejectUnauthorized:
        process.env.NODE_TLS_REJECT_UNAUTHORIZED !== undefined
          ? 'set'
          : 'not_set',
      extraCaCerts: process.env.NODE_EXTRA_CA_CERTS ? 'set' : 'not_set',
    },
    puqAi: {
      baseUrlConfigured: Boolean(env.puqAi.baseUrl),
      chatEndpointConfigured: Boolean(env.puqAi.chatEndpoint),
      modelConfigured: Boolean(env.puqAi.model),
      apiKeyConfigured: Boolean(env.puqAi.apiKey),
      apiKeyPreview: 'hidden',
    },
    recommendation: buildRecommendation(),
  };
}

export function buildIntegrationsHealth() {
  const puqStatus = getPuqAiVariableStatus();
  return {
    status: 'ok',
    demoMode: isDemoModeEnabled(),
    puqai: {
      configured: isPuqAiConfigured(),
      chat: puqStatus,
      meetWorkflowUrlConfigured: isMeetWorkflowConfigured(),
      supportPlanWorkflowUrlConfigured: Boolean(
        env.puqAi.supportPlanWorkflowUrl,
      ),
      weeklyReportWorkflowUrlConfigured: Boolean(
        env.puqAi.weeklyReportWorkflowUrl,
      ),
    },
  };
}

export function logStartupDiagnostics(): void {
  console.log('[Config] NODE_ENV:', env.nodeEnv);
  console.log('[Config] Port:', env.port);
  console.log('[Config] Demo mode:', isDemoModeEnabled() ? 'enabled' : 'disabled');
  console.log(
    '[Config] Puq.ai API key:',
    env.puqAi.apiKey ? 'configured' : 'missing',
  );
  console.log(
    '[Config] Puq.ai base URL:',
    env.puqAi.baseUrl ? 'configured' : 'missing',
  );
  console.log(
    '[Config] Puq.ai model:',
    env.puqAi.model ? 'configured' : 'missing',
  );
  console.log(
    '[Config] Puq.ai chat endpoint:',
    env.puqAi.chatEndpoint ? 'configured' : 'missing',
  );
  console.log(
    '[Config] Puq.ai meet workflow URL:',
    env.puqAi.meetWorkflowUrl ? 'configured' : 'missing',
  );
  console.log(
    '[Config] Puq.ai support plan workflow URL:',
    env.puqAi.supportPlanWorkflowUrl ? 'configured' : 'missing',
  );
  console.log(
    '[Config] Puq.ai weekly report workflow URL:',
    env.puqAi.weeklyReportWorkflowUrl ? 'configured' : 'missing',
  );
  console.log('[NeuroAdapt] Node.js version:', process.version);
  console.log(
    '[NeuroAdapt] OpenSSL version:',
    process.versions.openssl ?? 'unknown',
  );
}
