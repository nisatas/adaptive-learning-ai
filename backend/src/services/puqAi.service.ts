import { env, isPuqAiConfigured } from '../config/env';
import {
  AiModelsResponse,
  AiStatus,
  ChatEndpointProbeResponse,
  ChatEndpointProbeResult,
  PuqAiInsightResult,
  TeacherInsightInput,
  TeacherInsightReport,
} from '../types';
import { buildFallbackTeacherReport } from '../utils/fallbackTeacherReport';
import {
  buildPuqAiHeaders,
  buildPuqAiUrl,
  classifyPuqAiError,
  extractPuqAiContent,
  mapPuqAiHttpError,
  mapPuqAiHttpErrorForProbe,
  parseModelsFromResponse,
  PuqAiErrorDetails,
  PuqAiHttpError,
  truncateSampleText,
} from '../utils/puqAiClient';
import {
  sanitizeAiOutput,
  sanitizeInsightParts,
} from '../utils/sanitizeAiOutput';

const AI_PROVIDER = 'Puq.ai' as const;
const MODELS_ENDPOINT = '/router/models';

const CHAT_ENDPOINT_CANDIDATES = [
  '/chat/completions',
  '/router/chat/completions',
  '/v1/chat/completions',
  '/router/completions',
  '/completions',
] as const;

export class PuqAiService {
  isConfigured(): boolean {
    return isPuqAiConfigured();
  }

  getStatusMessage(): { configured: boolean; message: string } {
    if (this.isConfigured()) {
      return {
        configured: true,
        message: 'Puq.ai configuration is available',
      };
    }
    return {
      configured: false,
      message:
        'Puq.ai configuration is missing. Please check environment variables.',
    };
  }

  isProbeReady(): boolean {
    const { apiKey, baseUrl, model } = env.puqAi;
    return Boolean(apiKey && baseUrl && model);
  }

  async probeChatEndpoints(): Promise<ChatEndpointProbeResponse> {
    if (!this.isProbeReady()) {
      return {
        provider: AI_PROVIDER,
        configured: false,
        tested: [],
        message:
          'Puq.ai probe için PUQ_AI_API_KEY, PUQ_AI_BASE_URL ve PUQ_AI_MODEL gerekli.',
      };
    }

    console.log('Puq.ai chat endpoint probe started');

    const tested: ChatEndpointProbeResult[] = [];

    for (const endpoint of CHAT_ENDPOINT_CANDIDATES) {
      tested.push(await this.probeSingleChatEndpoint(endpoint));
    }

    const successCount = tested.filter((item) => item.success).length;

    return {
      provider: AI_PROVIDER,
      configured: true,
      tested,
      message:
        successCount > 0
          ? `${successCount} endpoint başarılı test edildi.`
          : 'Hiçbir aday endpoint başarılı olmadı.',
    };
  }

  private async probeSingleChatEndpoint(
    endpoint: string
  ): Promise<ChatEndpointProbeResult> {
    try {
      const url = buildPuqAiUrl(endpoint);
      const response = await fetch(url, {
        method: 'POST',
        headers: buildPuqAiHeaders(),
        body: JSON.stringify({
          model: env.puqAi.model,
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
        const errorDetails = mapPuqAiHttpErrorForProbe(response.status);
        return {
          endpoint,
          success: false,
          statusCode: errorDetails.statusCode,
          errorType: errorDetails.errorType,
          safeMessage: errorDetails.safeMessage,
        };
      }

      const data: unknown = await response.json();
      const content = extractPuqAiContent(data);

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
        sampleText: truncateSampleText(content),
      };
    } catch (error) {
      const errorDetails = classifyPuqAiError(
        error,
        'Endpoint testi başarısız.'
      );

      return {
        endpoint,
        success: false,
        statusCode: errorDetails.statusCode,
        errorType: errorDetails.errorType,
        safeMessage: errorDetails.safeMessage,
      };
    }
  }

  async fetchModels(): Promise<AiModelsResponse> {
    if (!this.isConfigured()) {
      return {
        provider: AI_PROVIDER,
        configured: false,
        success: false,
        models: [],
        statusCode: null,
        errorType: 'UNKNOWN_ERROR',
        safeMessage:
          'Puq.ai ortam değişkenleri eksik. backend/.env dosyasını kontrol edin.',
        message: 'Puq.ai configuration is missing',
      };
    }

    console.log('Puq.ai model fetch started');

    try {
      const url = buildPuqAiUrl(MODELS_ENDPOINT);
      const response = await fetch(url, {
        method: 'GET',
        headers: buildPuqAiHeaders(),
      });

      if (!response.ok) {
        const errorDetails = mapPuqAiHttpError(response.status);
        return this.buildModelsErrorResponse(errorDetails);
      }

      const data: unknown = await response.json();
      const models = parseModelsFromResponse(data);

      console.log('Puq.ai models fetched successfully');

      return {
        provider: AI_PROVIDER,
        configured: true,
        success: true,
        models,
        message: 'Puq.ai models fetched successfully',
      };
    } catch (error) {
      const errorDetails = classifyPuqAiError(error);
      return this.buildModelsErrorResponse(errorDetails);
    }
  }

  private buildModelsErrorResponse(
    errorDetails: PuqAiErrorDetails
  ): AiModelsResponse {
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

  async generateTeacherInsightReport(
    input: TeacherInsightInput
  ): Promise<PuqAiInsightResult> {
    console.log('Puq.ai teacher report generation started');

    const generatedAt = new Date().toISOString();
    const fallbackReport = buildFallbackTeacherReport(input);
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
          safeMessage:
            'Puq.ai yapılandırması eksik. PUQ_AI_* ortam değişkenlerini kontrol edin.',
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
    } catch (error) {
      console.log('Puq.ai request failed, fallback used');
      const errorDetails = classifyPuqAiError(
        error,
        'Puq.ai teacher report generation failed.'
      );
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

  private buildResult(
    report: TeacherInsightReport,
    options: {
      aiUsed: boolean;
      fallbackUsed: boolean;
      aiStatus: AiStatus;
      generatedAt: string;
      safeFallbackText: string;
      errorDetails?: PuqAiErrorDetails;
    }
  ): PuqAiInsightResult {
    const sanitized = sanitizeInsightParts(
      {
        summary: report.summary,
        observations: report.observations,
        recommendations: report.recommendations,
      },
      options.safeFallbackText
    );

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

    const textResult = sanitizeAiOutput(textRaw, options.safeFallbackText);

    if (textResult.wasSanitized) {
      aiStatus = 'fallback';
      fallbackUsed = true;
      aiUsed = false;
    }

    const result: PuqAiInsightResult = {
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

  private async callPuqAiChat(
    input: TeacherInsightInput,
    fallbackReport: TeacherInsightReport
  ): Promise<TeacherInsightReport> {
    const { chatEndpoint, model } = env.puqAi;
    const url = buildPuqAiUrl(chatEndpoint);

    const systemPrompt =
      'Sen eğitim teknolojileri alanında etik rapor yazan bir asistansın. Tanı koyma, öğrenciyi etiketleme, DEHB/disleksi/bozukluk gibi ifadeler kullanma. Sadece pedagojik gözlem ve destek önerisi yaz. Yanıtı mümkünse JSON formatında ver: {"summary":"...","observations":["..."],"recommendations":["..."],"teacherNote":"..."}';

    const userPrompt = [
      'Aşağıdaki quiz davranış verisine göre öğretmen için kısa, anlaşılır ve aksiyona dönük Türkçe rapor üret.',
      JSON.stringify({
        quizTitle: input.quizTitle,
        totalQuestions: input.totalQuestions,
        correctCount: input.correctCount,
        wrongCount: input.wrongCount,
        skippedCount: input.skippedCount,
        averageAnswerTimeMs: input.averageAnswerTimeMs,
        slowQuestionIds: input.slowQuestionIds,
        hesitationCount: input.hesitationCount,
        mostDifficultTopic: input.mostDifficultTopic,
      }),
    ].join('\n');

    const response = await fetch(url, {
      method: 'POST',
      headers: buildPuqAiHeaders(),
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.3,
        max_tokens: 300,
      }),
    });

    if (!response.ok) {
      throw new PuqAiHttpError(response.status);
    }

    const data: unknown = await response.json();
    const content = extractPuqAiContent(data);

    if (!content) {
      throw new PuqAiHttpError(502);
    }

    return this.parseInsightContent(content, fallbackReport);
  }

  private parseInsightContent(
    content: string,
    fallbackReport: TeacherInsightReport
  ): TeacherInsightReport {
    const json = tryParseInsightJson(content);

    if (json) {
      return {
        summary: json.summary || fallbackReport.summary,
        observations:
          json.observations.length > 0
            ? json.observations
            : fallbackReport.observations,
        recommendations:
          json.recommendations.length > 0
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

function tryParseInsightJson(content: string): {
  summary: string;
  observations: string[];
  recommendations: string[];
  teacherNote?: string;
} | null {
  const trimmed = content.trim();

  const jsonCandidate = trimmed.startsWith('{')
    ? trimmed
    : extractJsonBlock(trimmed);

  if (!jsonCandidate) {
    return null;
  }

  try {
    const parsed = JSON.parse(jsonCandidate) as {
      summary?: unknown;
      observations?: unknown;
      recommendations?: unknown;
      teacherNote?: unknown;
    };

    const observations = Array.isArray(parsed.observations)
      ? parsed.observations.filter((o): o is string => typeof o === 'string')
      : [];

    const recommendations = Array.isArray(parsed.recommendations)
      ? parsed.recommendations.filter((r): r is string => typeof r === 'string')
      : [];

    const summary = typeof parsed.summary === 'string' ? parsed.summary : '';
    const teacherNote =
      typeof parsed.teacherNote === 'string' ? parsed.teacherNote : undefined;

    if (!summary && !teacherNote && observations.length === 0) {
      return null;
    }

    return {
      summary,
      observations,
      recommendations,
      teacherNote,
    };
  } catch {
    return null;
  }
}

function extractJsonBlock(text: string): string | null {
  const start = text.indexOf('{');
  const end = text.lastIndexOf('}');
  if (start === -1 || end === -1 || end <= start) {
    return null;
  }
  return text.slice(start, end + 1);
}

export function formatInsightAsText(report: {
  summary: string;
  observations: string[];
  recommendations: string[];
  teacherNote?: string;
}): string {
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

export const puqAiService = new PuqAiService();
