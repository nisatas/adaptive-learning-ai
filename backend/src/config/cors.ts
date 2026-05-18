import cors, { CorsOptions } from 'cors';
import { env } from './env';

const EXPLICIT_ALLOWED_ORIGINS = new Set([
  'http://localhost:4200',
  'http://localhost:5173',
  'http://localhost:3000',
  'http://localhost:62952',
  'http://127.0.0.1:4200',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:62952',
]);

function isLocalDevOrigin(origin: string): boolean {
  return (
    /^https?:\/\/localhost:\d+$/i.test(origin) ||
    /^https?:\/\/127\.0\.0\.1:\d+$/i.test(origin)
  );
}

function isOriginAllowed(origin: string | undefined): boolean {
  if (!origin) {
    return true;
  }

  if (EXPLICIT_ALLOWED_ORIGINS.has(origin)) {
    return true;
  }

  if (env.nodeEnv !== 'production' && isLocalDevOrigin(origin)) {
    return true;
  }

  return false;
}

export const corsOptions: CorsOptions = {
  origin(origin, callback) {
    if (isOriginAllowed(origin)) {
      callback(null, true);
      return;
    }

    console.warn(`[CORS] Blocked origin: ${origin ?? '(none)'}`);
    callback(null, false);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

export const corsMiddleware = cors(corsOptions);
