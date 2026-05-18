import { randomUUID } from 'crypto';
import { getPrismaClient } from '../config/prisma';
import {
  StoredQuizResult,
  TeacherReport,
  UiSettings,
  BehaviorSignals,
} from '../types';

export interface QuizAnswerPersistenceInput {
  questionId: string;
  selectedOptionId?: string;
  isCorrect: boolean;
  skipped: boolean;
  timeSpentSeconds: number;
  topic: string;
}

let cachedAvailability: boolean | null = null;
let lastAvailabilityCheck = 0;
const AVAILABILITY_CACHE_MS = 30_000;

export async function isDatabaseAvailable(): Promise<boolean> {
  const now = Date.now();
  if (
    cachedAvailability !== null &&
    now - lastAvailabilityCheck < AVAILABILITY_CACHE_MS
  ) {
    return cachedAvailability;
  }

  const prisma = getPrismaClient();
  if (!prisma) {
    cachedAvailability = false;
    lastAvailabilityCheck = now;
    return false;
  }

  try {
    await prisma.$queryRaw`SELECT 1`;
    cachedAvailability = true;
  } catch {
    cachedAvailability = false;
  }

  lastAvailabilityCheck = now;
  return cachedAvailability;
}

export async function saveQuizSubmission(
  result: StoredQuizResult,
  answers: QuizAnswerPersistenceInput[],
  studentName?: string
): Promise<boolean> {
  const prisma = getPrismaClient();
  if (!prisma) {
    return false;
  }

  try {
    await prisma.studentsubmission.create({
      data: {
        id: randomUUID(),
        studentId: result.studentId,
        studentName: studentName ?? null,
        quizId: result.quizId,
        lesson: result.lesson,
        gradeLevel: result.gradeLevel,
        topic: result.topic,
        totalQuestions: result.totalQuestions,
        score: result.score,
        correctCount: result.correctCount,
        wrongCount: result.wrongCount,
        skippedCount: result.skippedCount,
        averageTimeSeconds: result.averageTimeSeconds,
        mostDifficultTopic: result.mostDifficultTopic,
        studentMessage: result.studentMessage,
        uiSettingsJson: result.uiSettings as unknown as object,
        behaviorSignalsJson: result.behaviorSignalsInternal as unknown as object,
        quizanswerrecord: {
          create: answers.map((answer) => ({
            id: randomUUID(),
            questionId: answer.questionId,
            selectedOptionId: answer.selectedOptionId ?? null,
            isCorrect: answer.isCorrect,
            skipped: answer.skipped,
            timeSpentSeconds: answer.timeSpentSeconds,
            topic: answer.topic,
          })),
        },
      },
    });

    return true;
  } catch {
    console.log('Database save failed, continuing with in-memory fallback');
    return false;
  }
}

export async function saveTeacherReport(
  report: TeacherReport,
  options?: { submissionId?: string | null; quizId?: string | null }
): Promise<boolean> {
  const submissionId = options?.submissionId;
  const quizId = options?.quizId;
  const prisma = getPrismaClient();
  if (!prisma) {
    return false;
  }

  try {
    let linkedSubmissionId = submissionId ?? null;

    if (!linkedSubmissionId) {
      const latest = await prisma.studentsubmission.findFirst({
        where: { studentId: report.studentId },
        orderBy: { createdAt: 'desc' },
        select: { id: true },
      });
      linkedSubmissionId = latest?.id ?? null;
    }

    await prisma.teacherreportrecord.create({
      data: {
        id: randomUUID(),
        submissionId: linkedSubmissionId,
        studentId: report.studentId,
        studentName: report.studentName,
        quizId: quizId ?? null,
        lesson: report.lesson,
        gradeLevel: report.gradeLevel,
        topic: report.topic,
        score: report.score,
        totalQuestions: report.totalQuestions,
        correctCount: report.correctCount,
        wrongCount: report.wrongCount,
        skippedCount: report.skippedCount,
        averageTimeSeconds: report.averageTimeSeconds,
        mostDifficultTopic: report.mostDifficultTopic,
        behaviorObservation: report.behaviorObservation,
        systemRecommendation: report.systemRecommendation,
        aiTeacherNote: report.aiTeacherNote,
        aiProvider: report.aiProvider,
        aiUsed: report.aiUsed,
        fallbackUsed: report.fallbackUsed,
        aiStatus: report.aiStatus,
        reportSource: report.reportSource,
        generatedAt: new Date(report.generatedAt),
      },
    });

    return true;
  } catch {
    console.log('Database save failed, continuing with in-memory fallback');
    return false;
  }
}

export async function getLatestSubmissionByStudentId(
  studentId: string
): Promise<StoredQuizResult | null> {
  const prisma = getPrismaClient();
  if (!prisma) {
    return null;
  }

  try {
    const row = await prisma.studentsubmission.findFirst({
      where: { studentId },
      orderBy: { createdAt: 'desc' },
    });

    if (!row) {
      return null;
    }

    return mapSubmissionRowToStored(row);
  } catch {
    return null;
  }
}

/** Latest stored notes for dashboard feed (no Puq.ai call). */
export async function getLatestTeacherReportsForDashboardFeed(
  limit: number
): Promise<Array<{ aiTeacherNote: string; generatedAt: Date }>> {
  const prisma = getPrismaClient();
  if (!prisma || limit < 1) {
    return [];
  }

  try {
    const rows = await prisma.teacherreportrecord.findMany({
      take: Math.min(limit, 5),
      orderBy: { createdAt: 'desc' },
      select: {
        aiTeacherNote: true,
        generatedAt: true,
      },
    });
    return rows;
  } catch {
    return [];
  }
}

export async function getLatestTeacherReportByStudentId(
  studentId: string
): Promise<TeacherReport | null> {
  const prisma = getPrismaClient();
  if (!prisma) {
    return null;
  }

  try {
    const row = await prisma.teacherreportrecord.findFirst({
      where: { studentId },
      orderBy: { createdAt: 'desc' },
    });

    if (!row) {
      return null;
    }

    return {
      studentId: row.studentId,
      studentName: row.studentName ?? 'Öğrenci',
      lesson: row.lesson,
      gradeLevel: row.gradeLevel,
      topic: row.topic,
      score: row.score,
      totalQuestions: row.totalQuestions,
      correctCount: row.correctCount,
      wrongCount: row.wrongCount,
      skippedCount: row.skippedCount,
      averageTimeSeconds: row.averageTimeSeconds,
      mostDifficultTopic: row.mostDifficultTopic ?? '',
      behaviorObservation: row.behaviorObservation,
      systemRecommendation: row.systemRecommendation,
      aiTeacherNote: row.aiTeacherNote,
      aiProvider: row.aiProvider as TeacherReport['aiProvider'],
      aiUsed: row.aiUsed,
      fallbackUsed: row.fallbackUsed,
      aiStatus: row.aiStatus as TeacherReport['aiStatus'],
      generatedAt: row.generatedAt.toISOString(),
      reportSource: row.reportSource as TeacherReport['reportSource'],
    };
  } catch {
    return null;
  }
}

function mapSubmissionRowToStored(row: {
  studentId: string;
  quizId: string;
  lesson: string;
  gradeLevel: number;
  topic: string;
  totalQuestions: number;
  score: number;
  correctCount: number;
  wrongCount: number;
  skippedCount: number;
  averageTimeSeconds: number;
  mostDifficultTopic: string | null;
  studentMessage: string | null;
  uiSettingsJson: unknown;
  behaviorSignalsJson: unknown;
  createdAt: Date;
}): StoredQuizResult {
  const uiSettings = row.uiSettingsJson as UiSettings;
  const behaviorSignalsInternal = row.behaviorSignalsJson as BehaviorSignals & {
    slowQuestionIds?: string[];
    hesitationCount?: number;
  };

  return {
    studentId: row.studentId,
    quizId: row.quizId,
    lesson: row.lesson,
    gradeLevel: row.gradeLevel,
    topic: row.topic,
    totalQuestions: row.totalQuestions,
    score: row.score,
    correctCount: row.correctCount,
    wrongCount: row.wrongCount,
    skippedCount: row.skippedCount,
    averageTimeSeconds: row.averageTimeSeconds,
    mostDifficultTopic: row.mostDifficultTopic ?? '',
    studentMessage: row.studentMessage ?? '',
    uiSettings,
    behaviorSignals: {
      fastWrongAnswers: behaviorSignalsInternal.fastWrongAnswers ?? 0,
      longHesitations: behaviorSignalsInternal.longHesitations ?? 0,
      skippedQuestions: behaviorSignalsInternal.skippedQuestions ?? 0,
      totalTimeSeconds: behaviorSignalsInternal.totalTimeSeconds ?? 0,
    },
    behaviorSignalsInternal: {
      fastWrongAnswers: behaviorSignalsInternal.fastWrongAnswers ?? 0,
      longHesitations: behaviorSignalsInternal.longHesitations ?? 0,
      skippedQuestions: behaviorSignalsInternal.skippedQuestions ?? 0,
      totalTimeSeconds: behaviorSignalsInternal.totalTimeSeconds ?? 0,
      slowQuestionIds: behaviorSignalsInternal.slowQuestionIds ?? [],
      hesitationCount:
        behaviorSignalsInternal.hesitationCount ??
        behaviorSignalsInternal.longHesitations ??
        0,
    },
    internalProfile: 'BALANCED',
    submittedAt: row.createdAt.toISOString(),
    learningMode: row.score >= 70 ? 'STANDARD' : 'PERSONALIZED',
    learningModeLabel:
      row.score >= 70
        ? 'Standart Öğrenme Modu'
        : 'Kişiselleştirilmiş Öğrenme Modu',
    supportProfile: row.score >= 70 ? null : 'balanced_support',
    recommendation:
      row.score >= 70
        ? 'İçerikler standart akışla sunulmaya devam edecek.'
        : 'İçerikler artık senin öğrenme hızına ve ihtiyaçlarına göre daha anlaşılır sunulacak.',
  };
}
