import { DashboardResponse } from '../models/dashboard';

/** Yerel özet veriler — canlı API erişilemediğinde */
export const FALLBACK_TEACHER_DASHBOARD: DashboardResponse = {
  className: '6/A',
  lesson: 'Türkçe',
  topic: 'Paragrafta Anlam',
  studentCount: 12,
  classAverage: 68,
  averageResponseTime: 27,
  supportSuggestedCount: 5,
  challengeReadyCount: 2,
  mostDifficultTopic: 'Ana fikir bulma',
  lastUpdated: new Date().toISOString(),
  teacherName: 'Zeynep Demir',
  teacherRole: 'Türkçe Öğretmeni',
  recommendedActions: [
    'Yazım kuralları için 10 dakikalık sınıf içi tekrar yapın.',
    'Paragrafta anlam konusunda mini quiz ile pekiştirme uygulayın.',
    'Kişiselleştirilmiş öğrenme önerilen öğrencilerle kısa kontrol görüşmesi planlayın.',
    'İleri seviye hazır öğrenciler için ek pratik seti verin.',
    'Uzun metinli sorularda adım adım çözüm stratejisi kullanın.',
  ],
  supportDistribution: [
    { label: 'Odak desteği', count: 2, percentage: 17 },
    { label: 'Okuma desteği', count: 3, percentage: 25 },
    { label: 'Adım adım destek', count: 3, percentage: 25 },
    { label: 'Ek pratik', count: 2, percentage: 17 },
    { label: 'Standart deneyim', count: 2, percentage: 16 },
  ],
  puqAiAgentFeed: [
    {
      id: 'feed-1',
      type: 'insight',
      title: 'Sınıf özeti',
      message:
        '6/A sınıfında ortalama %68 performans görülüyor. Ana fikir bulma konusunda ek tekrar faydalı olabilir.',
      source: 'Puq.ai ile oluşturuldu',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'feed-2',
      type: 'recommendation',
      title: 'Önerilen öğretim aksiyonu',
      message:
        'Paragraf sorularını 3 adımlı çözüm formatına bölerek kısa sınıf içi tekrar yapın.',
      source: 'Puq.ai ile oluşturuldu',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'feed-3',
      type: 'adaptation',
      title: 'Destek ve öğrenme özeti',
      message:
        '5 öğrenci için destek önerisi var. Kişiselleştirilmiş öğrenme modu önerileri değerlendirilebilir.',
      source: 'Puq.ai ile oluşturuldu',
      createdAt: new Date().toISOString(),
    },
  ],
  frontendHints: {
    recommendedActionsTarget: 'Öğretmen Aksiyon Planı',
    supportDistributionTarget: 'Öğrenme Destek Dağılımı',
    agentFeedTarget: 'AI Destekli Öneriler',
    settingsStatus: 'Yakında',
  },
  studentsNeedingSupport: [
    {
      studentId: 'stu-1',
      studentName: 'Deniz Yılmaz',
      lesson: 'Türkçe',
      topic: 'Paragrafta Anlam',
      reason: 'Cevap süresi arttı ve son quizde başarı oranı düştü.',
      suggestedAction:
        'Soruları kısa parçalara bölerek tekrar çalışması önerilir.',
      priority: 'high',
    },
    {
      studentId: 'stu-2',
      studentName: 'Elif Kaya',
      lesson: 'Türkçe',
      topic: 'Ana fikir bulma',
      reason: 'Uzun metinlerde hata oranı artıyor.',
      suggestedAction:
        'Daha büyük yazı, geniş satır aralığı ve sade metin önerilir.',
      priority: 'medium',
    },
    {
      studentId: 'stu-4',
      studentName: 'Can Öztürk',
      lesson: 'Türkçe',
      topic: 'Cümlede anlam',
      reason: 'Son quizde düşük performans ve tereddüt sinyalleri görüldü.',
      suggestedAction: '10 dakikalık kısa tekrar ve mini quiz önerilir.',
      priority: 'medium',
    },
  ],
  students: [
    {
      id: 'stu-1',
      name: 'Deniz Yılmaz',
      email: 'stu-1@school.local',
      lesson: 'Türkçe',
      topic: 'Paragrafta Anlam',
      reason: 'Cevap süresi arttı ve son quizde başarı oranı düştü.',
      suggestedDuration: 15,
      priority: 'high',
    },
    {
      id: 'stu-2',
      name: 'Elif Kaya',
      email: 'stu-2@school.local',
      lesson: 'Türkçe',
      topic: 'Ana fikir bulma',
      reason: 'Uzun metinlerde hata oranı artıyor.',
      suggestedDuration: 15,
      priority: 'medium',
    },
    {
      id: 'stu-4',
      name: 'Can Öztürk',
      email: 'stu-4@school.local',
      lesson: 'Türkçe',
      topic: 'Cümlede anlam',
      reason: 'Son quizde düşük performans görüldü.',
      suggestedDuration: 15,
      priority: 'medium',
    },
  ],
  weeklyReport: {
    workflowType: 'weekly_report',
    classSummary:
      'Bu hafta sınıf ortalaması %63’ten %68’e yükseldi. Ana fikir bulma konusu takip edilmeli.',
    progressTrend: 'improving',
    mostDifficultTopic: 'Ana fikir bulma',
    keyFindings: [
      '5 öğrenci destek ihtiyacı gösteriyor.',
      '4 öğrenci ileri seviye sorulara hazır.',
      'Ortalama cevap süresi sınıf takibi için izlenmeye devam edilmeli.',
    ],
    studentsNeedingSupportSummary: [
      'Deniz Yılmaz: Paragrafta Anlam konusunda ek desteğe ihtiyaç duyuyor.',
      'Elif Kaya: Ana fikir bulma konusunda sade metin ve tekrar önerilir.',
    ],
    recommendedTeacherActions: [
      'Gelecek derste 10 dakikalık ana fikir tekrarı yapılması önerilir.',
      'Kısa uygulama soruları ile pekiştirme yapılabilir.',
    ],
    nextWeekFocus: ['Ana fikir bulma', 'Problem çözme', 'Kısa tekrar etkinliği'],
  },
};
