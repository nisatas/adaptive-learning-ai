import cors, { CorsOptions } from 'cors';

const allowedOrigins = [
  'http://localhost:4200',
  'http://localhost:5173',
  'http://localhost:3000',
];

export const corsOptions: CorsOptions = {
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`Origin ${origin} not allowed by CORS`));
    }
  },
  credentials: true,
};

export const corsMiddleware = cors(corsOptions);
