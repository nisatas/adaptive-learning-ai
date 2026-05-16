import { StoredQuizResult, StudentNotification } from '../types';

const lastResultsByStudent = new Map<string, StoredQuizResult>();
const notificationsByStudent = new Map<string, StudentNotification[]>();
let lastSubmitAt: string | null = null;
let notificationCounter = 0;

export function saveQuizResult(result: StoredQuizResult): void {
  lastResultsByStudent.set(result.studentId, result);
  lastSubmitAt = result.submittedAt;
}

export function getLastQuizResult(
  studentId: string
): StoredQuizResult | undefined {
  return lastResultsByStudent.get(studentId);
}

export function hasQuizResult(studentId: string): boolean {
  return lastResultsByStudent.has(studentId);
}

export function getLastSubmitAt(): string {
  return lastSubmitAt ?? new Date().toISOString();
}

export function addStudentNotification(
  studentId: string,
  notification: Omit<StudentNotification, 'id'> & { id?: string }
): StudentNotification {
  const id =
    notification.id ??
    `noti-${++notificationCounter}-${Date.now().toString(36)}`;

  const stored: StudentNotification = {
    id,
    type: notification.type,
    title: notification.title,
    message: notification.message,
    lesson: notification.lesson,
    topic: notification.topic,
    duration: notification.duration,
    status: notification.status,
  };

  const existing = notificationsByStudent.get(studentId) ?? [];
  notificationsByStudent.set(studentId, [stored, ...existing]);
  return stored;
}

export function getStudentNotifications(studentId: string): StudentNotification[] {
  return [...(notificationsByStudent.get(studentId) ?? [])];
}
