import { StoredQuizResult, StudentNotification } from '../types';
export declare function saveQuizResult(result: StoredQuizResult): void;
export declare function getLastQuizResult(studentId: string): StoredQuizResult | undefined;
export declare function hasQuizResult(studentId: string): boolean;
export declare function getLastSubmitAt(): string;
export declare function addStudentNotification(studentId: string, notification: Omit<StudentNotification, 'id'> & {
    id?: string;
}): StudentNotification;
export declare function getStudentNotifications(studentId: string): StudentNotification[];
//# sourceMappingURL=inMemoryStore.d.ts.map