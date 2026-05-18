import { Router } from 'express';
import {
  getHealth,
  getIntegrationsHealth,
} from '../controllers/health.controller';

const router = Router();

router.get('/', getHealth);
router.get('/integrations', getIntegrationsHealth);

export default router;
