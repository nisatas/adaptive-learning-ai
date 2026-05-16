"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const quiz_controller_1 = require("../controllers/quiz.controller");
const router = (0, express_1.Router)();
router.get('/demo', quiz_controller_1.getDemoQuiz);
router.post('/demo/submit', quiz_controller_1.postDemoQuizSubmit);
router.use(quiz_controller_1.handleQuizError);
exports.default = router;
//# sourceMappingURL=quiz.routes.js.map