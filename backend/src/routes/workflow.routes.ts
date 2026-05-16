import { Router } from 'express';
import { postWorkflowTrigger } from '../controllers/workflow.controller';

const router = Router();

router.post('/trigger', postWorkflowTrigger);

export default router;
