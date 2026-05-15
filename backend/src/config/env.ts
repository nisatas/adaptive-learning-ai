import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config();

export const env = {
  port: parseInt(process.env.PORT ?? '4000', 10),
  nodeEnv: process.env.NODE_ENV ?? 'development',
  puqAi: {
    apiKey: process.env.PUQ_AI_API_KEY ?? '',
    baseUrl: process.env.PUQ_AI_BASE_URL ?? '',
    model: process.env.PUQ_AI_MODEL ?? '',
    chatEndpoint: process.env.PUQ_AI_CHAT_ENDPOINT ?? '',
  },
};

export function isPuqAiConfigured(): boolean {
  const { apiKey, baseUrl, model, chatEndpoint } = env.puqAi;
  return Boolean(apiKey && baseUrl && model && chatEndpoint);
}
