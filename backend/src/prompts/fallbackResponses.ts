import {
  MeetPlanningPromptInput,
  MeetWorkflowResponse,
  QuizBehaviorAnalysisResponse,
  QuizBehaviorPromptInput,
  StudentAnalysisPromptInput,
  StudentAnalysisResponse,
  StudentFeedbackPromptInput,
  StudentFeedbackResponse,
  SupportPlanPromptInput,
  SupportPlanWorkflowResponse,
  TeacherDashboardAnalysisResponse,
  TeacherDashboardPromptInput,
  WeeklyReportPromptInput,
  WeeklyReportWorkflowResponse,
} from './contracts/promptContracts';

function greetingName(name?: string): string {
  return name?.trim() ? name.trim() : 'Merhaba';
}

function focusFromInput(topic: string, mostDifficultTopic?: string): string {
  return mostDifficultTopic?.trim() || topic;
}

export function fallbackStudentFeedbackResponse(
  input: StudentFeedbackPromptInput
): StudentFeedbackResponse {
  const name = greetingName(input.studentName);
  const focus = focusFromInput(input.topic, input.mostDifficultTopic);
  const score = input.quizScore;
  const belowAverage =
    input.classAverage !== undefined && score < input.classAverage;

  let shortFeedback: string;
  let nextStep: string;
  let motivationMessage: string;

  if (score >= 85) {
    shortFeedback = `${focus} konusunda güçlü bir performans gösterdin.`;
    nextStep = `${focus} için 5 soruluk kısa bir pekiştirme quizi çözebilirsin.`;
    motivationMessage = 'İlerlemeni sürdürmen harika bir adım.';
  } else if (score >= 60) {
    shortFeedback = `${focus} konusunda iyi ilerliyorsun; birkaç adımda ek tekrar faydalı olabilir.`;
    nextStep = `${focus} için 10 dakikalık adım adım tekrar yap.`;
    motivationMessage = 'Küçük tekrarlar büyük fark yaratır.';
  } else {
    shortFeedback = `${focus} konusunda bazı adımlarda zorlanmış olabilirsin; bu normal bir öğrenme sürecidir.`;
    nextStep = `${focus} için işlem sırasını adım adım takip ederek 10 dakikalık kısa tekrar yap.`;
    motivationMessage = 'Her tekrar bir sonraki quizde sana yardımcı olur.';
  }

  if (belowAverage && score < 60) {
    shortFeedback = `${focus} konusunda sınıf ortalamasının altında kaldın; belirli adımlarda ek destek işe yarayabilir.`;
  }

  return {
    studentGreeting: `${name},`,
    shortFeedback,
    motivationMessage,
    nextStep,
    focusTopic: focus,
    confidence: 'low',
  };
}

export function fallbackStudentAnalysisResponse(
  input: StudentAnalysisPromptInput
): StudentAnalysisResponse {
  const focus = focusFromInput(input.topic, input.mostDifficultTopic);
  const performanceLevel =
    input.quizScore >= 85 ? 'high' : input.quizScore >= 60 ? 'medium' : 'low';

  return {
    studentSummary: `Analiz sınırlı veriyle oluşturuldu. ${focus} konusunda performans ${input.quizScore} puan olarak görünüyor.`,
    performanceLevel,
    attentionSignal: 'medium',
    difficultySignal:
      input.quizScore < 60 ? 'high' : input.quizScore < 80 ? 'medium' : 'low',
    strengths:
      input.quizScore >= 70
        ? [`${focus} konusunda doğru cevap oranı destekleyici.`]
        : [`${focus} konusunda tamamlanan quiz verisi mevcut.`],
    needsSupport:
      input.quizScore < 70
        ? [`${focus} adımlarında ek destek gerekebilir.`]
        : [],
    recommendedNextSteps: [
      `${focus} için 10 dakikalık görsel tekrar`,
      '5 soruluk mini quiz',
      'Yanlış yapılan soruların çözüm adımlarını tekrar inceleme',
    ],
    teacherNote: `Öğretmen notu: ${focus} için kısa tekrar ve örnek çözüm önerilir.`,
    adaptiveUiSuggestion: {
      contentStyle: input.quizScore < 60 ? 'step_by_step' : 'practice_based',
      quizDifficulty: input.quizScore < 60 ? 'easier' : 'same',
      supportType: input.quizScore < 60 ? 'example' : 'hint',
    },
    confidence: 'low',
  };
}

export function fallbackQuizBehaviorResponse(
  input: QuizBehaviorPromptInput
): QuizBehaviorAnalysisResponse {
  return {
    interactionSummary:
      'Analiz sınırlı veriyle oluşturuldu. Quiz sırasında etkileşim sinyalleri birlikte değerlendirildi.',
    attentionSignal: 'medium',
    engagementSignal: 'medium',
    confidenceSignal: 'medium',
    behaviorNotes: [
      'Cevap süresi ve etkileşim verileri öğrenme süreci desteği için kullanıldı.',
      'Tek bir metrik üzerinden kesin yorum yapılmadı.',
    ],
    safeInterpretation: `${input.topic} konusunda adım adım ilerlemek öğrenme sürecini destekleyebilir.`,
    confidence: 'low',
  };
}

export function fallbackTeacherDashboardResponse(
  input: TeacherDashboardPromptInput
): TeacherDashboardAnalysisResponse {
  const supportStudents = input.students
    .filter((s) => s.score < 70)
    .slice(0, 3)
    .map((s) => ({
      studentId: s.studentId,
      studentName: s.studentName,
      reason: `${s.mostDifficultTopic} konusunda ek destek gerekebilir.`,
      suggestedAction: `${s.mostDifficultTopic} için adım adım tekrar önerilir.`,
      priority: (s.score < 50 ? 'high' : 'medium') as 'low' | 'medium' | 'high',
    }));

  const challengeStudents = input.students
    .filter((s) => s.score >= 85)
    .slice(0, 3)
    .map((s) => ({
      studentId: s.studentId,
      studentName: s.studentName,
      reason: 'Yüksek performans gözlemlendi.',
      suggestedAction: 'Ek pratik ve ileri seviye sorular önerilir.',
    }));

  return {
    classSummary: `Analiz sınırlı veriyle oluşturuldu. ${input.className} sınıfında ortalama ${input.classAverage} puan görülüyor.`,
    mostDifficultTopic: input.mostDifficultTopic,
    studentsNeedingSupport: supportStudents,
    challengeReadyStudents: challengeStudents,
    recommendedTeacherActions: [
      `${input.mostDifficultTopic} için 10 dakikalık sınıf içi tekrar yapın.`,
      'Destek gereken öğrencilerle kısa bireysel kontrol planlayın.',
      'Challenge-ready öğrencilere ek pratik seti verin.',
    ],
    workflowSuggestions: [
      {
        type: 'weekly_report',
        title: 'Haftalık sınıf raporu',
        reason: 'Sınıf genel trendini özetlemek için',
        priority: 'medium',
      },
    ],
    confidence: 'low',
  };
}

export function fallbackMeetWorkflowResponse(
  input: MeetPlanningPromptInput
): MeetWorkflowResponse {
  const focus = focusFromInput(input.topic, input.mostDifficultTopic);
  return {
    workflowType: 'meet_request',
    priority: 'medium',
    studentName: input.studentName,
    studentId: input.studentId,
    lesson: input.lesson,
    topic: input.topic,
    meetingReason: `${focus} konusunda öğrenme desteği görüşmesi.`,
    teacherMessage: `Analiz sınırlı veriyle oluşturuldu. ${input.studentName} ile ${focus} odağında kısa görüşme planlanabilir.`,
    suggestedDurationMinutes: 15,
    suggestedAgenda: [
      'Son quiz performansını birlikte gözden geçirme',
      'Zorlanılan adımları belirleme',
      'Bir sonraki hafta için kısa çalışma planı oluşturma',
    ],
    studentSupportFocus: [
      `${focus} için adım adım tekrar`,
      'Örnek çözüm üzerinden kısa uygulama',
    ],
    parentOrGuardianNote:
      'Görüşme öğrenme desteği amaçlıdır; performans gelişimi birlikte ele alınacaktır.',
    dashboardSummary: `${input.studentName} için meet planı hazırlandı.`,
    confidence: 'low',
  };
}

export function fallbackSupportPlanWorkflowResponse(
  input: SupportPlanPromptInput
): SupportPlanWorkflowResponse {
  const focus = focusFromInput(input.topic, input.mostDifficultTopic);
  return {
    workflowType: 'support_plan',
    priority: input.quizScore !== undefined && input.quizScore < 60 ? 'high' : 'medium',
    studentId: input.studentId,
    studentName: input.studentName,
    lesson: input.lesson,
    topic: input.topic,
    studentSummary: `Analiz sınırlı veriyle oluşturuldu. ${focus} konusunda destek planı önerildi.`,
    supportReason: `${focus} adımlarında ek tekrar faydalı olabilir.`,
    recommendedStudyPlan: [
      {
        step: 1,
        title: 'Kavram tekrarı',
        description: `${focus} konusunun temel adımlarını 10 dakika gözden geçir.`,
        durationMinutes: 10,
      },
      {
        step: 2,
        title: 'Örnek çözüm',
        description: 'Bir örnek soruyu adım adım çöz ve not al.',
        durationMinutes: 10,
      },
      {
        step: 3,
        title: 'Mini quiz',
        description: '5 soruluk kısa uygulama yap.',
        durationMinutes: 10,
      },
    ],
    practiceSuggestions: [
      'Yanlış yapılan soruların çözüm adımlarını tekrar incele',
      '5 soruluk mini quiz',
    ],
    teacherNote: `${input.studentName} için ${focus} odağında 3 adımlı plan takip edilebilir.`,
    studentMotivationMessage:
      'Kısa ve düzenli tekrarlar bir sonraki quizde sana yardımcı olabilir.',
    adaptiveUiSuggestion: {
      contentStyle: 'step_by_step',
      quizDifficulty: 'easier',
      supportType: 'example',
    },
    dashboardSummary: `${input.studentName} için destek planı oluşturuldu.`,
    confidence: 'low',
  };
}

export function fallbackWeeklyReportWorkflowResponse(
  input: WeeklyReportPromptInput
): WeeklyReportWorkflowResponse {
  let progressTrend: 'improving' | 'stable' | 'decreasing' = 'stable';
  if (
    input.previousWeekAverage !== undefined &&
    input.classAverage > input.previousWeekAverage + 2
  ) {
    progressTrend = 'improving';
  } else if (
    input.previousWeekAverage !== undefined &&
    input.classAverage < input.previousWeekAverage - 2
  ) {
    progressTrend = 'decreasing';
  }

  return {
    workflowType: 'weekly_report',
    teacherName: input.teacherName ?? 'Öğretmen',
    classId: input.classId ?? 'class-default',
    className: input.className,
    lesson: input.lesson,
    week: input.week ?? 'Bu hafta',
    classSummary: `Analiz sınırlı veriyle oluşturuldu. ${input.className} sınıfında ortalama ${input.classAverage} puan.`,
    progressTrend,
    mostDifficultTopic: input.mostDifficultTopic,
    keyFindings: [
      `${input.studentCount} öğrenci verisi değerlendirildi.`,
      `En zor konu: ${input.mostDifficultTopic}.`,
      `${input.supportSuggestedCount} öğrenci için destek önerisi var.`,
    ],
    studentsNeedingSupportSummary: (input.studentsNeedingSupport ?? [])
      .slice(0, 5)
      .map((s) => ({
        studentId: s.studentId,
        studentName: s.studentName,
        reason: `${s.mostDifficultTopic} konusunda ek destek gerekebilir.`,
        suggestedAction: 'Adım adım tekrar ve örnek çözüm önerilir.',
      })),
    recommendedTeacherActions: [
      `${input.mostDifficultTopic} için sınıf içi 10 dakikalık tekrar`,
      'Destek gereken öğrencilerle kısa kontrol görüşmesi',
      'Challenge-ready öğrencilere ek pratik',
    ],
    nextWeekFocus: [
      input.mostDifficultTopic,
      'Kısa tekrar rutini',
      'Mini quiz ile pekiştirme',
    ],
    dashboardSummary: 'Haftalık rapor sınırlı veriyle oluşturuldu.',
    confidence: 'low',
  };
}
