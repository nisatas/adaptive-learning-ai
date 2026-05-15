import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

const envCandidates = [
  path.resolve(process.cwd(), '.env'),
  path.resolve(__dirname, '../../.env'),
];

for (const envPath of envCandidates) {
  if (fs.existsSync(envPath)) {
    dotenv.config({ path: envPath });
    break;
  }
}

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

export function getPuqAiVariableStatus(): Record<string, boolean> {
  return {
    PUQ_AI_API_KEY: Boolean(env.puqAi.apiKey),
    PUQ_AI_BASE_URL: Boolean(env.puqAi.baseUrl),
    PUQ_AI_MODEL: Boolean(env.puqAi.model),
    PUQ_AI_CHAT_ENDPOINT: Boolean(env.puqAi.chatEndpoint),
  };
}
