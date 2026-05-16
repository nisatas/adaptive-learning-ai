# NeuroAdapt — Prompt Engineering

## Neden promptlar ayrı dosyalarda?

- Servisler iş mantığına odaklanır; prompt metinleri `backend/src/prompts/` altında modüler tutulur.
- Etik kurallar ve JSON sözleşmeleri tek yerde güncellenir.
- Puq.ai workflow promptları (`workflows/`) öğretmen dashboard akışlarından ayrılır.
- Test ve fallback yanıtları contract ile birlikte yönetilir.

## Dosya yapısı

| Dosya | Amaç |
|-------|------|
| `prompts/studentFeedback.prompt.ts` | Öğrenci dashboard kısa, kişisel feedback |
| `prompts/studentAnalysis.prompt.ts` | Öğrenci için detaylı analiz ve öneriler |
| `prompts/quizBehavior.prompt.ts` | Mouse/idle/focus gibi etkileşim sinyallerinin güvenli yorumu |
| `prompts/teacherDashboard.prompt.ts` | Sınıf özeti, destek/challenge öğrenciler, aksiyonlar |
| `prompts/teacherInsight.prompt.ts` | Mevcut öğretmen raporu (legacy JSON: summary, observations, …) |
| `prompts/workflows/meetPlanning.prompt.ts` | Meet Planla workflow |
| `prompts/workflows/supportPlan.prompt.ts` | Destek planı workflow |
| `prompts/workflows/weeklyReport.prompt.ts` | Haftalık sınıf raporu workflow |
| `prompts/contracts/promptContracts.ts` | TypeScript contract tipleri |
| `prompts/fallbackResponses.ts` | LLM başarısız olduğunda güvenli varsayılan JSON |
| `prompts/promptParsers.ts` | LLM JSON parse + contract merge |
| `services/aiPrompt.service.ts` | Prompt orchestration (Puq.ai çağrısı) |

## Student feedback prompt

Öğrenci adı, ders, konu ve skora göre kişiselleştirilmiş kısa metin üretir.

**Kurallar (özet):** Olumsuz etiket yok; tanı dili yok; mouse/idle/focus kesin dikkat yorumu değil; genel “daha çok çalış” cümlesi yasak.

**Output:** `studentGreeting`, `shortFeedback`, `motivationMessage`, `nextStep`, `focusTopic`, `confidence`

## Student analysis prompt

Backend metrikleri hesaplar; LLM pedagojik yorum ve `recommendedNextSteps` üretir.

**Output:** `studentSummary`, `performanceLevel`, `attentionSignal`, `difficultySignal`, `strengths`, `needsSupport`, `recommendedNextSteps`, `teacherNote`, `adaptiveUiSuggestion`, `confidence`

## Quiz behavior prompt

Etkileşim verilerini öğrenme süreci sinyali olarak yorumlar; teşhis dili kullanmaz.

**Output:** `interactionSummary`, `attentionSignal`, `engagementSignal`, `confidenceSignal`, `behaviorNotes`, `safeInterpretation`, `confidence`

## Teacher dashboard prompt

Sınıf geneli, destek gereken öğrenciler, challenge-ready listesi ve Puq.ai workflow önerileri.

**Workflow tipleri:** `meet_request`, `support_plan`, `weekly_report`

## Puq.ai workflow promptları

- **meetPlanning:** 15 dk görüşme gündemi, veli notu, öğretmen mesajı
- **supportPlan:** 3 adımlı çalışma planı (toplam 25–35 dk)
- **weeklyReport:** Haftalık trend, bulgular, gelecek hafta odağı

## JSON contract neden sabit?

Frontend ve dashboard bileşenleri belirli alan adlarına güvenir. Parser + fallback katmanı eksik veya hatalı LLM çıktısını contract’a oturtur; boş ekran riski azalır.

## Fallback neden gerekli?

- Puq.ai yapılandırması eksik olabilir
- Ağ/SSL hataları oluşabilir
- LLM geçersiz JSON dönebilir
- Etik filtre çıktıyı temizleyebilir

Her senaryoda `confidence: "low"` ve “Analiz sınırlı veriyle oluşturuldu” tarzı güvenli metinler kullanılır.

## Mouse tracking yorumu

Mouse hareketi, idle time, focus lost ve answer change count **kesin dikkat ölçümü değildir**. Yalnızca quiz sırasındaki **öğrenme etkileşim sinyali** olarak, diğer metriklerle birlikte temkinli yorumlanır.

## Tıbbi / psikolojik teşhis yasağı

DEHB, disleksi, anksiyete, bozukluk, tanı, teşhis ve benzeri ifadeler prompt kurallarında ve `sanitizeAiOutput` filtresinde yasaktır.

## Servis entegrasyonu

| Servis | Durum |
|--------|--------|
| `puqAi.service.ts` | `completePrompt()` + `teacherInsight.prompt` import |
| `aiPrompt.service.ts` | Tüm yeni promptlar için hazır orchestration |
| `teacherReport.service.ts` | Mevcut endpoint contract korunur (değişiklik yok) |
| `quiz.service.ts` | `studentMessage` → `generateStudentFeedback()`; `behaviorSignals` → `generateQuizBehaviorAnalysis()` |
| `teacher.service.ts` | `getTeacherDashboard()` → `generateTeacherDashboardAnalysis()` + static fallback |

Yeni AI özellikleri endpoint eklemeden önce `aiPromptService` üzerinden test edilebilir; HTTP response alan adları değiştirilmeden map edilmelidir.

## Kullanım örneği

```typescript
import { aiPromptService } from './services/aiPrompt.service';

const feedback = await aiPromptService.generateStudentFeedback({
  studentName: 'Ayşe',
  lesson: 'Matematik',
  topic: 'Kesirler',
  quizScore: 55,
  classAverage: 72,
  difficultySignal: 'high',
});
```
