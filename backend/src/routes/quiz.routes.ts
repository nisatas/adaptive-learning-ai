import { Router } from 'express';
import {
  getDemoQuiz,
  handleQuizError,
  postDemoQuizSubmit,
} from '../controllers/quiz.controller';

const router = Router();

router.get('/demo', getDemoQuiz);
router.post('/demo/submit', postDemoQuizSubmit);

router.use(handleQuizError);

export default router;
