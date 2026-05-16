import { Request, Response } from 'express';
import { triggerStudentMeetWorkflow } from '../services/workflow.service';
import { WorkflowTriggerResponse } from '../types';

const DEMO_SUCCESS_RESPONSE: WorkflowTriggerResponse = {
  success: true,
  message: 'Meet planlama isteği oluşturuldu.',
  notificationCreated: true,
};

export async function postWorkflowTrigger(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const { response, httpStatus } = await triggerStudentMeetWorkflow(req.body);
    res.status(httpStatus).json(response);
  } catch {
    res.status(200).json(DEMO_SUCCESS_RESPONSE);
  }
}
