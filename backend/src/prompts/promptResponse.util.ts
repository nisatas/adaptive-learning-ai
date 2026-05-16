import { ConfidenceLevel } from './contracts/promptContracts';

export function extractJsonBlock(text: string): string | null {
  const trimmed = text.trim();
  if (trimmed.startsWith('{')) {
    return trimmed;
  }
  const start = trimmed.indexOf('{');
  const end = trimmed.lastIndexOf('}');
  if (start === -1 || end === -1 || end <= start) {
    return null;
  }
  return trimmed.slice(start, end + 1);
}

export function tryParsePromptJson<T extends object>(
  content: string
): Partial<T> | null {
  const jsonCandidate = extractJsonBlock(content);
  if (!jsonCandidate) {
    return null;
  }

  try {
    const parsed = JSON.parse(jsonCandidate) as Partial<T>;
    return parsed && typeof parsed === 'object' ? parsed : null;
  } catch {
    return null;
  }
}

export function asNonEmptyString(
  value: unknown,
  fallback: string
): string {
  return typeof value === 'string' && value.trim().length > 0
    ? value.trim()
    : fallback;
}

export function asStringArray(
  value: unknown,
  fallback: string[]
): string[] {
  if (!Array.isArray(value)) {
    return fallback;
  }
  const items = value.filter(
    (item): item is string => typeof item === 'string' && item.trim().length > 0
  );
  return items.length > 0 ? items : fallback;
}

export function asSignalLevel(
  value: unknown,
  fallback: 'low' | 'medium' | 'high'
): 'low' | 'medium' | 'high' {
  if (value === 'low' || value === 'medium' || value === 'high') {
    return value;
  }
  return fallback;
}

export function asConfidence(
  value: unknown,
  fallback: ConfidenceLevel = 'low'
): ConfidenceLevel {
  if (value === 'low' || value === 'medium' || value === 'high') {
    return value;
  }
  return fallback;
}

export function mergeWithFallback<T extends object>(
  parsed: Partial<T> | null,
  fallback: T,
  merge: (partial: Partial<T>, base: T) => T
): T {
  if (!parsed) {
    return fallback;
  }
  return merge(parsed, fallback);
}
