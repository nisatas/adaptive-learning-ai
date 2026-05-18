import {
  AdaptiveLearningState,
  SupportProfile,
} from '../models/learning-mode';
import { UiSettings } from '../models/ui-settings';

export type DemoProfileKey = 'standard' | 'reading' | 'focus' | 'balanced';

export function parseDemoProfileParam(
  value: string | string[] | undefined,
): DemoProfileKey | null {
  const raw = Array.isArray(value) ? value[0] : value;
  if (
    raw === 'standard' ||
    raw === 'reading' ||
    raw === 'focus' ||
    raw === 'balanced'
  ) {
    return raw;
  }
  return null;
}

export function demoKeyToSupportProfile(
  key: DemoProfileKey,
): SupportProfile {
  switch (key) {
    case 'reading':
      return 'reading_support';
    case 'focus':
      return 'focus_support';
    case 'balanced':
      return 'balanced_support';
    default:
      return null;
  }
}

export function buildUiSettingsForProfile(
  mode: 'STANDARD' | 'PERSONALIZED',
  support: SupportProfile,
): UiSettings {
  if (mode === 'STANDARD') {
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

export function buildDemoAdaptiveState(key: DemoProfileKey): AdaptiveLearningState {
  if (key === 'standard') {
    return {
      learningMode: 'STANDARD',
      learningModeLabel: 'Standart Öğrenme Modu',
      supportProfile: null,
      recommendation: 'İçerikler standart akışla sunulmaya devam edecek.',
      uiSettings: buildUiSettingsForProfile('STANDARD', null),
    };
  }

  const support = demoKeyToSupportProfile(key);
  return {
    learningMode: 'PERSONALIZED',
    learningModeLabel: 'Kişiselleştirilmiş Öğrenme Modu',
    supportProfile: support,
    recommendation:
      'İçerikler artık senin öğrenme hızına ve ihtiyaçlarına göre daha anlaşılır sunulacak.',
    uiSettings: buildUiSettingsForProfile('PERSONALIZED', support),
  };
}

export function getSupportProfileClass(profile?: SupportProfile | null): string {
  if (!profile) {
    return '';
  }
  return `support-profile--${profile.replace(/_/g, '-')}`;
}

export function buildLearningThemeClasses(
  state: AdaptiveLearningState,
  extra?: Record<string, boolean>,
): Record<string, boolean> {
  const personalized =
    state.learningMode === 'PERSONALIZED' ||
    (!!state.uiSettings &&
      (state.uiSettings.largerText ||
        state.uiSettings.stepByStepMode ||
        state.uiSettings.reduceDistractions));

  const profile = state.supportProfile;

  return {
    'learning-theme--standard': !personalized,
    'learning-theme--personalized': personalized,
    [getSupportProfileClass(profile)]: !!profile,
    ...(extra ?? {}),
  };
}

/** Renk kodlu seçenekler (reading_support) */
export const READING_OPTION_COLORS = [
  { id: 'a', label: 'Kırmızı seçenek', class: 'option-color--red' },
  { id: 'b', label: 'Sarı seçenek', class: 'option-color--yellow' },
  { id: 'c', label: 'Mavi seçenek', class: 'option-color--blue' },
  { id: 'd', label: 'Yeşil seçenek', class: 'option-color--green' },
] as const;

export function getReadingOptionMeta(optionId: string) {
  return (
    READING_OPTION_COLORS.find((c) => c.id === optionId.toLowerCase()) ??
    READING_OPTION_COLORS[0]
  );
}
