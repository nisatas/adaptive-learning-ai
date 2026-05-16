/**
 * Minimal contract test (Node built-in test runner).
 * Run: node --test backend/src/utils/sanitizeAiOutput.test.cjs
 * Requires: npm run build in backend first.
 */
const { describe, it } = require('node:test');
const assert = require('node:assert');
const path = require('path');

const {
  sanitizeAiOutput,
  containsForbiddenTerms,
} = require(path.join(__dirname, '../../dist/utils/sanitizeAiOutput.js'));

describe('sanitizeAiOutput', () => {
  it('replaces forbidden terms with safe fallback', () => {
    const result = sanitizeAiOutput('Bu öğrenci isteksiz görünüyor.', 'Güvenli metin.');
    assert.strictEqual(result.text, 'Güvenli metin.');
    assert.strictEqual(result.wasSanitized, true);
  });

  it('keeps safe pedagogical text', () => {
    const safe = 'Kısa tekrar ve örnek çözüm önerilir.';
    const result = sanitizeAiOutput(safe, 'Yedek');
    assert.strictEqual(result.text, safe);
    assert.strictEqual(result.wasSanitized, false);
  });

  it('detects diagnostic labels', () => {
    assert.strictEqual(containsForbiddenTerms('DEHB tanısı'), true);
  });
});
