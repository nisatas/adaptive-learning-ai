import { AiDiagnosticsResponse } from '../types';
export declare const SSL_ERROR_SAFE_MESSAGE = "Node.js sertifika do\u011Frulamas\u0131 ba\u015Far\u0131s\u0131z oldu. Node.js LTS s\u00FCr\u00FCm\u00FCn\u00FC g\u00FCncelleyin veya NODE_EXTRA_CA_CERTS ile g\u00FCvenilir sertifika ekleyin. Lokal test i\u00E7in ge\u00E7ici NODE_TLS_REJECT_UNAUTHORIZED=0 kullan\u0131labilir.";
export declare function buildAiDiagnosticsResponse(): AiDiagnosticsResponse;
export declare function buildIntegrationsHealth(): {
    status: string;
    demoMode: boolean;
    puqai: {
        configured: boolean;
        chat: Record<string, boolean>;
        meetWorkflowUrlConfigured: boolean;
        supportPlanWorkflowUrlConfigured: boolean;
        weeklyReportWorkflowUrlConfigured: boolean;
    };
};
export declare function logStartupDiagnostics(): void;
//# sourceMappingURL=runtimeDiagnostics.d.ts.map