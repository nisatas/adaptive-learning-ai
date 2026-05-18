"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.corsMiddleware = exports.corsOptions = void 0;
const cors_1 = __importDefault(require("cors"));
const env_1 = require("./env");
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
function isLocalDevOrigin(origin) {
    return (/^https?:\/\/localhost:\d+$/i.test(origin) ||
        /^https?:\/\/127\.0\.0\.1:\d+$/i.test(origin));
}
function isOriginAllowed(origin) {
    if (!origin) {
        return true;
    }
    if (EXPLICIT_ALLOWED_ORIGINS.has(origin)) {
        return true;
    }
    if (env_1.env.nodeEnv !== 'production' && isLocalDevOrigin(origin)) {
        return true;
    }
    return false;
}
exports.corsOptions = {
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
exports.corsMiddleware = (0, cors_1.default)(exports.corsOptions);
//# sourceMappingURL=cors.js.map