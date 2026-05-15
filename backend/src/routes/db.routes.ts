import { Router } from 'express';
import { getDbStatus } from '../controllers/db.controller';

const router = Router();

router.get('/status', getDbStatus);

export default router;
