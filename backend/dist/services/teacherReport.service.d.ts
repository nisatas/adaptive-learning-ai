import { TeacherInsightInput, TeacherReport } from '../types';
export declare function buildTeacherReport(studentId: string): Promise<TeacherReport>;
export declare function buildInsightInputFromTestRequest(body: {
    lesson: string;
    gradeLevel: number;
    topic: string;
    score: number;
    totalQuestions: number;
    correctCount: number;
    wrongCount: number;
    skippedCount: number;
    averageTimeSeconds: number;
    mostDifficultTopic: string;
    studentName?: string;
    behaviorSignals?: {
        longHesitations?: number;
    };
}): TeacherInsightInput;
//# sourceMappingURL=teacherReport.service.d.ts.map