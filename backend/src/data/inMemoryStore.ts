import { StoredQuizResult } from '../types';

const lastResultsByStudent = new Map<string, StoredQuizResult>();
let lastSubmitAt: string | null = null;

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
