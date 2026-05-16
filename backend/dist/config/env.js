"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.env = void 0;
exports.isMeetWorkflowConfigured = isMeetWorkflowConfigured;
exports.isPuqAiConfigured = isPuqAiConfigured;
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
exports.env = {
    port: parseInt(process.env.PORT ?? '4000', 10),
    nodeEnv: process.env.NODE_ENV ?? 'development',
    puqAi: {
        apiKey: process.env.PUQ_AI_API_KEY ?? '',
        baseUrl: process.env.PUQ_AI_BASE_URL ?? '',
        model: process.env.PUQ_AI_MODEL ?? '',
        chatEndpoint: process.env.PUQ_AI_CHAT_ENDPOINT ?? '',
        meetWorkflowUrl: process.env.PUQ_MEET_WORKFLOW_URL ?? '',
    },
};
function isMeetWorkflowConfigured() {
    return Boolean(exports.env.puqAi.meetWorkflowUrl.trim());
}
function isPuqAiConfigured() {
    const { apiKey, baseUrl, model, chatEndpoint } = exports.env.puqAi;
    return Boolean(apiKey && baseUrl && model && chatEndpoint);
}
function getPuqAiVariableStatus() {
    return {
        PUQ_AI_API_KEY: Boolean(exports.env.puqAi.apiKey),
        PUQ_AI_BASE_URL: Boolean(exports.env.puqAi.baseUrl),
        PUQ_AI_MODEL: Boolean(exports.env.puqAi.model),
        PUQ_AI_CHAT_ENDPOINT: Boolean(exports.env.puqAi.chatEndpoint),
    };
}
//# sourceMappingURL=env.js.map