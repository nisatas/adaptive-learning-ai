import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import {
  StudentNotification,
  StudentPanelResponse,
} from '../../models/student-panel';
import {
  AdaptiveLearningState,
  getLearningModeDescription,
  getLearningModeLabel,
  isPersonalizedMode,
  loadAdaptiveLearningState,
  saveAdaptiveLearningState,
  SupportProfile,
} from '../../models/learning-mode';

import { FALLBACK_STUDENT_PANEL } from '../../data/fallback-student-panel';
import { HighlightKeywordsPipe } from '../../pipes/highlight-keywords.pipe';
import { StudentPanelService } from '../../services/student-panel';
import { logApiError } from '../../utils/api-error';
import { environment } from '../../../environments/environment';
import { shouldHighlightKeywords } from '../../utils/learning-highlight';
import { PUQ_STUDENT_RECOMMENDATION_STEPS } from '../../data/puq-workflows';
import {
  buildDemoAdaptiveState,
  buildLearningThemeClasses,
  DemoProfileKey,
  parseDemoProfileParam,
} from '../../utils/learning-theme';

@Component({
  selector: 'app-student-panel',
  imports: [CommonModule, HighlightKeywordsPipe],
  templateUrl: './student-panel.html',
  styleUrl: './student-panel.css',
})
export class StudentPanel implements OnInit, OnDestroy {
  readonly puqStudentRecommendationSteps = PUQ_STUDENT_RECOMMENDATION_STEPS;

  studentId = 'stu-1';
  activeSection: 'home' | 'dashboard' | 'lessons' = 'home';
  selectedTopic: string | null = null;

  lessonsOpen = false;
  turkishOpen = false;
  notificationsOpen = false;

  studentPanelData?: StudentPanelResponse;
  notifications: StudentNotification[] = [];
  isDemoMode = false;
  adaptiveState: AdaptiveLearningState = {};
  demoProfileOverride: DemoProfileKey | null = null;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private studentPanelService: StudentPanelService,
  ) {}

  ngOnInit(): void {
    document.documentElement.classList.add('panel-scroll-lock');

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.studentId = id;
    }

    const saved = loadAdaptiveLearningState();
    if (saved) {
      this.adaptiveState = saved;
    }

    this.loadStudentPanel();

    this.route.queryParams.subscribe((params) => {
      this.demoProfileOverride = parseDemoProfileParam(params['demoProfile']);
      if (this.demoProfileOverride) {
        this.applyAdaptiveState(
          buildDemoAdaptiveState(this.demoProfileOverride),
          false,
        );
      }
      this.applyTopicFromQuery(params['topic']);
    });
  }

  ngOnDestroy(): void {
    document.documentElement.classList.remove('panel-scroll-lock');
  }

  get effectiveState(): AdaptiveLearningState {
    if (this.demoProfileOverride) {
      return buildDemoAdaptiveState(this.demoProfileOverride);
    }
    return this.adaptiveState;
  }

  get effectiveSupportProfile(): SupportProfile {
    return this.effectiveState.supportProfile ?? null;
  }

  isReadingProfile(): boolean {
    return this.effectiveSupportProfile === 'reading_support';
  }

  isFocusProfile(): boolean {
    return this.effectiveSupportProfile === 'focus_support';
  }

  private applyTopicFromQuery(topic: string | undefined): void {
    if (topic === 'paragrafta-anlam') {
      this.openLessonTopic('paragrafta-anlam');
    }
  }

  loadStudentPanel(): void {
    this.isDemoMode = false;

    this.studentPanelService.getStudentPanel(this.studentId).subscribe({
      next: (data) => {
        this.studentPanelData = data;
        this.notifications = data.notifications ?? [];
        this.mergeAdaptiveFromApi(data);
        this.isDemoMode = false;
      },
      error: (error) => {
        logApiError(
          'Student panel',
          error,
          `${environment.apiUrl}/api/student/${this.studentId}/dashboard`,
        );
        this.studentPanelData = { ...FALLBACK_STUDENT_PANEL };
        this.notifications = [];
        this.isDemoMode = true;
      },
    });
  }

  private mergeAdaptiveFromApi(data: StudentPanelResponse): void {
    if (
      data.learningMode ||
      data.learningModeLabel ||
      data.supportProfile ||
      data.uiSettings
    ) {
      this.applyAdaptiveState({
        learningMode: data.learningMode,
        learningModeLabel: data.learningModeLabel,
        supportProfile: data.supportProfile,
        recommendation: data.recommendation,
        uiSettings: data.uiSettings,
      });
    }
  }

  private applyAdaptiveState(
    state: AdaptiveLearningState,
    persist = true,
  ): void {
    this.adaptiveState = { ...this.adaptiveState, ...state };
    if (this.studentPanelData && state.uiSettings) {
      this.studentPanelData = {
        ...this.studentPanelData,
        uiSettings: { ...state.uiSettings },
        learningMode: state.learningMode ?? this.studentPanelData.learningMode,
        learningModeLabel:
          state.learningModeLabel ?? this.studentPanelData.learningModeLabel,
        supportProfile:
          state.supportProfile ?? this.studentPanelData.supportProfile,
      };
    }
    if (persist && !this.demoProfileOverride) {
      saveAdaptiveLearningState(this.adaptiveState);
      if (state.uiSettings) {
        localStorage.setItem(
          'adaptiveUiSettings',
          JSON.stringify(state.uiSettings),
        );
      }
    }
  }

  isPersonalizedLearningMode(): boolean {
    return isPersonalizedMode(this.effectiveState);
  }

  isSupportedLearningMode(): boolean {
    return this.isPersonalizedLearningMode();
  }

  getAdaptiveModeName(): string {
    return getLearningModeLabel(this.effectiveState);
  }

  getAdaptiveModeDescription(): string {
    return getLearningModeDescription(this.effectiveState);
  }

  useKeywordHighlight(): boolean {
    return shouldHighlightKeywords(this.effectiveSupportProfile);
  }

  getShellClasses(): Record<string, boolean> {
    const state = this.effectiveState;
    const settings = state.uiSettings ?? this.studentPanelData?.uiSettings;
    return buildLearningThemeClasses(state, {
      'student-panel--large-text': !!settings?.largerText,
      'student-panel--focus-view': !!settings?.reduceDistractions,
      'student-panel--step-by-step': !!settings?.stepByStepMode,
      'student-panel--highlight-keywords': !!settings?.highlightKeywords,
    });
  }

  private buildDemoQueryParams(): Record<string, string> {
    const params: Record<string, string> = {};
    if (this.demoProfileOverride) {
      params['demoProfile'] = this.demoProfileOverride;
    }
    return params;
  }

  getStudentInitials(): string {
    const name = this.studentPanelData?.studentName?.trim() || 'AY';
    const parts = name.split(/\s+/).filter(Boolean);
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  }

  getEstimatedCorrectCount(): number {
    const score = this.studentPanelData?.learningSummary.lastQuizScore ?? 68;
    return Math.min(10, Math.max(0, Math.round((score / 100) * 10)));
  }

  getEstimatedWrongCount(): number {
    return Math.max(0, 10 - this.getEstimatedCorrectCount());
  }

  changeSection(section: 'home' | 'dashboard' | 'lessons'): void {
    this.activeSection = section;
    if (section !== 'lessons') {
      this.selectedTopic = null;
    }
  }

  toggleLessons(): void {
    this.lessonsOpen = !this.lessonsOpen;
    if (this.lessonsOpen) {
      this.activeSection = 'lessons';
    }
  }

  openLessonTopic(topic: string): void {
    this.activeSection = 'lessons';
    this.selectedTopic = topic;
    this.lessonsOpen = true;
    this.turkishOpen = true;
  }

  toggleTurkish(): void {
    this.turkishOpen = !this.turkishOpen;
  }

  toggleNotifications(): void {
    this.notificationsOpen = !this.notificationsOpen;
  }

  getNotificationSchedule(notification: StudentNotification): string {
    const dateLabel =
      notification.dateDisplayLabel ??
      (notification.scheduledDate
        ? this.formatNotificationDateLabel(notification.scheduledDate)
        : '');
    const time = notification.scheduledTime ?? '';
    const duration =
      notification.duration && notification.duration > 0
        ? `${notification.duration} dk`
        : '';
    return [dateLabel, time, duration].filter(Boolean).join(' · ');
  }

  private formatNotificationDateLabel(isoDate: string): string {
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

  goToTeacherDashboard(): void {
    this.router.navigate(['/teacher-dashboard']);
  }

  goToLesson(): void {
    this.openLessonTopic('paragrafta-anlam');
  }

  startTopicQuiz(topicId: string): void {
    const queryParams = this.buildDemoQueryParams();
    this.router.navigate(
      ['/student-panel', this.studentId, 'quiz', topicId],
      Object.keys(queryParams).length ? { queryParams } : undefined,
    );
  }
}
