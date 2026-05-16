import { TeacherInsightPromptInput } from './contracts/promptContracts';
/** Legacy Puq.ai teacher insight report — mevcut TeacherInsightReport JSON sözleşmesi */
export declare const TEACHER_INSIGHT_SYSTEM_PROMPT: string;
/** @deprecated Use TEACHER_INSIGHT_SYSTEM_PROMPT — backward-compatible alias */
export declare const TEACHER_REPORT_SYSTEM_PROMPT: string;
export declare function buildTeacherInsightUserPrompt(input: TeacherInsightPromptInput): string;
//# sourceMappingURL=teacherInsight.prompt.d.ts.map