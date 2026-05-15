import { env, isPuqAiConfigured } from '../config/env';
import { TeacherInsightInput, TeacherInsightReport } from '../types';
import { buildFallbackTeacherReport } from '../utils/fallbackTeacherReport';

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

  async generateTeacherInsightReport(
    input: TeacherInsightInput
  ): Promise<TeacherInsightReport> {
    if (!this.isConfigured()) {
      return buildFallbackTeacherReport(input);
    }

    try {
      return await this.callPuqAi(input);
    } catch {
      return buildFallbackTeacherReport(input);
    }
  }

  private async callPuqAi(
    input: TeacherInsightInput
  ): Promise<TeacherInsightReport> {
    const { apiKey, baseUrl, chatEndpoint, model } = env.puqAi;

    // TODO: Replace with real Puq.ai request once endpoint contract is confirmed.
    // Endpoint is read from PUQ_AI_CHAT_ENDPOINT — do not hardcode a fixed path.
    const url = `${baseUrl.replace(/\/$/, '')}${chatEndpoint.startsWith('/') ? chatEndpoint : `/${chatEndpoint}`}`;

    const systemPrompt = [
      'Sen bir pedagojik öğrenme analisti asistanısın.',
      'Öğretmene etik, destekleyici ve kısa bir öğrenme içgörü raporu üret.',
      'Asla tıbbi veya psikolojik tanı, etiket veya risk grubu ifadesi kullanma.',
      'DEHB, disleksi, bozukluk, tanı, riskli öğrenci gibi kelimeler kullanma.',
      'Yanıtı JSON olarak ver: { "summary": string, "observations": string[], "recommendations": string[] }',
    ].join(' ');

    const userPrompt = JSON.stringify({
      quizTitle: input.quizTitle,
      totalQuestions: input.totalQuestions,
      correctCount: input.correctCount,
      wrongCount: input.wrongCount,
      skippedCount: input.skippedCount,
      averageAnswerTimeMs: input.averageAnswerTimeMs,
      slowQuestionIds: input.slowQuestionIds,
      hesitationCount: input.hesitationCount,
    });

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
      }),
    });

    if (!response.ok) {
      throw new Error(`Puq.ai request failed with status ${response.status}`);
    }

    const data = (await response.json()) as Record<string, unknown>;
    const parsed = this.parsePuqAiResponse(data);

    return {
      ...parsed,
      generatedBy: 'puq-ai',
    };
  }

  private parsePuqAiResponse(data: Record<string, unknown>): Omit<TeacherInsightReport, 'generatedBy'> {
    // TODO: Adapt parser to actual Puq.ai response shape when documented.
    const content =
      (data as { choices?: Array<{ message?: { content?: string } }> })
        ?.choices?.[0]?.message?.content ??
      (data as { content?: string })?.content ??
      (data as { text?: string })?.text;

    if (typeof content === 'string') {
      try {
        const json = JSON.parse(content) as {
          summary?: string;
          observations?: string[];
          recommendations?: string[];
        };
        if (json.summary) {
          return {
            summary: json.summary,
            observations: json.observations ?? [],
            recommendations: json.recommendations ?? [],
          };
        }
      } catch {
        return {
          summary: content,
          observations: [],
          recommendations: [],
        };
      }
    }

    throw new Error('Unable to parse Puq.ai response');
  }
}

export const puqAiService = new PuqAiService();
