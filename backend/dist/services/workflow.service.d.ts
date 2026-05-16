import { WorkflowPriority, WorkflowTriggerResponse } from '../types';
export interface NormalizedMeetWorkflowPayload {
    workflowType: string;
    teacherName: string;
    teacherEmail: string;
    studentName: string;
    studentEmail: string;
    lesson: string;
    topic: string;
    reason: string;
    suggestedDuration: number;
    priority: WorkflowPriority;
}
export declare function normalizeMeetWorkflowPayload(raw: unknown): NormalizedMeetWorkflowPayload;
export declare function triggerStudentMeetWorkflow(raw: unknown): Promise<{
    response: WorkflowTriggerResponse;
    httpStatus: number;
}>;
//# sourceMappingURL=workflow.service.d.ts.map