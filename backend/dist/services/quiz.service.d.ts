import { QuizPublic, QuizResultResponse, QuizSubmissionRequest, StoredQuizResult } from '../types';
export declare class QuizServiceError extends Error {
    statusCode: number;
    constructor(message: string, statusCode: number);
}
export declare function getDemoQuizPublic(): QuizPublic;
export declare function isValidStudent(studentId: string): boolean;
export declare function getStudentLastResult(studentId: string): StoredQuizResult | undefined;
export declare function getStudentName(studentId: string): string;
export declare function submitDemoQuiz(request: QuizSubmissionRequest): Promise<QuizResultResponse>;
//# sourceMappingURL=quiz.service.d.ts.map