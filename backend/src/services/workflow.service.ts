import { env, isMeetWorkflowConfigured } from '../config/env';
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
  message: 'Meet planlama isteği oluşturuldu.',
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
  priority: WorkflowPriority;
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

  return {
    type: 'meet',
    title: 'Destek görüşmesi planlandı',
    message: `${teacherLabel} senin için ${payload.topic} konusunda ${payload.suggestedDuration} dakikalık destek görüşmesi planladı.`,
    lesson: payload.lesson,
    topic: payload.topic,
    duration: payload.suggestedDuration,
    status: 'unread',
  };
}

async function callPuqMeetWorkflow(
  payload: NormalizedMeetWorkflowPayload
): Promise<{ ok: boolean; skipped: boolean; reason?: string }> {
  const url = env.puqAi.meetWorkflowUrl.trim();

  if (!isMeetWorkflowConfigured()) {
    console.log('[workflow] PUQ_MEET_WORKFLOW_URL missing; workflowSkipped=true');
    return { ok: false, skipped: true, reason: 'missing_url' };
  }

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (env.puqAi.apiKey) {
    headers.Authorization = `Bearer ${env.puqAi.apiKey}`;
  }

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
    priority: payload.priority,
  };

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(webhookBody),
    });

    if (!response.ok) {
      console.log(
        `[workflow] meet webhook failed status=${response.status}; workflowSkipped=false`
      );
      return { ok: false, skipped: false, reason: `http_${response.status}` };
    }

    console.log('[workflow] meet webhook accepted');
    return { ok: true, skipped: false };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'unknown_error';
    console.log(`[workflow] meet webhook error; workflowSkipped=false reason=${message}`);
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
    console.log(`[workflow] trigger error; demo fallback used reason=${message}`);
    return { response: SUCCESS_RESPONSE, httpStatus: 200 };
  }
}
