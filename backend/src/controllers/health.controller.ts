import { Request, Response } from 'express';
import { HealthResponse } from '../types';

export function getHealth(_req: Request, res: Response): void {
  const payload: HealthResponse = {
    status: 'ok',
    message: 'NeuroAdapt backend is running',
  };
  res.json(payload);
}
