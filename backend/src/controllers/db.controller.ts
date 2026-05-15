import { Request, Response } from 'express';
import { isDatabaseAvailable } from '../services/persistence.service';

export async function getDbStatus(_req: Request, res: Response): Promise<void> {
  const connected = await isDatabaseAvailable();

  if (connected) {
    res.json({
      database: 'MySQL',
      orm: 'Prisma',
      connected: true,
      message: 'Database connection is available',
    });
    return;
  }

  res.json({
    database: 'MySQL',
    orm: 'Prisma',
    connected: false,
    message:
      'Database connection is not available. In-memory fallback is active.',
  });
}
