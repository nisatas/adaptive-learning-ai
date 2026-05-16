# Puq.ai Entegrasyon Planı

## Genel ilke

- Puq.ai yalnızca **backend** üzerinden çağrılır.
- API anahtarı `PUQ_AI_API_KEY` ortam değişkeninde saklanır; frontend'e asla konmaz.
- Sabit endpoint uydurulmaz; `PUQ_AI_CHAT_ENDPOINT` ile yapılandırılır.

## Ortam değişkenleri

| Değişken | Açıklama |
|----------|----------|
| `PUQ_AI_API_KEY` | API anahtarı |
| `PUQ_AI_BASE_URL` | Puq.ai base URL |
| `PUQ_AI_MODEL` | Kullanılacak model |
| `PUQ_AI_CHAT_ENDPOINT` | Chat/completion endpoint yolu |

## Kullanım alanı

Puq.ai, **öğretmen içgörü raporu** metnini üretmek / iyileştirmek için kullanılır:

- Girdi: quiz davranış özeti (doğru/yanlış, atlama, süre, tereddüt)
- Çıktı: pedagojik, etik, tanısız rapor metni

## Karar mimarisi

| Katman | Sorumluluk |
|--------|------------|
| Kural tabanlı motor | Öğrenme modu ve arayüz adaptasyonu kararı |
| Puq.ai | Rapor dilini zenginleştirme, gözlem önerileri |
| Fallback | Puq.ai yoksa veya hata varsa `fallbackTeacherReport` |

## Fallback

Puq.ai yapılandırılmamış veya istek başarısız olduğunda:

- `PuqAiService.generateTeacherInsightReport()` fallback raporu döner.
- Fallback metin tanı veya etiket içermez.

## Sonraki adımlar

1. Puq.ai resmi endpoint ve response şemasını doğrula.
2. `puqAi.service.ts` içindeki TODO'ları gerçek istek/parse ile güncelle.
3. `POST /api/teacher/insight` endpoint'ini ekle ve frontend öğretmen paneline bağla.
