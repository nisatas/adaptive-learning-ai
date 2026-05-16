"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getStudentDashboardHandler = getStudentDashboardHandler;
const studentDashboard_service_1 = require("../services/studentDashboard.service");
function getStudentDashboardHandler(req, res, next) {
    try {
        const studentId = String(req.params.studentId);
        res.json((0, studentDashboard_service_1.getStudentDashboard)(studentId));
    }
    catch (error) {
        if (error instanceof studentDashboard_service_1.StudentDashboardServiceError) {
            res.status(error.statusCode).json({ error: error.message });
            return;
        }
        next(error);
    }
}
//# sourceMappingURL=student.controller.js.map