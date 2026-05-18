import { UiSettings } from './ui-settings';

export type LearningMode = 'STANDARD' | 'PERSONALIZED';

export type SupportProfile =
  | 'focus_support'
  | 'reading_support'
  | 'balanced_support'
  | null;

export interface AdaptiveLearningState {
  learningMode?: LearningMode;
  learningModeLabel?: string;
  supportProfile?: SupportProfile;
  recommendation?: string;
  uiSettings?: UiSettings;
}

export const ADAPTIVE_LEARNING_STORAGE_KEY = 'adaptiveLearningState';

export function isPersonalizedMode(state: AdaptiveLearningState): boolean {
  if (state.learningMode === 'PERSONALIZED') {
    return true;
  }
  if (state.learningMode === 'STANDARD') {
    return false;
  }
  const settings = state.uiSettings;
  if (!settings) {
    return false;
  }
  return (
    settings.largerText ||
    settings.stepByStepMode ||
    settings.reduceDistractions ||
    settings.simplifiedLayout === true ||
    settings.increasedLineHeight === true ||
    settings.showHints
  );
}

export function getLearningModeLabel(state: AdaptiveLearningState): string {
  if (state.learningModeLabel) {
    return state.learningModeLabel;
  }
  return isPersonalizedMode(state)
    ? 'Kişiselleştirilmiş Öğrenme Modu'
    : 'Standart Öğrenme Modu';
}

export function getLearningModeDescription(state: AdaptiveLearningState): string {
  return isPersonalizedMode(state)
    ? 'İçerikler öğrencinin öğrenme sürecindeki ihtiyaçlarına göre daha okunabilir, sade, adım adım ve odaklanmayı kolaylaştıracak şekilde sunulur.'
    : 'Öğrenci standart arayüz ve normal içerik akışıyla devam eder.';
}

export function getSupportProfileClass(
  profile?: SupportProfile | null,
): string {
  if (!profile) {
    return '';
  }
  return `support-profile--${profile.replace(/_/g, '-')}`;
}

export function loadAdaptiveLearningState(): AdaptiveLearningState | null {
  try {
    const raw = localStorage.getItem(ADAPTIVE_LEARNING_STORAGE_KEY);
    if (!raw) {
      return null;
    }
    return JSON.parse(raw) as AdaptiveLearningState;
  } catch {
    return null;
  }
}

export function saveAdaptiveLearningState(state: AdaptiveLearningState): void {
  localStorage.setItem(ADAPTIVE_LEARNING_STORAGE_KEY, JSON.stringify(state));
}
