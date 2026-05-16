# NeuroAdapt AI — Proje Özeti

## Problem

Geleneksel eğitim platformları tüm öğrencilere aynı arayüzü sunar. Quiz sırasındaki davranış sinyalleri (cevap süresi, atlama, tereddüt) genelde analiz edilmez veya öğretmene anlamlı biçimde aktarılmaz. Öğrenciyi etiketleyen tanı odaklı yaklaşımlar ise etik ve pedagojik açıdan sorunludur.

## Çözüm

NeuroAdapt AI, quiz davranışlarını analiz ederek öğrenci arayüzünü kişiselleştirir ve öğretmene etik öğrenme içgörü raporu sunar. Karar motoru kural tabanlıdır; Puq.ai rapor dilini zenginleştirir.

## MVP Kapsamı

- Quiz davranış verisi toplama (süre, yanlış, atlama, tereddüt)
- Kural tabanlı öğrenme modu / arayüz adaptasyonu
- Öğrenciye yalnızca dost mesajlar ("Kişiselleştirilmiş öğrenme görünümü aktif.")
- Öğretmen panelinde AI destekli pedagojik rapor
- Puq.ai entegrasyonu yalnızca backend üzerinden
- Mock/statik veri (veritabanı yok)

## Etik Tasarım İlkesi

- Öğrenci asla iç öğrenme modu adlarını veya tanısal etiketleri görmez.
- Öğretmen pedagojik gözlem görür; tıbbi veya psikolojik tanı sunulmaz.
- Sistem öğrenciyi etiketlemez; öğrenme deneyimini destekleyici şekilde kişiselleştirir.
