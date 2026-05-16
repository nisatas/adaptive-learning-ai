import { Question, Quiz, Student, TeacherStudentListItem } from '../types';
/**
 * Soru bankası — ekip arkadaşınız yalnızca bu diziyi düzenleyerek
 * soruları güncelleyebilir. correctOptionId yalnızca backend içindir.
 */
export declare const TURKCE_QUESTIONS: Question[];
export declare const demoQuiz: Quiz;
export declare const TOTAL_QUESTIONS: number;
export declare const demoStudent: Student;
/** Öğretmen tablosu için mock öğrenci profilleri (submit öncesi varsayılan) */
export declare const mockStudentProfiles: Array<Student & Omit<TeacherStudentListItem, 'studentId' | 'studentName' | 'lastQuizStatus'>>;
export declare const CLASS_META: {
    className: string;
    lesson: string;
    topic: string;
    studentCount: number;
    classAverage: number;
    averageResponseTime: number;
    supportSuggestedCount: number;
    challengeReadyCount: number;
    mostDifficultTopic: string;
};
//# sourceMappingURL=mockData.d.ts.map