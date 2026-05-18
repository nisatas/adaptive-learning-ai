import { Request, Response } from 'express';
import { buildIntegrationsHealth } from '../utils/runtimeDiagnostics';
import { HealthResponse } from '../types';

export function getHealth(_req: Request, res: Response): void {
  const payload: HealthResponse = {
    status: 'ok',
    message: 'NeuroAdapt backend is running',
  };
  res.json(payload);
}

export function getIntegrationsHealth(_req: Request, res: Response): void {
  res.json(buildIntegrationsHealth());
}
