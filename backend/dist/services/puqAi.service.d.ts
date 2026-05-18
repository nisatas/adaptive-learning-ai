import { AiModelsResponse, ChatEndpointProbeResponse, PuqAiInsightResult, TeacherInsightInput } from '../types';
export declare class PuqAiService {
    isConfigured(): boolean;
    getStatusMessage(): {
        configured: boolean;
        message: string;
    };
    isProbeReady(): boolean;
    probeChatEndpoints(): Promise<ChatEndpointProbeResponse>;
    private probeSingleChatEndpoint;
    fetchModels(): Promise<AiModelsResponse>;
    private buildModelsErrorResponse;
    /**
     * Generic Puq.ai JSON/text completion for modular prompts.
     * Returns null when config missing or request fails — callers use fallback responses.
     */
    completePrompt(systemPrompt: string, userPrompt: string, maxTokens?: number, contextLabel?: string): Promise<string | null>;
    generateTeacherInsightReport(input: TeacherInsightInput): Promise<PuqAiInsightResult>;
    private buildResult;
    private callPuqAiChat;
    private parseInsightContent;
}
export declare function formatInsightAsText(report: {
    summary: string;
    observations: string[];
    recommendations: string[];
    teacherNote?: string;
}): string;
export declare const puqAiService: PuqAiService;
//# sourceMappingURL=puqAi.service.d.ts.map