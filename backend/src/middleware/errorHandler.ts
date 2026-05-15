import { Request, Response, NextFunction } from 'express';

export function globalErrorHandler(
  error: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  console.error('[NeuroAdapt Error]', error.message);
  res.status(500).json({
    error: 'Sunucu hatası oluştu. Lütfen daha sonra tekrar deneyin.',
  });
}
