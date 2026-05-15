import { Request, Response, NextFunction } from 'express';
import {
  getDemoQuizPublic,
  QuizServiceError,
  submitDemoQuiz,
} from '../services/quiz.service';
import { QuizSubmissionRequest } from '../types';

export function getDemoQuiz(_req: Request, res: Response): void {
  res.json(getDemoQuizPublic());
}

export function postDemoQuizSubmit(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  try {
    const body = req.body as QuizSubmissionRequest;
    const result = submitDemoQuiz(body);
    res.json(result);
  } catch (error) {
    next(error);
  }
}

export function handleQuizError(
  error: Error,
  _req: Request,
  res: Response,
  next: NextFunction
): void {
  if (error instanceof QuizServiceError) {
    res.status(error.statusCode).json({ error: error.message });
    return;
  }
  next(error);
}
