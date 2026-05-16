# API Contract

Base URL: `http://localhost:4000/api`

## GET /health

**Açıklama:** Backend sağlık kontrolü.

**Response 200:**

```json
{
  "status": "ok",
  "message": "NeuroAdapt backend is running"
}
```

---

## GET /ai/status

**Açıklama:** Puq.ai ortam değişkenlerinin yapılandırılıp yapılandırılmadığını kontrol eder. API anahtarı asla döndürülmez.

**Response 200 (yapılandırılmış):**

```json
{
  "provider": "Puq.ai",
  "configured": true,
  "message": "Puq.ai configuration is available"
}
```

**Response 200 (eksik yapılandırma):**

```json
{
  "provider": "Puq.ai",
  "configured": false,
  "message": "Puq.ai configuration is missing. Please check environment variables."
}
```

---

## Gelecek endpoint'ler (plan)

| Method | Path | Açıklama |
|--------|------|----------|
| POST | `/quiz/submit` | Quiz davranış verisi gönderimi |
| POST | `/adaptation/personalize` | Öğrenci arayüz adaptasyonu |
| POST | `/teacher/insight` | Puq.ai / fallback öğretmen raporu |
