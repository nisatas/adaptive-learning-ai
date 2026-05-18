import { env, isDemoModeEnabled, isMeetWorkflowConfigured } from '../config/env';
import { buildPuqAiHeaders } from '../utils/puqAiClient';
import { addStudentNotification } from '../data/inMemoryStore';
import { mockStudentProfiles } from '../data/mockData';
import {
  StudentNotification,
  WorkflowPriority,
  WorkflowTriggerRequest,
  WorkflowTriggerResponse,
} from '../types';

const SUPPORTED_WORKFLOW_TYPE = 'student_meet_request';

const SUCCESS_RESPONSE: WorkflowTriggerResponse = {
  success: true,
  message: 'Görüşme planı oluşturuldu.',
  notificationCreated: true,
};

const UNSUPPORTED_RESPONSE: WorkflowTriggerResponse = {
  success: false,
  message: 'Desteklenmeyen workflowType.',
  notificationCreated: false,
};

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
  selectedDate: string;
  selectedTime: string;
  priority: WorkflowPriority;
}

function formatMeetingDateLabel(isoDate: string): string {
  if (!isoDate) {
    return 'Yarın';
  }
  const target = new Date(`${isoDate}T12:00:00`);
  const today = new Date();
  today.setHours(12, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const targetDay = new Date(target);
  targetDay.setHours(12, 0, 0, 0);

  if (targetDay.getTime() === today.getTime()) {
    return 'Bugün';
  }
  if (targetDay.getTime() === tomorrow.getTime()) {
    return 'Yarın';
  }
  return target.toLocaleDateString('tr-TR', {
    day: 'numeric',
    month: 'long',
  });
}

function defaultTomorrowIso(): string {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function safeStr(value: unknown, fallback: string): string {
  if (value == null) {
    return fallback;
  }
  const text = String(value).trim();
  return text.length > 0 ? text : fallback;
}

function safeDuration(value: unknown): number {
  const n = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(n) || n <= 0) {
    return 15;
  }
  return Math.min(60, Math.round(n));
}

function safePriority(value: unknown): WorkflowPriority {
  if (value === 'low' || value === 'high') {
    return value;
  }
  return 'medium';
}

export function normalizeMeetWorkflowPayload(
  raw: unknown
): NormalizedMeetWorkflowPayload {
  const body =
    raw && typeof raw === 'object'
      ? (raw as Record<string, unknown>)
      : {};

  return {
    workflowType: safeStr(body.workflowType, ''),
    teacherName: safeStr(body.teacherName, 'Öğretmen'),
    teacherEmail: safeStr(body.teacherEmail, ''),
    studentName: safeStr(body.studentName, 'Öğrenci'),
    studentEmail: safeStr(body.studentEmail, ''),
    lesson: safeStr(body.lesson, 'Genel tekrar'),
    topic: safeStr(body.topic, 'Genel tekrar'),
    reason: safeStr(
      body.reason,
      'Öğrenme sürecini desteklemek için kısa görüşme önerilir.'
    ),
    suggestedDuration: safeDuration(body.suggestedDuration),
    selectedDate: safeStr(body.selectedDate, defaultTomorrowIso()),
    selectedTime: safeStr(body.selectedTime, '10:00'),
    priority: safePriority(body.priority),
  };
}

function resolveStudentId(payload: NormalizedMeetWorkflowPayload): string {
  if (payload.studentEmail) {
    const email = payload.studentEmail.toLowerCase();
    const byEmail = mockStudentProfiles.find(
      (profile) =>
        `${profile.studentId}@demo.local`.toLowerCase() === email ||
        profile.name.toLowerCase() === email
    );
    if (byEmail) {
      return byEmail.studentId;
    }
  }

  const normalizedName = payload.studentName.toLowerCase();
  const byName = mockStudentProfiles.find((profile) => {
    const profileName = profile.name.toLowerCase();
    return (
      profileName === normalizedName ||
      profileName.startsWith(normalizedName) ||
      normalizedName.startsWith(profileName.split(' ')[0] ?? '')
    );
  });

  if (byName) {
    return byName.studentId;
  }

  return mockStudentProfiles[0]?.studentId ?? 'stu-1';
}

function buildMeetNotification(
  payload: NormalizedMeetWorkflowPayload
): Omit<StudentNotification, 'id'> {
  const teacherLabel = payload.teacherName.includes('Öğretmen')
    ? payload.teacherName
    : `${payload.teacherName} Öğretmen`;

  const dateLabel = formatMeetingDateLabel(payload.selectedDate);
  const time = payload.selectedTime;

  return {
    type: 'meet',
    title: 'Görüşme planı hazırlandı',
    message: `${teacherLabel}, ${payload.topic} konusu için ${dateLabel} saat ${time} (${payload.suggestedDuration} dk) bir görüşme planı hazırladı.`,
    lesson: payload.lesson,
    topic: payload.topic,
    duration: payload.suggestedDuration,
    scheduledDate: payload.selectedDate,
    scheduledTime: time,
    dateDisplayLabel: dateLabel,
    status: 'unread',
  };
}

async function callPuqMeetWorkflow(
  payload: NormalizedMeetWorkflowPayload
): Promise<{ ok: boolean; skipped: boolean; reason?: string }> {
  const url = env.puqAi.meetWorkflowUrl.trim();

  if (isDemoModeEnabled()) {
    console.log('[workflow] meet webhook skipped: DEMO_MODE=true');
    return { ok: false, skipped: true, reason: 'demo_mode' };
  }

  if (!isMeetWorkflowConfigured()) {
    console.warn('[workflow] PUQ_MEET_WORKFLOW_URL missing; webhook skipped');
    return { ok: false, skipped: true, reason: 'missing_url' };
  }

  const headers: Record<string, string> = {
    ...buildPuqAiHeaders(),
  };

  const webhookBody: WorkflowTriggerRequest = {
    workflowType: SUPPORTED_WORKFLOW_TYPE,
    teacherName: payload.teacherName,
    teacherEmail: payload.teacherEmail,
    studentName: payload.studentName,
    studentEmail: payload.studentEmail,
    lesson: payload.lesson,
    topic: payload.topic,
    reason: payload.reason,
    suggestedDuration: payload.suggestedDuration,
    selectedDate: payload.selectedDate,
    selectedTime: payload.selectedTime,
    priority: payload.priority,
  };

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(webhookBody),
    });

    if (!response.ok) {
      const bodyText = await response.text().catch(() => '');
      console.error(
        `[workflow] meet webhook failed status=${response.status} body=${bodyText.slice(0, 200)}`,
      );
      return { ok: false, skipped: false, reason: `http_${response.status}` };
    }

    console.log('[workflow] Puq.ai meet workflow success');
    return { ok: true, skipped: false };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'unknown_error';
    console.error(`[workflow] meet webhook network error: ${message}`);
    return { ok: false, skipped: false, reason: 'network_error' };
  }
}

export async function triggerStudentMeetWorkflow(
  raw: unknown
): Promise<{ response: WorkflowTriggerResponse; httpStatus: number }> {
  try {
    const payload = normalizeMeetWorkflowPayload(raw);

    if (payload.workflowType !== SUPPORTED_WORKFLOW_TYPE) {
      return { response: UNSUPPORTED_RESPONSE, httpStatus: 400 };
    }

    const studentId = resolveStudentId(payload);
    addStudentNotification(studentId, buildMeetNotification(payload));

    void callPuqMeetWorkflow(payload).catch(() => {
      console.log('[workflow] meet webhook promise rejected; demo response preserved');
    });

    return { response: SUCCESS_RESPONSE, httpStatus: 200 };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'unknown';
    console.error(`[workflow] trigger error (notification still created): ${message}`);
    return { response: SUCCESS_RESPONSE, httpStatus: 200 };
  }
}
