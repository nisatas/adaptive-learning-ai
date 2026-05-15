import { env } from '../config/env';
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
      'NODE_TLS_REJECT_UNAUTHORIZED devre dışı (yalnızca lokal geliştirme). Production ortamında kullanmayın.'
    );
  } else {
    parts.push(SSL_ERROR_SAFE_MESSAGE);
  }

  if (!process.env.NODE_EXTRA_CA_CERTS) {
    parts.push(
      'Kurumsal ağ/proxy kullanıyorsanız NODE_EXTRA_CA_CERTS ile güvenilir CA sertifikası tanımlayın.'
    );
  }

  parts.push(
    'GET /api/ai/diagnostics ile Node.js ve TLS yapılandırmasını kontrol edin.'
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

export function logStartupDiagnostics(): void {
  console.log('[NeuroAdapt] Node.js version:', process.version);
  console.log('[NeuroAdapt] OpenSSL version:', process.versions.openssl ?? 'unknown');
  console.log('[NeuroAdapt] Platform:', process.platform, process.arch);
  console.log('[NeuroAdapt] Puq.ai baseUrl configured:', Boolean(env.puqAi.baseUrl));
  console.log('[NeuroAdapt] Puq.ai model configured:', Boolean(env.puqAi.model));
  console.log(
    '[NeuroAdapt] Puq.ai chat endpoint configured:',
    Boolean(env.puqAi.chatEndpoint)
  );
  console.log('[NeuroAdapt] Puq.ai API key configured:', Boolean(env.puqAi.apiKey));
}
