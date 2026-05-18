import { StudentPanelResponse } from '../models/student-panel';

export const FALLBACK_STUDENT_PANEL: StudentPanelResponse = {
  studentId: 'stu-1',
  studentName: 'Ayşe Yılmaz',
  lesson: 'Türkçe',
  topic: 'Paragrafta Anlam',
  score: 68,
  studentMessage: 'Kişiselleştirilmiş öğrenme görünümü hazır.',
  learningSummary: {
    activeLesson: 'Türkçe',
    activeTopic: 'Paragrafta Anlam',
    lastQuizScore: 68,
    progressPercentage: 35,
  },
  supportPlan: {
    title: 'AI Destek Planın',
    description: 'Quiz sonrası kişisel çalışma planı',
    steps: [
      '10 dk konu tekrarı',
      '10 dk örnek çözüm',
      '5 soruluk mini quiz',
    ],
    nextQuizDifficulty: 'Biraz daha kolay, ipuçlu sorular',
  },
  todayRecommendation: {
    title: 'Bugünkü Önerilen Adım',
    message:
      'Paragrafta Anlam konusuna devam et ve ardından kısa quiz’i tamamla.',
    actionLabel: 'Konuya Devam Et',
    targetRoute: '/student-panel/stu-1',
  },
  uiSettings: {
    largerText: true,
    showHints: true,
    stepByStepMode: true,
    reduceDistractions: false,
    showProgressFocus: true,
    showChallengeQuestions: false,
    simplifiedLayout: false,
    increasedLineHeight: true,
    highlightKeywords: true,
  },
  learningMode: 'PERSONALIZED',
  learningModeLabel: 'Kişiselleştirilmiş Öğrenme Modu',
  supportProfile: 'balanced_support',
  recommendation:
    'İçerikler artık senin öğrenme hızına ve ihtiyaçlarına göre daha anlaşılır sunulacak.',
  notifications: [],
};
