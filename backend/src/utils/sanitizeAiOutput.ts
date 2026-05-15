const FORBIDDEN_TERMS = [
  'dehb',
  'adhd',
  'disleksi',
  'dyslexia',
  'bozukluk',
  'tanı',
  'teshis',
  'teşhis',
  'riskli öğrenci',
  'dikkat bozukluğu',
  'öğrenme bozukluğu',
  'engelli',
  'isteksiz',
  'dikkatsiz',
  'motivasyonsuz',
  'problemli',
  'zayıf öğrenci',
  'zayıf',
  'başarısız öğrenci',
  'başarısız',
  'tembel',
  'motivasyonu düşük',
  'ilgisiz',
];

export function normalizeForSafetyCheck(text: string): string {
  return text.toLocaleLowerCase('tr-TR');
}

export function containsForbiddenTerms(text: string): boolean {
  const normalized = normalizeForSafetyCheck(text);
  return FORBIDDEN_TERMS.some((term) => normalized.includes(term));
}

export interface SanitizeResult {
  text: string;
  wasSanitized: boolean;
}

/**
 * Puq.ai veya fallback metnini etik dil filtresinden geçirir.
 * Yasaklı terim varsa güvenli metin döner.
 */
export function sanitizeAiOutput(
  text: string,
  safeFallback: string
): SanitizeResult {
  if (!text || containsForbiddenTerms(text)) {
    return { text: safeFallback, wasSanitized: true };
  }
  return { text, wasSanitized: false };
}

export function sanitizeInsightParts(
  parts: { summary: string; observations: string[]; recommendations: string[] },
  safeFallback: string
): {
  summary: string;
  observations: string[];
  recommendations: string[];
  wasSanitized: boolean;
} {
  const combined = [
    parts.summary,
    ...parts.observations,
    ...parts.recommendations,
  ].join(' ');

  if (!containsForbiddenTerms(combined)) {
    return { ...parts, wasSanitized: false };
  }

  return {
    summary: safeFallback,
    observations: [],
    recommendations: [],
    wasSanitized: true,
  };
}
