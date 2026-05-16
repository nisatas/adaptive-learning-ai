import { StudentDashboardResponse } from '../types';
export declare class StudentDashboardServiceError extends Error {
    statusCode: number;
    constructor(message: string, statusCode: number);
}
export declare function getStudentDashboard(studentId: string): StudentDashboardResponse;
//# sourceMappingURL=studentDashboard.service.d.ts.map