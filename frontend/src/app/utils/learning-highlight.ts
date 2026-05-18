import { SupportProfile } from '../models/learning-mode';

/** Sarı kelime vurgusu — focus_support ve hafif balanced_support */
export function shouldHighlightKeywords(
  profile?: SupportProfile | null,
): boolean {
  return profile === 'focus_support' || profile === 'balanced_support';
}
