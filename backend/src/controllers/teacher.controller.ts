import { Request, Response, NextFunction } from 'express';
import {
  getTeacherDashboard,
  getTeacherStudentsList,
} from '../services/teacher.service';
import { buildTeacherReport } from '../services/teacherReport.service';
import { isValidStudent } from '../services/quiz.service';

export async function getDashboard(
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    res.json(await getTeacherDashboard());
  } catch (error) {
    next(error);
  }
}

export function getStudents(_req: Request, res: Response): void {
  res.json(getTeacherStudentsList());
}

export async function getStudentReport(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const studentId = String(req.params.studentId);

    if (!isValidStudent(studentId)) {
      res.status(404).json({
        error: `Bilinmeyen öğrenci kimliği: ${studentId}`,
      });
      return;
    }

    const report = await buildTeacherReport(studentId);
    res.json(report);
  } catch (error) {
    next(error);
  }
}
