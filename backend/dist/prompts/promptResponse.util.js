"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.extractJsonBlock = extractJsonBlock;
exports.tryParsePromptJson = tryParsePromptJson;
exports.asNonEmptyString = asNonEmptyString;
exports.asStringArray = asStringArray;
exports.asSignalLevel = asSignalLevel;
exports.asConfidence = asConfidence;
exports.mergeWithFallback = mergeWithFallback;
function extractJsonBlock(text) {
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
function tryParsePromptJson(content) {
    const jsonCandidate = extractJsonBlock(content);
    if (!jsonCandidate) {
        return null;
    }
    try {
        const parsed = JSON.parse(jsonCandidate);
        return parsed && typeof parsed === 'object' ? parsed : null;
    }
    catch {
        return null;
    }
}
function asNonEmptyString(value, fallback) {
    return typeof value === 'string' && value.trim().length > 0
        ? value.trim()
        : fallback;
}
function asStringArray(value, fallback) {
    if (!Array.isArray(value)) {
        return fallback;
    }
    const items = value.filter((item) => typeof item === 'string' && item.trim().length > 0);
    return items.length > 0 ? items : fallback;
}
function asSignalLevel(value, fallback) {
    if (value === 'low' || value === 'medium' || value === 'high') {
        return value;
    }
    return fallback;
}
function asConfidence(value, fallback = 'low') {
    if (value === 'low' || value === 'medium' || value === 'high') {
        return value;
    }
    return fallback;
}
function mergeWithFallback(parsed, fallback, merge) {
    if (!parsed) {
        return fallback;
    }
    return merge(parsed, fallback);
}
//# sourceMappingURL=promptResponse.util.js.map