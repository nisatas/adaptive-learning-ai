import express, { Application } from 'express';
import { corsMiddleware } from './config/cors';
import { globalErrorHandler } from './middleware/errorHandler';
import healthRoutes from './routes/health.routes';
import aiRoutes from './routes/ai.routes';
import quizRoutes from './routes/quiz.routes';
import teacherRoutes from './routes/teacher.routes';
import dbRoutes from './routes/db.routes';

export function createApp(): Application {
  const app = express();

  app.use(corsMiddleware);
  app.use(express.json());

  app.use('/api/health', healthRoutes);
  app.use('/api/db', dbRoutes);
  app.use('/api/ai', aiRoutes);
  app.use('/api/quizzes', quizRoutes);
  app.use('/api/teacher', teacherRoutes);

  app.use(globalErrorHandler);

  return app;
}
