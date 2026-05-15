import { Router } from 'express';
import {
  getAiDiagnostics,
  getAiModels,
  getAiStatus,
  postTestChatEndpoints,
  postTestTeacherReport,
} from '../controllers/ai.controller';

const router = Router();

router.get('/status', getAiStatus);
router.get('/diagnostics', getAiDiagnostics);
router.get('/models', getAiModels);
router.post('/test-chat-endpoints', postTestChatEndpoints);
router.post('/test-teacher-report', postTestTeacherReport);

export default router;
