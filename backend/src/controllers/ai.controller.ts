import { Request, Response } from 'express';
import { puqAiService } from '../services/puqAi.service';
import { AiStatusResponse } from '../types';

export function getAiStatus(_req: Request, res: Response): void {
  const status = puqAiService.getStatusMessage();
  const payload: AiStatusResponse = {
    provider: 'Puq.ai',
    configured: status.configured,
    message: status.message,
  };
  res.json(payload);
}
