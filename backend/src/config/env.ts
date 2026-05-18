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

function readEnv(...keys: string[]): string {
  for (const key of keys) {
    const value = process.env[key];
    if (value != null && String(value).trim().length > 0) {
      return String(value).trim();
    }
  }
  return '';
}

function readDemoMode(): boolean {
  const raw = readEnv('DEMO_MODE', 'NEUROADAPT_DEMO_MODE').toLowerCase();
  return raw === 'true' || raw === '1' || raw === 'yes';
}

export const env = {
  port: parseInt(process.env.PORT ?? '4000', 10),
  nodeEnv: process.env.NODE_ENV ?? 'development',
  demoMode: readDemoMode(),
  puqAi: {
    apiKey: readEnv('PUQ_AI_API_KEY', 'PUQAI_API_KEY', 'PUQ_API_KEY'),
    baseUrl: readEnv('PUQ_AI_BASE_URL', 'PUQAI_BASE_URL', 'PUQ_BASE_URL'),
    model: readEnv('PUQ_AI_MODEL', 'PUQAI_MODEL', 'PUQ_MODEL'),
    chatEndpoint: readEnv(
      'PUQ_AI_CHAT_ENDPOINT',
      'PUQAI_CHAT_ENDPOINT',
      'PUQ_CHAT_ENDPOINT',
    ),
    meetWorkflowUrl: readEnv(
      'PUQ_MEET_WORKFLOW_URL',
      'PUQAI_MEET_WORKFLOW_URL',
      'PUQ_MEET_WORKFLOW_URL',
    ),
    supportPlanWorkflowUrl: readEnv(
      'PUQ_SUPPORT_PLAN_WORKFLOW_URL',
      'PUQAI_SUPPORT_PLAN_WORKFLOW_URL',
    ),
    weeklyReportWorkflowUrl: readEnv(
      'PUQ_WEEKLY_REPORT_WORKFLOW_URL',
      'PUQAI_WEEKLY_REPORT_WORKFLOW_URL',
    ),
  },
};

export function isMeetWorkflowConfigured(): boolean {
  return Boolean(env.puqAi.meetWorkflowUrl);
}

export function isPuqAiConfigured(): boolean {
  const { apiKey, baseUrl, model, chatEndpoint } = env.puqAi;
  return Boolean(apiKey && baseUrl && model && chatEndpoint);
}

export function isDemoModeEnabled(): boolean {
  return env.demoMode;
}

export function getPuqAiVariableStatus(): Record<string, boolean> {
  return {
    PUQ_AI_API_KEY: Boolean(env.puqAi.apiKey),
    PUQ_AI_BASE_URL: Boolean(env.puqAi.baseUrl),
    PUQ_AI_MODEL: Boolean(env.puqAi.model),
    PUQ_AI_CHAT_ENDPOINT: Boolean(env.puqAi.chatEndpoint),
    PUQ_MEET_WORKFLOW_URL: Boolean(env.puqAi.meetWorkflowUrl),
    PUQ_SUPPORT_PLAN_WORKFLOW_URL: Boolean(env.puqAi.supportPlanWorkflowUrl),
    PUQ_WEEKLY_REPORT_WORKFLOW_URL: Boolean(env.puqAi.weeklyReportWorkflowUrl),
  };
}
