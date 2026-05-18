import { Pipe, PipeTransform, inject } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

/** Uzun ifadeler önce — yalnızca tam kelime / tam ifade eşleşmesi */
const KEYWORD_PHRASES = [
  'yardımcı fikir',
  'anahtar kelimeler',
  'anahtar kelime',
  'paragrafın konusunu',
  'paragrafın ana fikri',
  'paragrafın konusu',
  'ana fikri',
  'ana fikre',
  'ana fikir',
].sort((a, b) => b.length - a.length);

const TR_LETTERS = 'a-zA-ZğüşıöçĞÜŞİÖÇ';

@Pipe({
  name: 'highlightKeywords',
  standalone: true,
})
export class HighlightKeywordsPipe implements PipeTransform {
  private readonly sanitizer = inject(DomSanitizer);

  transform(value: string | null | undefined, enabled = false): SafeHtml | string {
    const text = value ?? '';
    if (!enabled || !text) {
      return text;
    }

    return this.sanitizer.bypassSecurityTrustHtml(highlightPhrases(text));
  }
}

interface TextRange {
  start: number;
  end: number;
}

function highlightPhrases(text: string): string {
  const ranges: TextRange[] = [];

  for (const phrase of KEYWORD_PHRASES) {
    const pattern = buildWholePhrasePattern(phrase);
    let match: RegExpExecArray | null;

    while ((match = pattern.exec(text)) !== null) {
      const start = match.index;
      const end = start + match[1].length;

      if (!hasOverlap(ranges, start, end)) {
        ranges.push({ start, end });
      }
    }
  }

  ranges.sort((a, b) => a.start - b.start);

  let html = '';
  let cursor = 0;

  for (const range of ranges) {
    html += escapeHtml(text.slice(cursor, range.start));
    html += `<span class="keyword-highlight">${escapeHtml(text.slice(range.start, range.end))}</span>`;
    cursor = range.end;
  }

  html += escapeHtml(text.slice(cursor));
  return html;
}

function buildWholePhrasePattern(phrase: string): RegExp {
  const escaped = escapeRegex(phrase);
  return new RegExp(
    `(?<![${TR_LETTERS}])(${escaped})(?![${TR_LETTERS}])`,
    'gi',
  );
}

function hasOverlap(ranges: TextRange[], start: number, end: number): boolean {
  return ranges.some((r) => start < r.end && end > r.start);
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function escapeRegex(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
