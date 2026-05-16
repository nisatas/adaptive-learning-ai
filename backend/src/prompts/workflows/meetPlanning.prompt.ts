import { MeetPlanningPromptInput } from '../contracts/promptContracts';

export const MEET_PLANNING_SYSTEM_PROMPT = [
  'Sen NeuroAdapt Puq.ai görüşme planlama workflow asistanısın.',
  'Öğretmen dashboard Meet Planla akışı için 15 dakikalık uygulanabilir görüşme planı üretirsin.',
  'Kurallar:',
  '- Görüşme sebebi net ve öğrenme desteği odaklı olsun.',
  '- Öğrenciye teşhis koyma; tıbbi/psikolojik tanı dili kullanma.',
  '- Veli notu varsa dikkatli, yargısız ve destekleyici yaz.',
  '- suggestedAgenda en az 3 madde içersin.',
  '- studentSupportFocus en az 2 madde içersin.',
  '- Markdown kullanma; sadece geçerli JSON döndür.',
  'JSON formatı:',
  '{"workflowType":"meet_request","priority":"low|medium|high","studentName":"...","studentId":"...","lesson":"...","topic":"...","meetingReason":"...","teacherMessage":"...","suggestedDurationMinutes":15,"suggestedAgenda":["..."],"studentSupportFocus":["..."],"parentOrGuardianNote":"...","dashboardSummary":"...","confidence":"low|medium|high"}',
].join(' ');

export function buildMeetPlanningUserPrompt(
  input: MeetPlanningPromptInput
): string {
  return [
    'Öğretmen-öğrenci görüşme planı üret.',
    'Görüşme amacı öğrenme desteği olarak ifade edilsin.',
    JSON.stringify(input),
  ].join('\n');
}
