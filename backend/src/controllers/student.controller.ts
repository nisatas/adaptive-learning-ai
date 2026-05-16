import { Request, Response, NextFunction } from 'express';
import {
  getStudentDashboard,
  StudentDashboardServiceError,
} from '../services/studentDashboard.service';

export function getStudentDashboardHandler(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  try {
    const studentId = String(req.params.studentId);
    res.json(getStudentDashboard(studentId));
  } catch (error) {
    if (error instanceof StudentDashboardServiceError) {
      res.status(error.statusCode).json({ error: error.message });
      return;
    }
    next(error);
  }
}
