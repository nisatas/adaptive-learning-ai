"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.env = void 0;
exports.isMeetWorkflowConfigured = isMeetWorkflowConfigured;
exports.isPuqAiConfigured = isPuqAiConfigured;
exports.isDemoModeEnabled = isDemoModeEnabled;
exports.getPuqAiVariableStatus = getPuqAiVariableStatus;
const dotenv_1 = __importDefault(require("dotenv"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const envCandidates = [
    path_1.default.resolve(process.cwd(), '.env'),
    path_1.default.resolve(__dirname, '../../.env'),
];
for (const envPath of envCandidates) {
    if (fs_1.default.existsSync(envPath)) {
        dotenv_1.default.config({ path: envPath });
        break;
    }
}
function readEnv(...keys) {
    for (const key of keys) {
        const value = process.env[key];
        if (value != null && String(value).trim().length > 0) {
            return String(value).trim();
        }
    }
    return '';
}
function readDemoMode() {
    const raw = readEnv('DEMO_MODE', 'NEUROADAPT_DEMO_MODE').toLowerCase();
    return raw === 'true' || raw === '1' || raw === 'yes';
}
exports.env = {
    port: parseInt(process.env.PORT ?? '4000', 10),
    nodeEnv: process.env.NODE_ENV ?? 'development',
    demoMode: readDemoMode(),
    puqAi: {
        apiKey: readEnv('PUQ_AI_API_KEY', 'PUQAI_API_KEY', 'PUQ_API_KEY'),
        baseUrl: readEnv('PUQ_AI_BASE_URL', 'PUQAI_BASE_URL', 'PUQ_BASE_URL'),
        model: readEnv('PUQ_AI_MODEL', 'PUQAI_MODEL', 'PUQ_MODEL'),
        chatEndpoint: readEnv('PUQ_AI_CHAT_ENDPOINT', 'PUQAI_CHAT_ENDPOINT', 'PUQ_CHAT_ENDPOINT'),
        meetWorkflowUrl: readEnv('PUQ_MEET_WORKFLOW_URL', 'PUQAI_MEET_WORKFLOW_URL', 'PUQ_MEET_WORKFLOW_URL'),
        supportPlanWorkflowUrl: readEnv('PUQ_SUPPORT_PLAN_WORKFLOW_URL', 'PUQAI_SUPPORT_PLAN_WORKFLOW_URL'),
        weeklyReportWorkflowUrl: readEnv('PUQ_WEEKLY_REPORT_WORKFLOW_URL', 'PUQAI_WEEKLY_REPORT_WORKFLOW_URL'),
    },
};
function isMeetWorkflowConfigured() {
    return Boolean(exports.env.puqAi.meetWorkflowUrl);
}
function isPuqAiConfigured() {
    const { apiKey, baseUrl, model, chatEndpoint } = exports.env.puqAi;
    return Boolean(apiKey && baseUrl && model && chatEndpoint);
}
function isDemoModeEnabled() {
    return exports.env.demoMode;
}
function getPuqAiVariableStatus() {
    return {
        PUQ_AI_API_KEY: Boolean(exports.env.puqAi.apiKey),
        PUQ_AI_BASE_URL: Boolean(exports.env.puqAi.baseUrl),
        PUQ_AI_MODEL: Boolean(exports.env.puqAi.model),
        PUQ_AI_CHAT_ENDPOINT: Boolean(exports.env.puqAi.chatEndpoint),
        PUQ_MEET_WORKFLOW_URL: Boolean(exports.env.puqAi.meetWorkflowUrl),
        PUQ_SUPPORT_PLAN_WORKFLOW_URL: Boolean(exports.env.puqAi.supportPlanWorkflowUrl),
        PUQ_WEEKLY_REPORT_WORKFLOW_URL: Boolean(exports.env.puqAi.weeklyReportWorkflowUrl),
    };
}
//# sourceMappingURL=env.js.map