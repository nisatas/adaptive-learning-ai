# Demo Senaryosu

Bu doküman hackathon demo akışını tanımlar.

## Akış

1. **Öğrenci quizi çözer**
   - Soruları cevaplar; sistem cevap süresi, yanlışlar, atlamalar ve tereddüt desenlerini kaydeder.

2. **Sistem davranışı analiz eder**
   - Kural tabanlı motor öğrenme profilini (iç mod) belirler; öğrenciye gösterilmez.

3. **Öğrenci kişiselleştir butonuna tıklar**
   - Arayüz adaptasyonu uygulanır.
   - Öğrenci yalnızca şunu görür: *"Kişiselleştirilmiş öğrenme görünümü aktif."*

4. **Arayüz adapte olur**
   - Örnek: daha büyük yazı, sakin tempo, adım adım ipuçları (moda göre).

5. **Öğretmen raporu görür**
   - Backend Puq.ai ile (veya fallback ile) pedagojik içgörü raporu üretir.
   - Raporda tanı, etiket veya risk grubu ifadesi yoktur.

## Demo mesajları

| Rol | Örnek mesaj |
|-----|-------------|
| Öğrenci | Kişiselleştirilmiş öğrenme görünümü aktif. |
| Öğretmen | Öğrenci bazı sorularda daha fazla zamana ihtiyaç duymuş olabilir. Bir sonraki derste adım adım örnek çözüm önerilir. |
