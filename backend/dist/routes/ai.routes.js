"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const ai_controller_1 = require("../controllers/ai.controller");
const router = (0, express_1.Router)();
router.get('/status', ai_controller_1.getAiStatus);
router.get('/diagnostics', ai_controller_1.getAiDiagnostics);
router.get('/models', ai_controller_1.getAiModels);
router.post('/test-chat-endpoints', ai_controller_1.postTestChatEndpoints);
router.post('/test-teacher-report', ai_controller_1.postTestTeacherReport);
exports.default = router;
//# sourceMappingURL=ai.routes.js.map