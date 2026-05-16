import { StoredQuizResult, TeacherReport } from '../types';
export interface QuizAnswerPersistenceInput {
    questionId: string;
    selectedOptionId?: string;
    isCorrect: boolean;
    skipped: boolean;
    timeSpentSeconds: number;
    topic: string;
}
export declare function isDatabaseAvailable(): Promise<boolean>;
export declare function saveQuizSubmission(result: StoredQuizResult, answers: QuizAnswerPersistenceInput[], studentName?: string): Promise<boolean>;
export declare function saveTeacherReport(report: TeacherReport, options?: {
    submissionId?: string | null;
    quizId?: string | null;
}): Promise<boolean>;
export declare function getLatestSubmissionByStudentId(studentId: string): Promise<StoredQuizResult | null>;
/** Latest stored notes for dashboard feed (no Puq.ai call). */
export declare function getLatestTeacherReportsForDashboardFeed(limit: number): Promise<Array<{
    aiTeacherNote: string;
    generatedAt: Date;
}>>;
export declare function getLatestTeacherReportByStudentId(studentId: string): Promise<TeacherReport | null>;
//# sourceMappingURL=persistence.service.d.ts.map