"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const workflow_controller_1 = require("../controllers/workflow.controller");
const router = (0, express_1.Router)();
router.post('/trigger', workflow_controller_1.postWorkflowTrigger);
exports.default = router;
//# sourceMappingURL=workflow.routes.js.map