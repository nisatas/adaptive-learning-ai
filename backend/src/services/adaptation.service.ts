import {
  AdaptationResult,
  BehaviorSignals,
  BehaviorSignalsPublic,
  InternalLearningProfile,
  LearningMode,
  QuizSubmissionMeta,
  SupportProfile,
  UiSettings,
} from '../types';

const FAST_WRONG_THRESHOLD_SECONDS = 12;
const LONG_HESITATION_THRESHOLD_SECONDS = 40;

const READING_TOPIC_MARKERS = [
  'paragrafın konusu',
  'ana fikir',
  'yardımcı fikir',
  'anahtar kelime',
  'paragraftan sonuç',
  'paragraf',
];

const MODE_LABELS: Record<LearningMode, string> = {
  STANDARD: 'Standart Öğrenme Modu',
  PERSONALIZED: 'Kişiselleştirilmiş Öğrenme Modu',
};

export interface EvaluatedAnswer {
  questionId: string;
  selectedOptionId?: string;
  isCorrect: boolean;
  isSkipped: boolean;
  timeSpentSeconds: number;
  topic: string;
}

export function computeBehaviorSignals(answers: EvaluatedAnswer[]): BehaviorSignals {
  let fastWrongAnswers = 0;
  let longHesitations = 0;
  let skippedQuestions = 0;
  let totalTimeSeconds = 0;
  const slowQuestionIds: string[] = [];

  for (const answer of answers) {
    if (answer.isSkipped) {
      skippedQuestions += 1;
      continue;
    }

    totalTimeSeconds += answer.timeSpentSeconds;

    if (
      !answer.isCorrect &&
      answer.timeSpentSeconds <= FAST_WRONG_THRESHOLD_SECONDS
    ) {
      fastWrongAnswers += 1;
    }

    if (answer.timeSpentSeconds >= LONG_HESITATION_THRESHOLD_SECONDS) {
      longHesitations += 1;
      slowQuestionIds.push(answer.questionId);
    }
  }

  return {
    fastWrongAnswers,
    longHesitations,
    skippedQuestions,
    totalTimeSeconds,
    slowQuestionIds,
    hesitationCount: longHesitations,
  };
}

export function toPublicBehaviorSignals(
  signals: BehaviorSignals
): BehaviorSignalsPublic {
  return {
    fastWrongAnswers: signals.fastWrongAnswers,
    longHesitations: signals.longHesitations,
    skippedQuestions: signals.skippedQuestions,
    totalTimeSeconds: signals.totalTimeSeconds,
  };
}

function isReadingTopic(topic: string): boolean {
  const t = topic.toLowerCase();
  return READING_TOPIC_MARKERS.some((m) => t.includes(m));
}

function resolveLearningMode(score: number): LearningMode {
  return score >= 70 ? 'STANDARD' : 'PERSONALIZED';
}

function resolveSupportProfile(
  score: number,
  signals: BehaviorSignals,
  wrongCount: number,
  averageTimeSeconds: number,
  meta?: QuizSubmissionMeta,
): SupportProfile {
  if (score >= 70) {
    return null;
  }

  let readingErrors = 0;
  let fastWrong = 0;
  let veryFastWrong = 0;
  let volatileTime = false;
  let consecutiveFastWrong = 0;
  let maxConsecutiveFastWrong = 0;

  if (meta?.answerDetails?.length) {
    const times = meta.answerDetails.map((a) => a.timeSpentSeconds);
    const avg = times.reduce((s, t) => s + t, 0) / times.length;
    const variance =
      times.reduce((s, t) => s + Math.pow(t - avg, 2), 0) / times.length;
    volatileTime = variance > 60;

    for (const a of meta.answerDetails) {
      const isFastWrong = !a.isCorrect && a.timeSpentSeconds < 8;
      if (isFastWrong) {
        fastWrong += 1;
        consecutiveFastWrong += 1;
        maxConsecutiveFastWrong = Math.max(
          maxConsecutiveFastWrong,
          consecutiveFastWrong,
        );
        if (a.timeSpentSeconds < 5) {
          veryFastWrong += 1;
        }
      } else {
        consecutiveFastWrong = 0;
      }

      if (!a.isCorrect && isReadingTopic(a.topic)) {
        readingErrors += 1;
      }
    }
  }

  const focusScore =
    signals.fastWrongAnswers +
    fastWrong +
    veryFastWrong * 2 +
    (maxConsecutiveFastWrong >= 2 ? 2 : 0) +
    (volatileTime ? 2 : 0) +
    (signals.skippedQuestions > 0 ? 1 : 0);

  let readingScore =
    readingErrors * 2 +
    signals.longHesitations +
    (averageTimeSeconds > 25 && wrongCount >= 2 ? 1 : 0);

  if (averageTimeSeconds > 30 && score < 70) {
    readingScore += 1;
  }
  if (signals.longHesitations >= 2 && wrongCount >= 2) {
    readingScore += 2;
  }

  if (readingScore >= 3 && focusScore < 3) {
    return 'reading_support';
  }
  if (focusScore >= 3 && readingScore < 3) {
    return 'focus_support';
  }
  if (readingScore >= 2 && focusScore >= 2) {
    return readingScore >= focusScore ? 'reading_support' : 'focus_support';
  }
  if (readingScore >= 2) {
    return 'reading_support';
  }
  if (focusScore >= 2) {
    return 'focus_support';
  }

  return 'balanced_support';
}

function mapInternalProfile(support: SupportProfile): InternalLearningProfile {
  switch (support) {
    case 'focus_support':
      return 'FOCUS_SUPPORT';
    case 'reading_support':
      return 'READING_FRIENDLY';
    case 'balanced_support':
      return 'BALANCED';
    default:
      return 'CHALLENGE_MODE';
  }
}

function buildUiSettings(
  mode: LearningMode,
  support: SupportProfile,
  score: number,
  signals: BehaviorSignals,
  wrongCount: number,
  averageTimeSeconds: number,
): UiSettings {
  if (mode === 'STANDARD') {
    if (score >= 85) {
      return {
        largerText: false,
        showHints: false,
        stepByStepMode: false,
        reduceDistractions: false,
        showProgressFocus: true,
        showChallengeQuestions: true,
        simplifiedLayout: false,
        increasedLineHeight: false,
        highlightKeywords: false,
      };
    }
    return {
      largerText: false,
      showHints: true,
      stepByStepMode: false,
      reduceDistractions: false,
      showProgressFocus: true,
      showChallengeQuestions: false,
      simplifiedLayout: false,
      increasedLineHeight: false,
      highlightKeywords: false,
    };
  }

  if (support === 'focus_support') {
    return {
      largerText: false,
      showHints: true,
      stepByStepMode: true,
      reduceDistractions: true,
      showProgressFocus: true,
      showChallengeQuestions: false,
      simplifiedLayout: true,
      increasedLineHeight: false,
      highlightKeywords: false,
    };
  }

  if (support === 'reading_support') {
    return {
      largerText: true,
      showHints: true,
      stepByStepMode: true,
      reduceDistractions: true,
      showProgressFocus: false,
      showChallengeQuestions: false,
      simplifiedLayout: false,
      increasedLineHeight: true,
      highlightKeywords: true,
    };
  }

  if (
    support === 'balanced_support' ||
    (averageTimeSeconds > 30 && score < 70)
  ) {
    return {
      largerText: true,
      showHints: true,
      stepByStepMode: true,
      reduceDistractions: true,
      showProgressFocus: true,
      showChallengeQuestions: false,
      simplifiedLayout: true,
      increasedLineHeight: true,
      highlightKeywords: true,
    };
  }

  if (signals.fastWrongAnswers >= 2) {
    return {
      largerText: false,
      showHints: true,
      stepByStepMode: false,
      reduceDistractions: true,
      showProgressFocus: true,
      showChallengeQuestions: false,
      simplifiedLayout: true,
      increasedLineHeight: false,
      highlightKeywords: false,
    };
  }

  return {
    largerText: wrongCount >= 2,
    showHints: true,
    stepByStepMode: score < 70,
    reduceDistractions: score < 70,
    showProgressFocus: true,
    showChallengeQuestions: false,
    simplifiedLayout: score < 70,
    increasedLineHeight: score < 70,
    highlightKeywords: score < 70,
  };
}

function buildRecommendation(mode: LearningMode, support: SupportProfile): string {
  if (mode === 'STANDARD') {
    return 'İçerikler standart akışla sunulmaya devam edecek.';
  }
  switch (support) {
    case 'reading_support':
      return 'İçerikler artık daha okunabilir ve adım adım sunulacak.';
    case 'focus_support':
      return 'İçerikler daha sade, adım adım ve odaklanmayı kolaylaştıracak şekilde sunulacak.';
    default:
      return 'İçerikler artık senin öğrenme hızına ve ihtiyaçlarına göre daha anlaşılır sunulacak.';
  }
}

function buildStudentMessage(mode: LearningMode, profile: InternalLearningProfile): string {
  if (mode === 'STANDARD') {
    if (profile === 'CHALLENGE_MODE') {
      return 'Quiz tamamlandı. Standart öğrenme akışıyla devam edebilirsin.';
    }
    return 'Quiz tamamlandı. Standart öğrenme akışıyla devam edebilirsin.';
  }
  return 'Quiz tamamlandı. Cevaplarına göre öğrenme deneyimin kişiselleştirildi. Artık içerikler daha anlaşılır, adım adım ve sana uygun şekilde sunulacak.';
}

export function determineAdaptation(
  score: number,
  wrongCount: number,
  averageTimeSeconds: number,
  signals: BehaviorSignals,
  meta?: QuizSubmissionMeta,
): AdaptationResult {
  const learningMode = resolveLearningMode(score);
  const supportProfile =
    learningMode === 'PERSONALIZED'
      ? resolveSupportProfile(
          score,
          signals,
          wrongCount,
          averageTimeSeconds,
          meta,
        )
      : null;
  const internalProfile =
    learningMode === 'STANDARD'
      ? score >= 85
        ? 'CHALLENGE_MODE'
        : 'BALANCED'
      : mapInternalProfile(supportProfile);
  const uiSettings = buildUiSettings(
    learningMode,
    supportProfile,
    score,
    signals,
    wrongCount,
    averageTimeSeconds,
  );
  const recommendation = buildRecommendation(learningMode, supportProfile);
  const studentMessage = buildStudentMessage(learningMode, internalProfile);

  return {
    internalProfile,
    uiSettings,
    studentMessage,
    learningMode,
    learningModeLabel: MODE_LABELS[learningMode],
    supportProfile,
    recommendation,
  };
}

export function buildSupportSummary(score: number): string {
  if (score >= 85) {
    return 'Ek pratik ve ileri seviye çalışma önerilir.';
  }
  if (score < 60) {
    return 'Adım adım tekrar önerilir.';
  }
  return 'Kısa tekrar ve örnek çalışma önerilir.';
}

export function buildPersonalizationStatus(profile: InternalLearningProfile): string {
  if (profile === 'CHALLENGE_MODE') {
    return 'Standart öğrenme akışı hazır.';
  }
  return 'Kişiselleştirilmiş öğrenme görünümü hazır.';
}
