export interface ParagrafQuizOption {
  id: string;
  text: string;
}

export interface ParagrafQuizQuestion {
  questionId: string;
  /** Backend submit için eşleşen soru kimliği (q7–q9) */
  submitQuestionId: string;
  paragraph: string;
  questionText: string;
  topic: string;
  options: ParagrafQuizOption[];
  correctOptionId: string;
  explanation: string;
  hint: string;
}

export interface ParagrafQuizData {
  quizId: string;
  lesson: string;
  topic: string;
  totalQuestions: number;
  questions: ParagrafQuizQuestion[];
}

export const PUQ_QUIZ_RECOMMENDATION =
  'Paragraf sorularında önce metnin ne anlattığını tek cümleyle düşün. Daha sonra seçenekleri bu cümleyle karşılaştır. En genel ve kapsayıcı seçenek çoğu zaman ana fikre daha yakındır.';

export const FALLBACK_PARAGRAF_QUIZ: ParagrafQuizData = {
  quizId: 'quiz-paragraf-demo',
  lesson: 'Türkçe',
  topic: 'Paragrafta Anlam',
  totalQuestions: 5,
  questions: [
    {
      questionId: 'pq-1',
      submitQuestionId: 'q7',
      paragraph:
        'İnsanlar birlikte çalıştıklarında daha büyük başarılar elde edebilir. Yardımlaşma ve dayanışma, toplumların gelişmesinde önemli bir rol oynar.',
      questionText: 'Bu paragrafın konusu aşağıdakilerden hangisidir?',
      topic: 'Paragrafın konusu',
      options: [
        { id: 'a', text: 'Bireysel çalışmanın zorlukları' },
        { id: 'b', text: 'Birlikte çalışmanın önemi' },
        { id: 'c', text: 'Toplumların tarihsel gelişimi' },
        { id: 'd', text: 'Eğitim sistemindeki değişimler' },
      ],
      correctOptionId: 'b',
      explanation:
        'Paragrafta yardımlaşma ve birlikte çalışma vurgulanır; konu birlikte çalışmanın önemidir.',
      hint: 'En çok tekrar eden kelimelere ve paragrafın genel mesajına bak.',
    },
    {
      questionId: 'pq-2',
      submitQuestionId: 'q8',
      paragraph:
        'Kitap okumak, kelime dağarcığını geliştirir ve düşünme becerilerini güçlendirir. Düzenli okuyan öğrenciler, yazılı anlatımda kendilerini daha iyi ifade edebilir.',
      questionText: 'Bu paragrafın ana fikri hangisidir?',
      topic: 'Ana fikir',
      options: [
        { id: 'a', text: 'Kitap okumak öğrenciye çok sayıda fayda sağlar.' },
        { id: 'b', text: 'Yazılı anlatım her zaman zordur.' },
        { id: 'c', text: 'Kelime dağarcığı yalnızca sözlü iletişimde önemlidir.' },
        { id: 'd', text: 'Öğrenciler düzenli okumayı sevmez.' },
      ],
      correctOptionId: 'a',
      explanation:
        'Ana fikir, kitap okumanın kelime dağarcığı ve düşünme becerilerine katkısıdır.',
      hint: 'Paragrafın tamamını kapsayan en genel cümleyi seç.',
    },
    {
      questionId: 'pq-3',
      submitQuestionId: 'q9',
      paragraph:
        'Doğayı korumak gelecek nesiller için büyük önem taşır. Ağaç dikmek, geri dönüşüm yapmak ve suyu tasarruflu kullanmak bu konuda atılabilecek basit adımlardır.',
      questionText: 'Aşağıdakilerden hangisi yardımcı fikirdir?',
      topic: 'Yardımcı fikir',
      options: [
        { id: 'a', text: 'Doğayı korumak gelecek nesiller için önemlidir.' },
        { id: 'b', text: 'Ağaç dikmek koruma için atılabilecek bir adımdır.' },
        { id: 'c', text: 'İnsanlar doğayı hiç önemsemez.' },
        { id: 'd', text: 'Gelecek nesiller doğayı bilmez.' },
      ],
      correctOptionId: 'b',
      explanation:
        'Ana fikir doğayı korumaktır; ağaç dikmek bu fikri destekleyen yardımcı bir örnektir.',
      hint: 'Ana fikri destekleyen, örnekleyen cümleyi bul.',
    },
    {
      questionId: 'pq-4',
      submitQuestionId: 'q7',
      paragraph:
        'Teknoloji eğitimde yeni fırsatlar sunar. Öğrenciler çevrim içi kaynaklarla konuları tekrar edebilir, interaktif etkinliklerle öğrenmeyi pekiştirebilir.',
      questionText: 'Paragraftaki anahtar kelimeler hangi seçenekte doğru verilmiştir?',
      topic: 'Anahtar kelime',
      options: [
        { id: 'a', text: 'öğrenci, sınav, not' },
        { id: 'b', text: 'teknoloji, eğitim, öğrenme' },
        { id: 'c', text: 'tatil, oyun, dinlenme' },
        { id: 'd', text: 'yemek, su, enerji' },
      ],
      correctOptionId: 'b',
      explanation:
        'Paragrafta teknoloji, eğitim ve öğrenme süreci en çok vurgulanan kavramlardır.',
      hint: 'Metinde en sık geçen ve konuyu taşıyan kelimeleri ara.',
    },
    {
      questionId: 'pq-5',
      submitQuestionId: 'q8',
      paragraph:
        'Düzenli tekrar yapmak, öğrenilen bilgilerin kalıcı olmasına yardımcı olur. Kısa aralıklarla tekrar eden öğrenciler, sınavlarda daha başarılı sonuçlar alabilir.',
      questionText: 'Bu paragraftan çıkarılabilecek sonuç hangisidir?',
      topic: 'Paragraftan sonuç çıkarma',
      options: [
        { id: 'a', text: 'Tekrar yapmak öğrenmeyi güçlendirebilir.' },
        { id: 'b', text: 'Sınavlar öğrenmeyi engeller.' },
        { id: 'c', text: 'Öğrenciler tekrar yapmamalıdır.' },
        { id: 'd', text: 'Bilgiler tekrar edilince unutulur.' },
      ],
      correctOptionId: 'a',
      explanation:
        'Paragraf, düzenli tekrarın öğrenmeye ve başarıya katkısını anlatır.',
      hint: 'Paragrafın verdiği mesajı tek cümleyle düşün, sonra seçeneklere bak.',
    },
  ],
};
