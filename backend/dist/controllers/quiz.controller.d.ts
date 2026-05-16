import { Request, Response, NextFunction } from 'express';
export declare function getDemoQuiz(_req: Request, res: Response): void;
export declare function postDemoQuizSubmit(req: Request, res: Response, next: NextFunction): Promise<void>;
export declare function handleQuizError(error: Error, _req: Request, res: Response, next: NextFunction): void;
//# sourceMappingURL=quiz.controller.d.ts.map