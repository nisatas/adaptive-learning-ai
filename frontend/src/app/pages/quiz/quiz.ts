import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import {
  FALLBACK_PARAGRAF_QUIZ,
  ParagrafQuizData,
  ParagrafQuizQuestion,
  PUQ_QUIZ_RECOMMENDATION,
} from '../../data/fallback-paragraf-quiz';
import {
  AdaptiveLearningState,
  getLearningModeDescription,
  getLearningModeLabel,
  isPersonalizedMode,
  loadAdaptiveLearningState,
  saveAdaptiveLearningState,
  SupportProfile,
} from '../../models/learning-mode';
import { QuizSubmitResponse } from '../../models/quiz-submit';
import { UiSettings } from '../../models/ui-settings';
import { HighlightKeywordsPipe } from '../../pipes/highlight-keywords.pipe';
import { QuizService } from '../../services/quiz';
import { logApiError } from '../../utils/api-error';
import { environment } from '../../../environments/environment';
import { shouldHighlightKeywords } from '../../utils/learning-highlight';
import { buildFallbackSubmitState } from '../../utils/adaptation-client';
import {
  buildDemoAdaptiveState,
  buildLearningThemeClasses,
  DemoProfileKey,
  getReadingOptionMeta,
  parseDemoProfileParam,
} from '../../utils/learning-theme';

const BREAK_INTERVAL_MS = 10 * 60 * 1000;
const BREAK_DURATION_MS = 2 * 60 * 1000;
/** Sunum önizlemesinde molayı hızlı göstermek için (demoProfile=focus) */
const DEMO_BREAK_INTERVAL_MS = 45 * 1000;
const DEMO_BREAK_DURATION_MS = 15 * 1000;

@Component({
  selector: 'app-quiz',
  imports: [CommonModule, HighlightKeywordsPipe],
  templateUrl: './quiz.html',
  styleUrl: './quiz.css',
})
export class Quiz implements OnInit, OnDestroy {
  studentId = 'stu-1';
  topicId = 'paragrafta-anlam';

  quizData: ParagrafQuizData = FALLBACK_PARAGRAF_QUIZ;
  questions: ParagrafQuizQuestion[] = FALLBACK_PARAGRAF_QUIZ.questions;
  puqRecommendation = PUQ_QUIZ_RECOMMENDATION;

  currentQuestionIndex = 0;
  selectedOptionId = '';
  isLoading = true;
  isDemoMode = false;
  quizCompleted = false;
  modeUpdated = false;
  submitRecommendation = '';

  isAnswered = false;
  showFeedback = false;
  lastAnswerCorrect = false;
  successCelebration = '';

  score = 0;
  correctCount = 0;
  answeredCount = 0;

  adaptiveState: AdaptiveLearningState = {};
  demoProfileOverride: DemoProfileKey | null = null;
  uiSettings: UiSettings = {
    largerText: false,
    showHints: false,
    stepByStepMode: false,
    reduceDistractions: false,
    showProgressFocus: false,
    showChallengeQuestions: false,
  };

  answers: {
    questionId: string;
    submitQuestionId: string;
    selectedOptionId: string;
    timeSpentSeconds: number;
    skipped: boolean;
    isCorrect: boolean;
    topic: string;
  }[] = [];

  quizElapsedSeconds = 0;
  showBreakPrompt = false;
  breakActive = false;
  breakRemainingSeconds = 0;

  private questionStartedAt = Date.now();
  private quizStartedAt = Date.now();
  private elapsedTimer?: ReturnType<typeof setInterval>;
  private breakCountdownTimer?: ReturnType<typeof setInterval>;
  private lastBreakAtMs = 0;

  constructor(
    private quizService: QuizService,
    private router: Router,
    private route: ActivatedRoute,
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    const topic = this.route.snapshot.paramMap.get('topicId');
    if (id) {
      this.studentId = id;
    }
    if (topic) {
      this.topicId = topic;
    }

    const saved = loadAdaptiveLearningState();
    if (saved?.uiSettings) {
      this.applyAdaptiveState(saved, false);
    }

    this.route.queryParams.subscribe((params) => {
      this.demoProfileOverride = parseDemoProfileParam(params['demoProfile']);
      if (this.demoProfileOverride) {
        this.applyAdaptiveState(
          buildDemoAdaptiveState(this.demoProfileOverride),
          false,
        );
      } else if (saved) {
        this.applyAdaptiveState(saved, false);
      }
    });

    this.loadQuiz();
    this.startElapsedTimer();
  }

  ngOnDestroy(): void {
    this.clearTimers();
    document.body.style.overflow = '';
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

  loadQuiz(): void {
    this.isLoading = true;
    this.isDemoMode = false;

    this.quizService.getDemoQuiz().subscribe({
      next: () => {
        this.applyFallbackQuiz();
        this.isDemoMode = false;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Quiz API error:', error);
        this.applyFallbackQuiz();
        this.isDemoMode = true;
        this.isLoading = false;
      },
    });
  }

  private applyFallbackQuiz(): void {
    this.quizData = { ...FALLBACK_PARAGRAF_QUIZ };
    this.questions = [...FALLBACK_PARAGRAF_QUIZ.questions];
    this.questionStartedAt = Date.now();
    this.quizStartedAt = Date.now();
    this.lastBreakAtMs = Date.now();
  }

  get currentQuestion(): ParagrafQuizQuestion {
    return this.questions[this.currentQuestionIndex];
  }

  get progressPercent(): number {
    if (!this.questions.length) {
      return 0;
    }
    return Math.round(
      ((this.currentQuestionIndex + 1) / this.questions.length) * 100,
    );
  }

  get successPercent(): number {
    if (!this.questions.length) {
      return 0;
    }
    return Math.round((this.correctCount / this.questions.length) * 100);
  }

  get formattedElapsedTime(): string {
    const m = Math.floor(this.quizElapsedSeconds / 60);
    const s = this.quizElapsedSeconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  }

  get formattedBreakRemaining(): string {
    const m = Math.floor(this.breakRemainingSeconds / 60);
    const s = this.breakRemainingSeconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  }

  isPersonalizedLearningMode(): boolean {
    return isPersonalizedMode(this.effectiveState);
  }

  isReadingProfile(): boolean {
    return this.effectiveSupportProfile === 'reading_support';
  }

  isFocusProfile(): boolean {
    return this.effectiveSupportProfile === 'focus_support';
  }

  useColorCodedOptions(): boolean {
    return this.isReadingProfile();
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

  getPageClasses(): Record<string, boolean> {
    const state = this.effectiveState;
    const settings = state.uiSettings ?? this.uiSettings;
    return buildLearningThemeClasses(state, {
      'quiz-page--large-text': !!settings.largerText,
      'quiz-page--focus-view': !!settings.reduceDistractions,
      'quiz-page--step-by-step': !!settings.stepByStepMode,
      'quiz-page--highlight-keywords': !!settings.highlightKeywords,
      'quiz-page--single-question': this.isPersonalizedLearningMode(),
    });
  }

  getHardestQuestionType(): string {
    const wrong = this.answers.filter((a) => !a.isCorrect);
    if (!wrong.length) {
      return 'Genel tekrar';
    }

    const counts = new Map<string, number>();
    for (const answer of wrong) {
      const topic = answer.topic?.trim() || 'Genel';
      counts.set(topic, (counts.get(topic) ?? 0) + 1);
    }

    let topTopic = 'Genel tekrar';
    let topCount = 0;
    for (const [topic, count] of counts) {
      if (count > topCount) {
        topTopic = topic;
        topCount = count;
      }
    }
    return topTopic;
  }

  getQuizAnalysisRecommendation(): string {
    if (this.submitRecommendation) {
      return this.submitRecommendation;
    }
    if (this.modeUpdated && this.isPersonalizedLearningMode()) {
      return 'Quiz sonuçlarına göre öğrenme deneyimin kişiselleştirildi. İçerikler artık daha anlaşılır, adım adım ve sana uygun şekilde sunulacak.';
    }
    return 'Yanlış yaptığın soru türlerini kısa tekrarlarla pekiştirmeye devam et.';
  }

  getCompletionMessage(): string {
    if (this.modeUpdated && this.isPersonalizedLearningMode()) {
      return 'Quiz tamamlandı. Cevaplarına göre öğrenme deneyimin kişiselleştirildi. İçerikler artık daha anlaşılır, adım adım ve sana uygun şekilde sunulacak.';
    }
    const pct = this.successPercent;
    if (pct >= 80) {
      return 'Harika! Paragrafta anlam konusunda güçlü bir ilerleme gösterdin.';
    }
    if (pct >= 50) {
      return 'Güzel ilerliyorsun. Ana fikir ve yardımcı fikir ayrımını biraz daha tekrar edebilirsin.';
    }
    return 'Bu konu biraz daha tekrar isteyebilir. Adım adım ilerleyerek tekrar deneyebilirsin.';
  }

  getStepHint(): string {
    if (this.isFocusProfile()) {
      return 'Şimdi bu soruya odaklan. Önce paragrafı oku, sonra şıkkını seç.';
    }
    const step = this.currentQuestionIndex + 1;
    return `Şimdi ${step}. adımı tamamla: önce paragrafı oku, sonra soruyu yanıtla.`;
  }

  getFocusTip(): string {
    return 'Şimdi bu soruya odaklan. Tek bir görev: doğru şıkkı seç.';
  }

  getReadingOptionLabel(optionId: string): string {
    return getReadingOptionMeta(optionId).label;
  }

  getReadingOptionClass(optionId: string): string {
    return getReadingOptionMeta(optionId).class;
  }

  getSuccessMessage(): string {
    const messages = ['Harika!', 'Doğru cevap!', 'Devam ediyorsun!'];
    return messages[this.correctCount % messages.length];
  }

  selectOption(optionId: string): void {
    if (this.isAnswered || this.quizCompleted || this.breakActive) {
      return;
    }
    this.selectedOptionId = optionId;
    this.isAnswered = true;
    this.showFeedback = true;
    this.lastAnswerCorrect =
      optionId === this.currentQuestion.correctOptionId;

    if (this.lastAnswerCorrect) {
      this.score += 20;
      this.correctCount += 1;
      this.successCelebration = this.getSuccessMessage();
    } else {
      this.successCelebration = '';
    }
    this.answeredCount += 1;
  }

  getCorrectAnswerLabel(): string {
    const correct = this.currentQuestion.options.find(
      (o) => o.id === this.currentQuestion.correctOptionId,
    );
    if (!correct) {
      return '';
    }
    if (this.useColorCodedOptions()) {
      return `${getReadingOptionMeta(correct.id).label}: ${correct.text}`;
    }
    return `${correct.id.toUpperCase()}) ${correct.text}`;
  }

  getOptionClass(optionId: string): Record<string, boolean> {
    const selected = this.selectedOptionId === optionId;
    const correct = optionId === this.currentQuestion.correctOptionId;

    return {
      selected,
      correct: this.showFeedback && correct,
      incorrect: this.showFeedback && selected && !correct,
      [getReadingOptionMeta(optionId).class]: this.useColorCodedOptions(),
      'option-card--color-coded': this.useColorCodedOptions(),
      'option-card--focus-stack': this.isFocusProfile(),
    };
  }

  nextQuestion(): void {
    if (!this.isAnswered || this.breakActive) {
      return;
    }

    const elapsed = Math.max(
      3,
      Math.round((Date.now() - this.questionStartedAt) / 1000),
    );
    const timeSpentSeconds = this.lastAnswerCorrect
      ? Math.max(elapsed, 18)
      : Math.min(elapsed, 7);

    this.answers.push({
      questionId: this.currentQuestion.questionId,
      submitQuestionId: this.currentQuestion.submitQuestionId,
      selectedOptionId: this.selectedOptionId,
      timeSpentSeconds,
      skipped: !this.selectedOptionId,
      isCorrect: this.lastAnswerCorrect,
      topic: this.currentQuestion.topic,
    });

    this.selectedOptionId = '';
    this.isAnswered = false;
    this.showFeedback = false;
    this.lastAnswerCorrect = false;
    this.successCelebration = '';
    this.questionStartedAt = Date.now();

    if (this.currentQuestionIndex < this.questions.length - 1) {
      this.currentQuestionIndex += 1;
    } else {
      this.finishQuiz();
    }
  }

  finishQuiz(): void {
    this.quizCompleted = true;
    this.clearTimers();

    const wrongCount = this.questions.length - this.correctCount;
    const payload = {
      studentId: this.studentId,
      answers: [],
      quizMeta: {
        topicId: this.topicId,
        totalQuestions: this.questions.length,
        correctCount: this.correctCount,
        wrongCount,
        score: this.successPercent,
        answerDetails: this.answers.map((a) => ({
          questionId: a.questionId,
          topic: a.topic,
          isCorrect: a.isCorrect,
          timeSpentSeconds: a.timeSpentSeconds,
        })),
      },
    };

    this.quizService.submitQuiz(payload).subscribe({
      next: (response) => this.handleSubmitResponse(response),
      error: (error) => {
        logApiError(
          'Quiz submit',
          error,
          `${environment.apiUrl}/api/quizzes/demo/submit`,
        );
        this.applyFallbackAfterSubmit();
      },
    });
  }

  private handleSubmitResponse(response: QuizSubmitResponse): void {
    const previousMode = this.adaptiveState.learningMode;
    if (!this.demoProfileOverride) {
      this.applyAdaptiveState(
        {
          learningMode: response.learningMode,
          learningModeLabel: response.learningModeLabel,
          supportProfile: response.supportProfile,
          recommendation: response.recommendation,
          uiSettings: response.uiSettings,
        },
        true,
      );
    }
    this.modeUpdated =
      previousMode !== response.learningMode ||
      response.learningMode === 'PERSONALIZED';
    this.submitRecommendation =
      response.recommendation ||
      'İçerikler artık senin öğrenme hızına ve ihtiyaçlarına göre daha anlaşılır sunulacak.';
    this.isDemoMode = false;
  }

  private applyFallbackAfterSubmit(): void {
    const fallback = buildFallbackSubmitState(
      this.successPercent,
      this.answers.map((a) => ({
        topic: a.topic,
        isCorrect: a.isCorrect,
        timeSpentSeconds: a.timeSpentSeconds,
      })),
    );

    if (!this.demoProfileOverride) {
      this.applyAdaptiveState(fallback, true);
    }
    this.modeUpdated = fallback.learningMode === 'PERSONALIZED';
    this.submitRecommendation = fallback.recommendation ?? '';
    this.isDemoMode = true;
  }

  private applyAdaptiveState(state: AdaptiveLearningState, persist: boolean): void {
    this.adaptiveState = { ...this.adaptiveState, ...state };
    if (state.uiSettings) {
      this.uiSettings = { ...state.uiSettings };
    }
    if (persist && !this.demoProfileOverride) {
      saveAdaptiveLearningState(this.adaptiveState);
      localStorage.setItem(
        'adaptiveUiSettings',
        JSON.stringify(this.uiSettings),
      );
    }
  }

  private get breakIntervalMs(): number {
    return this.demoProfileOverride === 'focus'
      ? DEMO_BREAK_INTERVAL_MS
      : BREAK_INTERVAL_MS;
  }

  private get breakDurationMs(): number {
    return this.demoProfileOverride === 'focus'
      ? DEMO_BREAK_DURATION_MS
      : BREAK_DURATION_MS;
  }

  startBreak(): void {
    this.showBreakPrompt = false;
    this.breakActive = true;
    this.breakRemainingSeconds = Math.round(this.breakDurationMs / 1000);
    document.body.style.overflow = 'hidden';

    if (this.breakCountdownTimer) {
      clearInterval(this.breakCountdownTimer);
    }
    this.breakCountdownTimer = setInterval(() => {
      this.breakRemainingSeconds -= 1;
      if (this.breakRemainingSeconds <= 0) {
        this.endBreak();
      }
    }, 1000);
  }

  dismissBreakPrompt(): void {
    this.showBreakPrompt = false;
    this.lastBreakAtMs = Date.now();
  }

  endBreak(): void {
    this.breakActive = false;
    this.showBreakPrompt = false;
    this.lastBreakAtMs = Date.now();
    document.body.style.overflow = '';
    if (this.breakCountdownTimer) {
      clearInterval(this.breakCountdownTimer);
    }
  }

  private startElapsedTimer(): void {
    this.elapsedTimer = setInterval(() => {
      if (this.quizCompleted || this.breakActive) {
        return;
      }
      this.quizElapsedSeconds = Math.floor(
        (Date.now() - this.quizStartedAt) / 1000,
      );

      if (
        this.isFocusProfile() &&
        !this.showBreakPrompt &&
        !this.breakActive &&
        Date.now() - this.lastBreakAtMs >= this.breakIntervalMs
      ) {
        this.showBreakPrompt = true;
      }
    }, 1000);
  }

  private clearTimers(): void {
    if (this.elapsedTimer) {
      clearInterval(this.elapsedTimer);
    }
    if (this.breakCountdownTimer) {
      clearInterval(this.breakCountdownTimer);
    }
  }

  retryQuiz(): void {
    this.currentQuestionIndex = 0;
    this.selectedOptionId = '';
    this.isAnswered = false;
    this.showFeedback = false;
    this.quizCompleted = false;
    this.modeUpdated = false;
    this.lastAnswerCorrect = false;
    this.successCelebration = '';
    this.score = 0;
    this.correctCount = 0;
    this.answeredCount = 0;
    this.answers = [];
    this.quizElapsedSeconds = 0;
    this.showBreakPrompt = false;
    this.breakActive = false;
    this.questionStartedAt = Date.now();
    this.quizStartedAt = Date.now();
    this.lastBreakAtMs = Date.now();
    this.startElapsedTimer();
  }

  goBackToTopic(): void {
    const queryParams: Record<string, string> = { topic: this.topicId };
    if (this.demoProfileOverride) {
      queryParams['demoProfile'] = this.demoProfileOverride;
    }
    this.router.navigate(['/student-panel', this.studentId], { queryParams });
  }

  goToStudentPanel(): void {
    this.router.navigate(['/student-panel', this.studentId]);
  }
}
