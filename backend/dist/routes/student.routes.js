"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const student_controller_1 = require("../controllers/student.controller");
const router = (0, express_1.Router)();
router.get('/:studentId/dashboard', student_controller_1.getStudentDashboardHandler);
exports.default = router;
//# sourceMappingURL=student.routes.js.map