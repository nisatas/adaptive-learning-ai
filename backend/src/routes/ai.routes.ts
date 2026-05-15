import { Router } from 'express';
import { getAiStatus } from '../controllers/ai.controller';

const router = Router();

router.get('/status', getAiStatus);

export default router;
