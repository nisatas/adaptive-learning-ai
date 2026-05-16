import { Router } from 'express';
import { getStudentDashboardHandler } from '../controllers/student.controller';

const router = Router();

router.get('/:studentId/dashboard', getStudentDashboardHandler);

export default router;
