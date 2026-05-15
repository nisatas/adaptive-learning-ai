import {
  Question,
  Quiz,
  Student,
  TeacherStudentListItem,
} from '../types';

/**
 * Soru bankası — ekip arkadaşınız yalnızca bu diziyi düzenleyerek
 * soruları güncelleyebilir. correctOptionId yalnızca backend içindir.
 */
export const TURKCE_QUESTIONS: Question[] = [
  // --- Sözcükte anlam (q1–q3) ---
  {
    questionId: 'q1',
    questionText: '[Placeholder] "Mutlu" kelimesinin eş anlamlısı hangisidir?',
    topic: 'Sözcükte anlam',
    options: [
      { id: 'a', text: 'Üzgün' },
      { id: 'b', text: 'Sevinçli' },
      { id: 'c', text: 'Yorgun' },
      { id: 'd', text: 'Kızgın' },
    ],
    correctOptionId: 'b',
    difficulty: 'easy',
  },
  {
    questionId: 'q2',
    questionText: '[Placeholder] "Hızlı" kelimesinin zıt anlamlısı hangisidir?',
    topic: 'Sözcükte anlam',
    options: [
      { id: 'a', text: 'Yavaş' },
      { id: 'b', text: 'Çabuk' },
      { id: 'c', text: 'Ani' },
      { id: 'd', text: 'Koşarak' },
    ],
    correctOptionId: 'a',
    difficulty: 'easy',
  },
  {
    questionId: 'q3',
    questionText: '[Placeholder] "Göz" kelimesi hangi cümlede mecaz anlamda kullanılmıştır?',
    topic: 'Sözcükte anlam',
    options: [
      { id: 'a', text: 'Gözlerini kırptı.' },
      { id: 'b', text: 'Şehrin gözü kulağı kesildi.' },
      { id: 'c', text: 'Mavi gözlü bir çocuktu.' },
      { id: 'd', text: 'Göz doktoruna gitti.' },
    ],
    correctOptionId: 'b',
    difficulty: 'medium',
  },
  // --- Cümlede anlam (q4–q6) ---
  {
    questionId: 'q4',
    questionText: '[Placeholder] "Güneş doğudan doğar." cümlesinde özne hangisidir?',
    topic: 'Cümlede anlam',
    options: [
      { id: 'a', text: 'doğudan' },
      { id: 'b', text: 'doğar' },
      { id: 'c', text: 'Güneş' },
      { id: 'd', text: 'doğu' },
    ],
    correctOptionId: 'c',
    difficulty: 'medium',
  },
  {
    questionId: 'q5',
    questionText: '[Placeholder] Aşağıdaki cümlelerden hangisi soru cümlesidir?',
    topic: 'Cümlede anlam',
    options: [
      { id: 'a', text: 'Bugün hava çok güzel.' },
      { id: 'b', text: 'Yarın sinemaya gideceğiz.' },
      { id: 'c', text: 'Ödevini bitirdin mi?' },
      { id: 'd', text: 'Kitabı masaya koydu.' },
    ],
    correctOptionId: 'c',
    difficulty: 'easy',
  },
  {
    questionId: 'q6',
    questionText: '[Placeholder] "Ali okula gitti." cümlesinde yüklem hangisidir?',
    topic: 'Cümlede anlam',
    options: [
      { id: 'a', text: 'Ali' },
      { id: 'b', text: 'okula' },
      { id: 'c', text: 'gitti' },
      { id: 'd', text: 'okul' },
    ],
    correctOptionId: 'c',
    difficulty: 'medium',
  },
  // --- Paragrafta anlam (q7–q9) ---
  {
    questionId: 'q7',
    questionText: '[Placeholder] Paragrafın ana düşüncesini bulmak için ne yapılır?',
    topic: 'Paragrafta anlam',
    options: [
      { id: 'a', text: 'Yalnızca ilk cümleye bakılır' },
      { id: 'b', text: 'Metnin tamamı dikkatle okunur' },
      { id: 'c', text: 'Son cümle silinir' },
      { id: 'd', text: 'Başlık yazılmaz' },
    ],
    correctOptionId: 'b',
    difficulty: 'easy',
  },
  {
    questionId: 'q8',
    questionText: '[Placeholder] "Bu metinde yazarın asıl amacı okuyucuyu bilgilendirmektir." ifadesi hangi soruya yanıt verir?',
    topic: 'Paragrafta anlam',
    options: [
      { id: 'a', text: 'Kaç kelime var?' },
      { id: 'b', text: 'Metnin türü nedir?' },
      { id: 'c', text: 'Yazar ne anlatmak istiyor?' },
      { id: 'd', text: 'Kaç paragraf var?' },
    ],
    correctOptionId: 'c',
    difficulty: 'medium',
  },
  {
    questionId: 'q9',
    questionText: '[Placeholder] Paragrafta anlam bütünlüğü için hangisi önemlidir?',
    topic: 'Paragrafta anlam',
    options: [
      { id: 'a', text: 'Cümleler arası mantık bağı' },
      { id: 'b', text: 'Rastgele kelime seçimi' },
      { id: 'c', text: 'Noktalama işaretlerini silmek' },
      { id: 'd', text: 'Konuyu değiştirmek' },
    ],
    correctOptionId: 'a',
    difficulty: 'hard',
  },
  // --- Yazım kuralları (q10–q12) ---
  {
    questionId: 'q10',
    questionText: '[Placeholder] Aşağıdaki cümlelerden hangisinde yazım yanlışı vardır?',
    topic: 'Yazım kuralları',
    options: [
      { id: 'a', text: 'Her sabah erken kalkarım.' },
      { id: 'b', text: 'Bir çok kitap okudum.' },
      { id: 'c', text: 'Okula yürüyerek gittim.' },
      { id: 'd', text: 'Akşam yemeği hazırladım.' },
    ],
    correctOptionId: 'b',
    difficulty: 'medium',
  },
  {
    questionId: 'q11',
    questionText: '[Placeholder] Hangi cümlede "de" bağlacı yanlış yazılmıştır?',
    topic: 'Yazım kuralları',
    options: [
      { id: 'a', text: 'Sen de gel.' },
      { id: 'b', text: 'Evde kaldım.' },
      { id: 'c', text: 'Bende kalem var.' },
      { id: 'd', text: 'Okulda ders var.' },
    ],
    correctOptionId: 'c',
    difficulty: 'medium',
  },
  {
    questionId: 'q12',
    questionText: '[Placeholder] "Hiç bir" ifadesi nasıl yazılmalıdır?',
    topic: 'Yazım kuralları',
    options: [
      { id: 'a', text: 'Hiçbir' },
      { id: 'b', text: 'Hiç bir' },
      { id: 'c', text: 'Hiç-bir' },
      { id: 'd', text: 'HiçBir' },
    ],
    correctOptionId: 'a',
    difficulty: 'easy',
  },
  // --- Noktalama işaretleri (q13–q15) ---
  {
    questionId: 'q13',
    questionText: '[Placeholder] Hangi cümlede noktalama işareti doğru kullanılmıştır?',
    topic: 'Noktalama işaretleri',
    options: [
      { id: 'a', text: 'Merhaba nasılsın.' },
      { id: 'b', text: 'Merhaba, nasılsın?' },
      { id: 'c', text: 'Merhaba nasılsın,' },
      { id: 'd', text: 'Merhaba? nasılsın' },
    ],
    correctOptionId: 'b',
    difficulty: 'easy',
  },
  {
    questionId: 'q14',
    questionText: '[Placeholder] "Ali geldi mi" cümlesinin sonuna hangi işaret gelmelidir?',
    topic: 'Noktalama işaretleri',
    options: [
      { id: 'a', text: '.' },
      { id: 'b', text: ',' },
      { id: 'c', text: '?' },
      { id: 'd', text: '!' },
    ],
    correctOptionId: 'c',
    difficulty: 'easy',
  },
  {
    questionId: 'q15',
    questionText: '[Placeholder] Virgül hangi durumda kullanılır?',
    topic: 'Noktalama işaretleri',
    options: [
      { id: 'a', text: 'Cümle sonunda' },
      { id: 'b', text: 'Sıralı öğeleri ayırmak için' },
      { id: 'c', text: 'Soru sormak için' },
      { id: 'd', text: 'Ünlem belirtmek için' },
    ],
    correctOptionId: 'b',
    difficulty: 'medium',
  },
];

export const demoQuiz: Quiz = {
  quizId: 'quiz-demo-turkce-6',
  lesson: 'Türkçe',
  gradeLevel: 6,
  topic: '6. Sınıf Türkçe',
  questions: TURKCE_QUESTIONS,
};

export const TOTAL_QUESTIONS = demoQuiz.questions.length;

export const demoStudent: Student = {
  studentId: 'stu-1',
  name: 'Ayşe Yılmaz',
  className: '6/A',
};

/** Öğretmen tablosu için mock öğrenci profilleri (submit öncesi varsayılan) */
export const mockStudentProfiles: Array<
  Student & Omit<TeacherStudentListItem, 'studentId' | 'studentName'>
> = [
  {
    studentId: 'stu-1',
    name: 'Ayşe Yılmaz',
    className: '6/A',
    score: 53,
    averageTimeSeconds: 23,
    mostDifficultTopic: 'Yazım kuralları',
    supportSummary: 'Adım adım tekrar önerilir.',
    personalizationStatus: 'Kişiselleştirilmiş görünüm hazır.',
  },
  {
    studentId: 'stu-2',
    name: 'Mehmet Demir',
    className: '6/A',
    score: 86,
    averageTimeSeconds: 19,
    mostDifficultTopic: 'Paragrafta anlam',
    supportSummary: 'Ek pratik ve ileri seviye çalışma önerilir.',
    personalizationStatus: 'Ek pratik görünümü hazır.',
  },
  {
    studentId: 'stu-3',
    name: 'Zeynep Kaya',
    className: '6/A',
    score: 72,
    averageTimeSeconds: 25,
    mostDifficultTopic: 'Sözcükte anlam',
    supportSummary: 'Kısa tekrar ve örnek cümle çalışması önerilir.',
    personalizationStatus: 'Kişiselleştirilmiş görünüm hazır.',
  },
  {
    studentId: 'stu-4',
    name: 'Can Öztürk',
    className: '6/A',
    score: 64,
    averageTimeSeconds: 28,
    mostDifficultTopic: 'Cümlede anlam',
    supportSummary: 'Adım adım tekrar önerilir.',
    personalizationStatus: 'Kişiselleştirilmiş görünüm hazır.',
  },
  {
    studentId: 'stu-5',
    name: 'Elif Arslan',
    className: '6/A',
    score: 78,
    averageTimeSeconds: 22,
    mostDifficultTopic: 'Noktalama işaretleri',
    supportSummary: 'Konu pekiştirme çalışması önerilir.',
    personalizationStatus: 'Kişiselleştirilmiş görünüm hazır.',
  },
  {
    studentId: 'stu-6',
    name: 'Burak Şahin',
    className: '6/A',
    score: 45,
    averageTimeSeconds: 31,
    mostDifficultTopic: 'Paragrafta anlam',
    supportSummary: 'Adım adım tekrar önerilir.',
    personalizationStatus: 'Kişiselleştirilmiş görünüm hazır.',
  },
  {
    studentId: 'stu-7',
    name: 'Selin Aydın',
    className: '6/A',
    score: 91,
    averageTimeSeconds: 17,
    mostDifficultTopic: 'Sözcükte anlam',
    supportSummary: 'Ek pratik ve ileri seviye çalışma önerilir.',
    personalizationStatus: 'Ek pratik görünümü hazır.',
  },
  {
    studentId: 'stu-8',
    name: 'Emre Çelik',
    className: '6/A',
    score: 58,
    averageTimeSeconds: 26,
    mostDifficultTopic: 'Yazım kuralları',
    supportSummary: 'Adım adım tekrar önerilir.',
    personalizationStatus: 'Kişiselleştirilmiş görünüm hazır.',
  },
  {
    studentId: 'stu-9',
    name: 'Deniz Yıldız',
    className: '6/A',
    score: 82,
    averageTimeSeconds: 20,
    mostDifficultTopic: 'Cümlede anlam',
    supportSummary: 'Ek pratik ve ileri seviye çalışma önerilir.',
    personalizationStatus: 'Ek pratik görünümü hazır.',
  },
  {
    studentId: 'stu-10',
    name: 'Merve Koç',
    className: '6/A',
    score: 67,
    averageTimeSeconds: 24,
    mostDifficultTopic: 'Noktalama işaretleri',
    supportSummary: 'Kısa tekrar önerilir.',
    personalizationStatus: 'Kişiselleştirilmiş görünüm hazır.',
  },
  {
    studentId: 'stu-11',
    name: 'Kerem Polat',
    className: '6/A',
    score: 74,
    averageTimeSeconds: 21,
    mostDifficultTopic: 'Paragrafta anlam',
    supportSummary: 'Konu pekiştirme çalışması önerilir.',
    personalizationStatus: 'Kişiselleştirilmiş görünüm hazır.',
  },
  {
    studentId: 'stu-12',
    name: 'Sude Acar',
    className: '6/A',
    score: 88,
    averageTimeSeconds: 18,
    mostDifficultTopic: 'Yazım kuralları',
    supportSummary: 'Ek pratik ve ileri seviye çalışma önerilir.',
    personalizationStatus: 'Ek pratik görünümü hazır.',
  },
];

export const CLASS_META = {
  className: '6/A',
  lesson: 'Türkçe',
  topic: '6. Sınıf Türkçe',
  studentCount: mockStudentProfiles.length,
  classAverage: 68,
  averageResponseTime: 27,
  supportSuggestedCount: 5,
  challengeReadyCount: 2,
  mostDifficultTopic: 'Yazım kuralları',
};
