import { SupportProfile } from '../models/learning-mode';
import { buildUiSettingsForProfile } from './learning-theme';

const READING_TOPIC_MARKERS = [
  'paragrafın konusu',
  'ana fikir',
  'yardımcı fikir',
  'anahtar kelime',
  'paragraftan sonuç',
  'paragraf',
];

function isReadingTopic(topic: string): boolean {
  const t = topic.toLowerCase();
  return READING_TOPIC_MARKERS.some((m) => t.includes(m));
}

export interface ClientAnswerDetail {
  topic: string;
  isCorrect: boolean;
  timeSpentSeconds: number;
}

export function resolveClientSupportProfile(
  score: number,
  answers: ClientAnswerDetail[],
): SupportProfile {
  if (score >= 70) {
    return null;
  }

  let readingErrors = 0;
  let fastWrong = 0;
  let veryFastWrong = 0;
  let longHesitations = 0;
  let consecutiveFastWrong = 0;
  let maxConsecutiveFastWrong = 0;
  let totalTime = 0;

  for (const a of answers) {
    totalTime += a.timeSpentSeconds;
    if (a.timeSpentSeconds >= 40) {
      longHesitations += 1;
    }
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

  const avgTime = answers.length ? totalTime / answers.length : 0;
  const times = answers.map((a) => a.timeSpentSeconds);
  const mean = times.length
    ? times.reduce((s, t) => s + t, 0) / times.length
    : 0;
  const variance = times.length
    ? times.reduce((s, t) => s + Math.pow(t - mean, 2), 0) / times.length
    : 0;
  const volatileTime = variance > 60;
  const wrongCount = answers.filter((a) => !a.isCorrect).length;

  const focusScore =
    fastWrong + veryFastWrong * 2 + (maxConsecutiveFastWrong >= 2 ? 2 : 0) + (volatileTime ? 2 : 0);

  let readingScore =
    readingErrors * 2 + longHesitations + (avgTime > 25 && wrongCount >= 2 ? 1 : 0);

  if (avgTime > 30) {
    readingScore += 1;
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

export function buildFallbackSubmitState(score: number, answers: ClientAnswerDetail[]) {
  const personalized = score < 70;
  const support = personalized
    ? resolveClientSupportProfile(score, answers)
    : null;

  return {
    learningMode: personalized ? ('PERSONALIZED' as const) : ('STANDARD' as const),
    learningModeLabel: personalized
      ? 'Kişiselleştirilmiş Öğrenme Modu'
      : 'Standart Öğrenme Modu',
    supportProfile: support,
    recommendation: personalized
      ? support === 'reading_support'
        ? 'İçerikler artık daha okunabilir ve adım adım sunulacak.'
        : support === 'focus_support'
          ? 'İçerikler daha sade, adım adım ve odaklanmayı kolaylaştıracak şekilde sunulacak.'
          : 'İçerikler artık senin öğrenme hızına ve ihtiyaçlarına göre daha anlaşılır sunulacak.'
      : 'İçerikler standart akışla sunulmaya devam edecek.',
    uiSettings: buildUiSettingsForProfile(
      personalized ? 'PERSONALIZED' : 'STANDARD',
      support,
    ),
  };
}
