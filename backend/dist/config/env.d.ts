export declare const env: {
    port: number;
    nodeEnv: string;
    puqAi: {
        apiKey: string;
        baseUrl: string;
        model: string;
        chatEndpoint: string;
        meetWorkflowUrl: string;
    };
};
export declare function isMeetWorkflowConfigured(): boolean;
export declare function isPuqAiConfigured(): boolean;
export declare function getPuqAiVariableStatus(): Record<string, boolean>;
//# sourceMappingURL=env.d.ts.map