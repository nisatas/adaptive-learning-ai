import { Request, Response, NextFunction } from 'express';
export declare function getAiDiagnostics(_req: Request, res: Response): void;
export declare function getAiStatus(_req: Request, res: Response): void;
export declare function getAiModels(_req: Request, res: Response, next: NextFunction): Promise<void>;
export declare function postTestChatEndpoints(_req: Request, res: Response, next: NextFunction): Promise<void>;
export declare function postTestTeacherReport(req: Request, res: Response, next: NextFunction): Promise<void>;
//# sourceMappingURL=ai.controller.d.ts.map