import { StoredQuizResult, TeacherInsightInput } from '../types';
export { TEACHER_INSIGHT_SYSTEM_PROMPT, TEACHER_REPORT_SYSTEM_PROMPT, buildTeacherInsightUserPrompt, } from '../prompts/teacherInsight.prompt';
export declare function buildBehaviorObservation(source: StoredQuizResult | TeacherInsightInput): string;
export declare function buildSystemRecommendation(source: StoredQuizResult | TeacherInsightInput): string;
//# sourceMappingURL=teacherReportLanguage.d.ts.map