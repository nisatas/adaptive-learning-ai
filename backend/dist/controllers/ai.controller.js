"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAiDiagnostics = getAiDiagnostics;
exports.getAiStatus = getAiStatus;
exports.getAiModels = getAiModels;
exports.postTestChatEndpoints = postTestChatEndpoints;
exports.postTestTeacherReport = postTestTeacherReport;
const env_1 = require("../config/env");
const puqAi_service_1 = require("../services/puqAi.service");
const teacherReport_service_1 = require("../services/teacherReport.service");
const runtimeDiagnostics_1 = require("../utils/runtimeDiagnostics");
function getAiDiagnostics(_req, res) {
    res.json((0, runtimeDiagnostics_1.buildAiDiagnosticsResponse)());
}
function getAiStatus(_req, res) {
    const status = puqAi_service_1.puqAiService.getStatusMessage();
    const payload = {
        provider: 'Puq.ai',
        configured: status.configured,
        requiredVariables: (0, env_1.getPuqAiVariableStatus)(),
        message: status.message,
    };
    res.json(payload);
}
async function getAiModels(_req, res, next) {
    try {
        const result = await puqAi_service_1.puqAiService.fetchModels();
        if (result.success) {
            res.status(200).json(result);
            return;
        }
        const httpStatus = result.statusCode ?? 502;
        res.status(httpStatus).json(result);
    }
    catch (error) {
        next(error);
    }
}
async function postTestChatEndpoints(_req, res, next) {
    try {
        const result = await puqAi_service_1.puqAiService.probeChatEndpoints();
        res.status(200).json(result);
    }
    catch (error) {
        next(error);
    }
}
async function postTestTeacherReport(req, res, next) {
    try {
        const body = req.body;
        if (!body.lesson || !body.topic || body.gradeLevel === undefined) {
            res.status(400).json({
                error: 'lesson, topic ve gradeLevel alanları zorunludur.',
            });
            return;
        }
        if (body.totalQuestions === undefined ||
            body.correctCount === undefined ||
            body.wrongCount === undefined) {
            res.status(400).json({
                error: 'totalQuestions, correctCount ve wrongCount alanları zorunludur.',
            });
            return;
        }
        const insightInput = (0, teacherReport_service_1.buildInsightInputFromTestRequest)(body);
        const result = await puqAi_service_1.puqAiService.generateTeacherInsightReport(insightInput);
        const payload = {
            aiProvider: result.aiProvider,
            aiUsed: result.aiUsed,
            fallbackUsed: result.fallbackUsed,
            aiStatus: result.aiStatus,
            teacherInsight: result.text,
            generatedAt: result.generatedAt,
        };
        if (!result.aiUsed) {
            payload.statusCode = result.statusCode ?? null;
            payload.errorType = result.errorType ?? 'UNKNOWN_ERROR';
            payload.safeMessage =
                result.safeMessage ?? 'Puq.ai kullanılamadı; güvenli fallback rapor döndürüldü.';
        }
        res.json(payload);
    }
    catch (error) {
        next(error);
    }
}
//# sourceMappingURL=ai.controller.js.map