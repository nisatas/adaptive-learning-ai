import {
  AdaptationResult,
  BehaviorSignals,
  BehaviorSignalsPublic,
  InternalLearningProfile,
  UiSettings,
} from '../types';

const FAST_WRONG_THRESHOLD_SECONDS = 12;
const LONG_HESITATION_THRESHOLD_SECONDS = 40;

export function computeBehaviorSignals(
  answers: Array<{
    questionId: string;
    isCorrect: boolean;
    isSkipped: boolean;
    timeSpentSeconds: number;
  }>
): BehaviorSignals {
  let fastWrongAnswers = 0;
  let longHesitations = 0;
  let skippedQuestions = 0;
  let totalTimeSeconds = 0;
  const slowQuestionIds: string[] = [];

  for (const answer of answers) {
    if (answer.isSkipped) {
      skippedQuestions++;
      continue;
    }

    totalTimeSeconds += answer.timeSpentSeconds;

    if (
      !answer.isCorrect &&
      answer.timeSpentSeconds <= FAST_WRONG_THRESHOLD_SECONDS
    ) {
      fastWrongAnswers++;
    }

    if (answer.timeSpentSeconds >= LONG_HESITATION_THRESHOLD_SECONDS) {
      longHesitations++;
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

export function determineAdaptation(
  score: number,
  wrongCount: number,
  averageTimeSeconds: number,
  signals: BehaviorSignals
): AdaptationResult {
  let internalProfile: InternalLearningProfile = 'BALANCED';
  let uiSettings: UiSettings;

  if (signals.fastWrongAnswers >= 2) {
    internalProfile = 'FOCUS_SUPPORT';
    uiSettings = {
      largerText: false,
      showHints: true,
      stepByStepMode: false,
      reduceDistractions: true,
      showProgressFocus: true,
      showChallengeQuestions: false,
    };
  } else if (averageTimeSeconds > 30 && score < 70) {
    internalProfile = 'STEP_BY_STEP';
    uiSettings = {
      largerText: true,
      showHints: true,
      stepByStepMode: true,
      reduceDistractions: true,
      showProgressFocus: true,
      showChallengeQuestions: false,
    };
  } else if (signals.longHesitations >= 3 && wrongCount >= 2) {
    internalProfile = 'READING_FRIENDLY';
    uiSettings = {
      largerText: true,
      showHints: true,
      stepByStepMode: true,
      reduceDistractions: true,
      showProgressFocus: false,
      showChallengeQuestions: false,
    };
  } else if (score >= 85) {
    internalProfile = 'CHALLENGE_MODE';
    uiSettings = {
      largerText: false,
      showHints: false,
      stepByStepMode: false,
      reduceDistractions: false,
      showProgressFocus: true,
      showChallengeQuestions: true,
    };
  } else {
    internalProfile = 'BALANCED';
    uiSettings = {
      largerText: false,
      showHints: true,
      stepByStepMode: false,
      reduceDistractions: false,
      showProgressFocus: true,
      showChallengeQuestions: false,
    };
  }

  const studentMessage = buildStudentMessage(internalProfile);

  return { internalProfile, uiSettings, studentMessage };
}

function buildStudentMessage(profile: InternalLearningProfile): string {
  switch (profile) {
    case 'CHALLENGE_MODE':
      return 'Ek pratik görünümü hazır.';
    default:
      return 'Kişiselleştirilmiş öğrenme görünümü hazır.';
  }
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

export function buildPersonalizationStatus(
  profile: InternalLearningProfile
): string {
  if (profile === 'CHALLENGE_MODE') {
    return 'Ek pratik görünümü hazır.';
  }
  return 'Kişiselleştirilmiş görünüm hazır.';
}
