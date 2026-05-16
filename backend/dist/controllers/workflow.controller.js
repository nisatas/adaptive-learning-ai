"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.postWorkflowTrigger = postWorkflowTrigger;
const workflow_service_1 = require("../services/workflow.service");
const DEMO_SUCCESS_RESPONSE = {
    success: true,
    message: 'Meet planlama isteği oluşturuldu.',
    notificationCreated: true,
};
async function postWorkflowTrigger(req, res) {
    try {
        const { response, httpStatus } = await (0, workflow_service_1.triggerStudentMeetWorkflow)(req.body);
        res.status(httpStatus).json(response);
    }
    catch {
        res.status(200).json(DEMO_SUCCESS_RESPONSE);
    }
}
//# sourceMappingURL=workflow.controller.js.map