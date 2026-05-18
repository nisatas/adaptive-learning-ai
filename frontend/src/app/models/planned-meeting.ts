export interface MeetingStudentContext {
  studentId: string;
  studentName: string;
  lesson: string;
  topic: string;
  reason: string;
  suggestedAction: string;
  priority: 'low' | 'medium' | 'high';
  email?: string;
  suggestedDuration?: number;
}

/** AI destekli görüşme planı içeriği (Puq.ai workflow ile uyumlu) */
export interface MeetingPlanDraft {
  meetingPurpose: string;
  recommendedDurationMinutes: number;
  recommendedDateLabel: string;
  recommendedTime: string;
  agenda: string[];
  teacherNote: string;
  actions: string[];
}

export interface PlannedMeeting {
  id: string;
  studentId: string;
  studentName: string;
  lesson: string;
  topic: string;
  priorityLabel: string;
  learningMode: string;
  durationMinutes: number;
  scheduledDate: string;
  scheduledTime: string;
  dateDisplayLabel: string;
  purpose: string;
  agenda: string[];
  teacherNote: string;
  actions: string[];
  status: 'Planlandı';
  summary: string;
  createdAt: string;
}

export const MEETING_TIME_OPTIONS = [
  '09:30',
  '10:00',
  '10:30',
  '11:00',
  '13:30',
  '14:00',
  '14:30',
  '15:00',
] as const;
