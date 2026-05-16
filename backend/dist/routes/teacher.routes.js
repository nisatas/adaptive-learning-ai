"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const teacher_controller_1 = require("../controllers/teacher.controller");
const router = (0, express_1.Router)();
router.get('/dashboard', teacher_controller_1.getDashboard);
router.get('/students', teacher_controller_1.getStudents);
router.get('/students/:studentId/report', teacher_controller_1.getStudentReport);
exports.default = router;
//# sourceMappingURL=teacher.routes.js.map