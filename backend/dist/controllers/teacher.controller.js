"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDashboard = getDashboard;
exports.getStudents = getStudents;
exports.getStudentReport = getStudentReport;
const teacher_service_1 = require("../services/teacher.service");
const teacherReport_service_1 = require("../services/teacherReport.service");
const quiz_service_1 = require("../services/quiz.service");
async function getDashboard(_req, res, next) {
    try {
        res.json(await (0, teacher_service_1.getTeacherDashboard)());
    }
    catch (error) {
        next(error);
    }
}
function getStudents(_req, res) {
    res.json((0, teacher_service_1.getTeacherStudentsList)());
}
async function getStudentReport(req, res, next) {
    try {
        const studentId = String(req.params.studentId);
        if (!(0, quiz_service_1.isValidStudent)(studentId)) {
            res.status(404).json({
                error: `Bilinmeyen öğrenci kimliği: ${studentId}`,
            });
            return;
        }
        const report = await (0, teacherReport_service_1.buildTeacherReport)(studentId);
        res.json(report);
    }
    catch (error) {
        next(error);
    }
}
//# sourceMappingURL=teacher.controller.js.map