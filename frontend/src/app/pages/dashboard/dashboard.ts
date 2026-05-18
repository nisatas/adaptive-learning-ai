import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { WorkflowService } from '../../services/workflow';

import {
  DashboardResponse,
  StudentNeedingSupport,
} from '../../models/dashboard';
import {
  MEETING_TIME_OPTIONS,
  MeetingPlanDraft,
  MeetingStudentContext,
  PlannedMeeting,
} from '../../models/planned-meeting';
import { FALLBACK_TEACHER_DASHBOARD } from '../../data/fallback-teacher-dashboard';
import { TeacherDashboardService } from '../../services/teacher-dashboard';
import { logApiError } from '../../utils/api-error';
import { environment } from '../../../environments/environment';
import { DemoProfileKey } from '../../utils/learning-theme';

export type UiPreviewTarget = DemoProfileKey;

const PLANNED_MEETINGS_STORAGE_KEY = 'teacherPlannedMeetings';

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard implements OnInit, OnDestroy {
  dashboardData?: DashboardResponse;
  isLoading = true;
  isDemoMode = false;

  selectedMeetingStudent: MeetingStudentContext | null = null;
  isMeetingModalOpen = false;
  selectedDurationMinutes = 15;
  selectedMeetingDate = '';
  selectedMeetingTime = '10:00';
  readonly meetingTimeOptions = [...MEETING_TIME_OPTIONS];
  meetingPlanDraft: MeetingPlanDraft | null = null;
  plannedMeetings: PlannedMeeting[] = [];
  showMeetingToast = false;
  meetingToastMessage = 'Görüşme planı oluşturuldu.';
  meetingToastSubtext = '';

  private toastTimer?: ReturnType<typeof setTimeout>;

  constructor(
    private teacherDashboardService: TeacherDashboardService,
    private workflowService: WorkflowService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    document.documentElement.classList.add('panel-scroll-lock');
    this.loadPlannedMeetings();
    this.loadDashboard();
  }

  ngOnDestroy(): void {
    document.documentElement.classList.remove('panel-scroll-lock');
    document.body.style.overflow = '';
  }

  loadDashboard(): void {
    this.isLoading = true;
    this.isDemoMode = false;

    this.teacherDashboardService.getDashboardData().subscribe({
      next: (data) => {
        this.dashboardData = data;
        this.isDemoMode = false;
        this.isLoading = false;
      },
      error: (error) => {
        logApiError(
          'Teacher dashboard',
          error,
          `${environment.apiUrl}/api/teacher/dashboard`,
        );
        this.dashboardData = {
          ...FALLBACK_TEACHER_DASHBOARD,
          lastUpdated: new Date().toISOString(),
        };
        this.isDemoMode = true;
        this.isLoading = false;
      },
    });
  }

  get supportStudents(): StudentNeedingSupport[] {
    if (!this.dashboardData) {
      return [];
    }

    if (this.dashboardData.studentsNeedingSupport?.length) {
      return this.dashboardData.studentsNeedingSupport;
    }

    return this.dashboardData.students.map((student) => ({
      studentId: student.id,
      studentName: student.name,
      lesson: student.lesson,
      topic: student.topic,
      reason: student.reason,
      suggestedAction:
        'Kısa kontrol görüşmesi önerilir. Konu tekrarı ve örnek çözüm faydalı olabilir.',
      priority: student.priority,
    }));
  }

  getTeacherInitials(): string {
    const name = this.dashboardData?.teacherName?.trim() || 'Ö';
    const parts = name.split(/\s+/).filter(Boolean);
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  }

  get classStatusLines(): string[] {
    if (!this.dashboardData) {
      return [];
    }
    return [
      `${this.dashboardData.className} sınıfında ortalama başarı ${this.dashboardData.classAverage} puan.`,
      `En çok zorlanılan konu: ${this.dashboardData.mostDifficultTopic}.`,
      'Kısa tekrar ve örnek çözüm önerilir.',
    ];
  }

  get studentSupportLines(): string[] {
    if (!this.dashboardData) {
      return [];
    }
    return [
      `${this.dashboardData.supportSuggestedCount} öğrenci için kişiselleştirilmiş çalışma önerisi oluşturuldu.`,
      'Bazı öğrenciler için adım adım tekrar akışı önerilir.',
      'İleri seviye hazır öğrenciler için ek pratik verilebilir.',
    ];
  }

  get teacherActionLines(): string[] {
    const actions = this.dashboardData?.recommendedActions ?? [];
    if (actions.length >= 3) {
      return actions.slice(0, 3);
    }
    return [
      '10 dakikalık sınıf içi tekrar yapın.',
      'Paragrafta anlam konusunda mini quiz ile pekiştirme uygulayın.',
      'Destek önerilen öğrencilerle kısa kontrol görüşmesi planlayın.',
    ];
  }

  get classAnalysisSummary(): string {
    const feed = this.dashboardData?.puqAiAgentFeed?.[0]?.message;
    if (feed) {
      return feed;
    }
    const topic = this.dashboardData?.mostDifficultTopic ?? 'ilgili konu';
    return `${topic} konusu için kısa tekrar ve adım adım çalışma önerildi.`;
  }

  get classAnalysisAction(): string {
    return (
      this.dashboardData?.recommendedActions?.[0] ??
      'Paragraf sorularını 3 adımlı çözüm formatına bölün.'
    );
  }

  formatTrend(trend: string): string {
    const labels: Record<string, string> = {
      improving: 'Yükseliş',
      stable: 'Stabil',
      declining: 'Düşüş',
    };
    return labels[trend] ?? trend;
  }

  formatPriority(priority: string): string {
    const labels: Record<string, string> = {
      high: 'Yüksek',
      medium: 'Orta',
      low: 'Düşük',
    };
    return labels[priority] ?? priority;
  }

  getSuggestedMeetingHint(student: StudentNeedingSupport): string {
    return student.priority === 'high' ? '15 dk kontrol önerilir' : '10 dk kontrol önerilir';
  }

  readonly uiPreviewOptions: {
    key: UiPreviewTarget;
    label: string;
    description: string;
  }[] = [
    {
      key: 'standard',
      label: 'Standart',
      description: 'Standart öğrenme modu görünümü',
    },
    {
      key: 'reading',
      label: 'Okuma Kolaylığı Önizleme',
      description: 'Kişiselleştirilmiş mod — okunabilirlik odaklı arayüz',
    },
    {
      key: 'focus',
      label: 'Odak Desteği Önizleme',
      description: 'Kişiselleştirilmiş mod — odak ve mola destekli arayüz',
    },
  ];

  uiPreviewOpen = false;
  uiPreviewStudentId = 'stu-1';

  goToStudentExperience(): void {
    this.router.navigate(['/student-panel', this.uiPreviewStudentId]);
  }

  toggleUiPreviewPanel(): void {
    this.uiPreviewOpen = !this.uiPreviewOpen;
  }

  openUiPreview(
    profile: UiPreviewTarget,
    target: 'panel' | 'lesson' | 'quiz' = 'panel',
  ): void {
    const queryParams: Record<string, string> = {};
    if (profile !== 'standard') {
      queryParams['demoProfile'] = profile;
    }

    if (target === 'quiz') {
      this.router.navigate(
        [
          '/student-panel',
          this.uiPreviewStudentId,
          'quiz',
          'paragrafta-anlam',
        ],
        { queryParams },
      );
      return;
    }

    if (target === 'lesson') {
      queryParams['topic'] = 'paragrafta-anlam';
    }

    this.router.navigate(['/student-panel', this.uiPreviewStudentId], {
      queryParams,
    });
  }

  scrollToSection(sectionId: string): void {
    const element = document.getElementById(sectionId);
    if (!element) {
      return;
    }

    const scrollRoot = document.querySelector(
      '.teacher-content',
    ) as HTMLElement | null;

    if (scrollRoot) {
      const rootTop = scrollRoot.getBoundingClientRect().top;
      const targetTop = element.getBoundingClientRect().top;
      scrollRoot.scrollTo({
        top: scrollRoot.scrollTop + targetTop - rootTop - 12,
        behavior: 'smooth',
      });
      return;
    }

    element.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  openMeetingModal(student: StudentNeedingSupport): void {
    this.selectedMeetingStudent = {
      studentId: student.studentId,
      studentName: student.studentName,
      lesson: student.lesson,
      topic: student.topic,
      reason: student.reason,
      suggestedAction: student.suggestedAction,
      priority: student.priority,
      email: `${student.studentId}@school.local`,
      suggestedDuration: student.priority === 'high' ? 15 : 10,
    };
    this.meetingPlanDraft = this.buildMeetingPlanDraft(this.selectedMeetingStudent);
    this.selectedMeetingDate = this.getTomorrowIsoDate();
    this.selectedMeetingTime =
      this.meetingPlanDraft.recommendedTime ||
      (student.priority === 'high' ? '10:00' : '14:00');
    this.selectedDurationMinutes =
      this.meetingPlanDraft.recommendedDurationMinutes;
    this.isMeetingModalOpen = true;
  }

  closeMeetingModal(): void {
    this.isMeetingModalOpen = false;
    this.selectedMeetingStudent = null;
    this.meetingPlanDraft = null;
  }

  selectMeetingDuration(minutes: number): void {
    this.selectedDurationMinutes = minutes;
  }

  selectMeetingTime(time: string): void {
    this.selectedMeetingTime = time;
  }

  onMeetingDateChange(value: string): void {
    this.selectedMeetingDate = value;
  }

  getMinMeetingDate(): string {
    return this.toIsoDateOnly(new Date());
  }

  getMeetingLearningMode(): string {
    return 'Kişiselleştirilmiş Öğrenme Modu';
  }

  getMeetingPurpose(): string {
    return (
      this.meetingPlanDraft?.meetingPurpose ??
      'Öğrencinin zorlandığı konu başlığını kısa bir kontrol görüşmesiyle netleştirmek.'
    );
  }

  getMeetingAgenda(): string[] {
    return (
      this.meetingPlanDraft?.agenda ?? [
        'Öğrencinin zorlandığı soru türünü birlikte incele.',
        'Kısa bir örnek üzerinden konuyu tekrar et.',
        'Bir sonraki çalışma adımını birlikte belirle.',
      ]
    );
  }

  getMeetingTeacherNote(): string {
    return (
      this.meetingPlanDraft?.teacherNote ??
      'Görüşmede öğrencinin çözüm adımlarını nasıl takip ettiğine odaklanın.'
    );
  }

  getMeetingActions(): string[] {
    return (
      this.meetingPlanDraft?.actions ?? [
        'Kısa tekrar etkinliği ver.',
        'Benzer 2 örnek soru çözdür.',
        'Bir sonraki mini quiz sonucunu takip et.',
      ]
    );
  }

  getSelectedScheduleLabel(): string {
    if (!this.selectedMeetingDate) {
      return 'Yarın';
    }
    return this.formatDateLabel(this.selectedMeetingDate);
  }

  formatPlannedMeetingSchedule(meeting: PlannedMeeting): string {
    const dateLabel =
      meeting.dateDisplayLabel ||
      (meeting.scheduledDate
        ? this.formatDateLabel(meeting.scheduledDate)
        : 'Yarın');
    const time = meeting.scheduledTime || '10:00';
    return `${dateLabel} · ${time} · ${meeting.durationMinutes} dk`;
  }

  saveMeetingPlan(): void {
    if (!this.selectedMeetingStudent) {
      return;
    }

    const student = this.selectedMeetingStudent;
    const purpose = this.getMeetingPurpose();
    const agenda = this.getMeetingAgenda();
    const teacherNote = this.getMeetingTeacherNote();
    const actions = this.getMeetingActions();
    const dateLabel = this.formatDateLabel(this.selectedMeetingDate);

    const plan: PlannedMeeting = {
      id: `meeting-${student.studentId}-${Date.now()}`,
      studentId: student.studentId,
      studentName: student.studentName,
      lesson: student.lesson,
      topic: student.topic,
      priorityLabel: this.formatPriority(student.priority),
      learningMode: this.getMeetingLearningMode(),
      durationMinutes: this.selectedDurationMinutes,
      scheduledDate: this.selectedMeetingDate,
      scheduledTime: this.selectedMeetingTime,
      dateDisplayLabel: dateLabel,
      purpose,
      agenda,
      teacherNote,
      actions,
      status: 'Planlandı',
      summary: purpose,
      createdAt: new Date().toISOString(),
    };

    this.plannedMeetings = [
      plan,
      ...this.plannedMeetings.filter((m) => m.studentId !== student.studentId),
    ];
    this.persistPlannedMeetings();
    this.triggerMeetWorkflow(student, plan);
    this.closeMeetingModal();
    this.showMeetingSavedToast(
      'Görüşme planı oluşturuldu.',
      'Planlanan görüşmeler listesine eklendi.',
    );
  }

  async copyMeetingNote(): Promise<void> {
    const note = [
      `Öğrenci: ${this.selectedMeetingStudent?.studentName ?? ''}`,
      `Konu: ${this.selectedMeetingStudent?.topic ?? ''}`,
      `Zaman: ${this.getSelectedScheduleLabel()} · ${this.selectedMeetingTime} · ${this.selectedDurationMinutes} dk`,
      '',
      'Görüşme Amacı:',
      this.getMeetingPurpose(),
      '',
      'Görüşme Gündemi:',
      ...this.getMeetingAgenda().map((item, i) => `${i + 1}. ${item}`),
      '',
      'Öğretmen Notu:',
      this.getMeetingTeacherNote(),
    ].join('\n');

    try {
      await navigator.clipboard.writeText(note);
      this.showMeetingSavedToast('Not panoya kopyalandı.', '');
    } catch {
      this.showMeetingSavedToast('Not kopyalanamadı.', '');
    }
  }

  dismissMeetingToast(): void {
    this.showMeetingToast = false;
    this.meetingToastSubtext = '';
    if (this.toastTimer) {
      clearTimeout(this.toastTimer);
    }
  }

  private showMeetingSavedToast(
    message = 'Görüşme planı oluşturuldu.',
    subtext = '',
  ): void {
    this.meetingToastMessage = message;
    this.meetingToastSubtext = subtext;
    this.showMeetingToast = true;
    if (this.toastTimer) {
      clearTimeout(this.toastTimer);
    }
    this.toastTimer = setTimeout(() => {
      this.showMeetingToast = false;
      this.meetingToastSubtext = '';
    }, 3800);
  }

  private buildMeetingPlanDraft(
    student: MeetingStudentContext,
  ): MeetingPlanDraft {
    const topic = student.topic;
    return {
      meetingPurpose: `Öğrencinin ${topic} konusunda zorlandığı noktaları kısa bir kontrol görüşmesiyle netleştirmek.`,
      recommendedDurationMinutes: student.suggestedDuration ?? 15,
      recommendedDateLabel: 'Yarın',
      recommendedTime: student.priority === 'high' ? '10:00' : '14:00',
      agenda: [
        `Öğrencinin ${topic} konusundaki zorlandığı soru türünü birlikte incele.`,
        'Kısa bir örnek üzerinden konuyu tekrar et.',
        'Bir sonraki çalışma adımını birlikte belirle.',
      ],
      teacherNote:
        'Görüşmede öğrencinin çözüm adımlarını nasıl takip ettiğine odaklanın. Doğrudan sonucu değil, hangi adımda zorlandığını gözlemleyin.',
      actions: [
        'Kısa tekrar etkinliği ver.',
        'Benzer 2 örnek soru çözdür.',
        'Bir sonraki mini quiz sonucunu takip et.',
      ],
    };
  }

  private getTomorrowIsoDate(): string {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return this.toIsoDateOnly(d);
  }

  private toIsoDateOnly(date: Date): string {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }

  private formatDateLabel(isoDate: string): string {
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

  private normalizeStoredMeeting(raw: PlannedMeeting): PlannedMeeting {
    return {
      ...raw,
      scheduledDate: raw.scheduledDate ?? this.getTomorrowIsoDate(),
      scheduledTime: raw.scheduledTime ?? '10:00',
      dateDisplayLabel:
        raw.dateDisplayLabel ??
        (raw.scheduledDate
          ? this.formatDateLabel(raw.scheduledDate)
          : 'Yarın'),
    };
  }

  private persistPlannedMeetings(): void {
    try {
      localStorage.setItem(
        PLANNED_MEETINGS_STORAGE_KEY,
        JSON.stringify(this.plannedMeetings),
      );
    } catch {
      // Sessizce devam et
    }
  }

  private loadPlannedMeetings(): void {
    try {
      const raw = localStorage.getItem(PLANNED_MEETINGS_STORAGE_KEY);
      if (!raw) {
        return;
      }
      const parsed = JSON.parse(raw) as PlannedMeeting[];
      if (Array.isArray(parsed)) {
        this.plannedMeetings = parsed.map((m) => this.normalizeStoredMeeting(m));
      }
    } catch {
      this.plannedMeetings = [];
    }
  }

  private triggerMeetWorkflow(
    student: MeetingStudentContext,
    plan: PlannedMeeting,
  ): void {
    if (!this.dashboardData) {
      return;
    }

    const payload = {
      workflowType: 'student_meet_request',
      teacherName: this.dashboardData.teacherName,
      teacherEmail: 'teacher@example.com',
      studentName: student.studentName,
      studentEmail: student.email ?? `${student.studentId}@school.local`,
      lesson: student.lesson,
      topic: student.topic,
      reason: student.reason,
      suggestedDuration: plan.durationMinutes,
      selectedDate: plan.scheduledDate,
      selectedTime: plan.scheduledTime,
      priority: student.priority,
    };

    this.workflowService.triggerWorkflow(payload).subscribe({
      next: () => {
        // Sessiz arka plan kaydı
      },
      error: (error) => {
        console.error('Görüşme planı kaydı hatası:', error);
      },
    });
  }
}
