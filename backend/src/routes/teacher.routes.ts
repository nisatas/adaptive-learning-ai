import { Router } from 'express';
import {
  getDashboard,
  getStudents,
  getStudentReport,
} from '../controllers/teacher.controller';

const router = Router();

router.get('/dashboard', getDashboard);
router.get('/students', getStudents);
router.get('/students/:studentId/report', getStudentReport);

export default router;
