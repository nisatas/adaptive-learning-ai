import { Request, Response, NextFunction } from 'express';
import { getPuqAiVariableStatus } from '../config/env';
import { puqAiService } from '../services/puqAi.service';
import { buildInsightInputFromTestRequest } from '../services/teacherReport.service';
import { buildAiDiagnosticsResponse } from '../utils/runtimeDiagnostics';
import { AiStatusResponse, AiTestTeacherReportRequest } from '../types';

export function getAiDiagnostics(_req: Request, res: Response): void {
  res.json(buildAiDiagnosticsResponse());
}

export function getAiStatus(_req: Request, res: Response): void {
  const status = puqAiService.getStatusMessage();
  const payload: AiStatusResponse = {
    provider: 'Puq.ai',
    configured: status.configured,
    requiredVariables: getPuqAiVariableStatus(),
    message: status.message,
  };
  res.json(payload);
}

export async function getAiModels(
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const result = await puqAiService.fetchModels();

    if (result.success) {
      res.status(200).json(result);
      return;
    }

    const httpStatus = result.statusCode ?? 502;
    res.status(httpStatus).json(result);
  } catch (error) {
    next(error);
  }
}

export async function postTestChatEndpoints(
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const result = await puqAiService.probeChatEndpoints();
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}

export async function postTestTeacherReport(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const body = req.body as AiTestTeacherReportRequest;

    if (!body.lesson || !body.topic || body.gradeLevel === undefined) {
      res.status(400).json({
        error: 'lesson, topic ve gradeLevel alanları zorunludur.',
      });
      return;
    }

    if (
      body.totalQuestions === undefined ||
      body.correctCount === undefined ||
      body.wrongCount === undefined
    ) {
      res.status(400).json({
        error: 'totalQuestions, correctCount ve wrongCount alanları zorunludur.',
      });
      return;
    }

    const insightInput = buildInsightInputFromTestRequest(body);
    const result = await puqAiService.generateTeacherInsightReport(insightInput);

    const payload: Record<string, unknown> = {
      aiProvider: result.aiProvider,
      aiUsed: result.aiUsed,
      fallbackUsed: result.fallbackUsed,
      aiStatus: result.aiStatus,
      teacherInsight: result.text,
      generatedAt: result.generatedAt,
    };

    if (!result.aiUsed) {
      payload.statusCode = result.statusCode ?? null;
      payload.errorType = result.errorType ?? 'UNKNOWN_ERROR';
      payload.safeMessage =
        result.safeMessage ?? 'Puq.ai kullanılamadı; güvenli fallback rapor döndürüldü.';
    }

    res.json(payload);
  } catch (error) {
    next(error);
  }
}
