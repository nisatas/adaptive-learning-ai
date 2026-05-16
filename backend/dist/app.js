"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createApp = createApp;
const express_1 = __importDefault(require("express"));
const cors_1 = require("./config/cors");
const errorHandler_1 = require("./middleware/errorHandler");
const health_routes_1 = __importDefault(require("./routes/health.routes"));
const ai_routes_1 = __importDefault(require("./routes/ai.routes"));
const quiz_routes_1 = __importDefault(require("./routes/quiz.routes"));
const teacher_routes_1 = __importDefault(require("./routes/teacher.routes"));
const student_routes_1 = __importDefault(require("./routes/student.routes"));
const workflow_routes_1 = __importDefault(require("./routes/workflow.routes"));
const db_routes_1 = __importDefault(require("./routes/db.routes"));
function createApp() {
    const app = (0, express_1.default)();
    app.use(cors_1.corsMiddleware);
    app.use(express_1.default.json());
    app.use('/api/health', health_routes_1.default);
    app.use('/api/db', db_routes_1.default);
    app.use('/api/ai', ai_routes_1.default);
    app.use('/api/quizzes', quiz_routes_1.default);
    app.use('/api/teacher', teacher_routes_1.default);
    app.use('/api/student', student_routes_1.default);
    app.use('/api/workflows', workflow_routes_1.default);
    app.use(errorHandler_1.globalErrorHandler);
    return app;
}
//# sourceMappingURL=app.js.map