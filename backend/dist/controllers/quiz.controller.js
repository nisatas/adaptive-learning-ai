"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDemoQuiz = getDemoQuiz;
exports.postDemoQuizSubmit = postDemoQuizSubmit;
exports.handleQuizError = handleQuizError;
const quiz_service_1 = require("../services/quiz.service");
function getDemoQuiz(_req, res) {
    res.json((0, quiz_service_1.getDemoQuizPublic)());
}
async function postDemoQuizSubmit(req, res, next) {
    try {
        const body = req.body;
        const result = await (0, quiz_service_1.submitDemoQuiz)(body);
        res.json(result);
    }
    catch (error) {
        next(error);
    }
}
function handleQuizError(error, _req, res, next) {
    if (error instanceof quiz_service_1.QuizServiceError) {
        res.status(error.statusCode).json({ error: error.message });
        return;
    }
    next(error);
}
//# sourceMappingURL=quiz.controller.js.map