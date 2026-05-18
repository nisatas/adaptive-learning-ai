# NeuroAdapt

**NeuroAdapt**, öğrencilerin öğrenme davranışlarını analiz ederek onlara daha uygun bir öğrenme deneyimi sunan AI destekli adaptif eğitim platformudur.

Proje; öğrencinin quiz performansı, cevap süresi, hata yoğunluğu ve öğrenme davranışlarını değerlendirerek öğretmenlere anlamlı içgörüler üretir. Aynı zamanda öğrenciler için daha okunabilir, odaklanmayı kolaylaştıran ve kişiselleştirilmiş öğrenme arayüzleri sunar.

Bu proje, Kocaeli Hackathon kapsamında geliştirilmiştir ve Puq.ai workflow entegrasyonları ile zenginleştirilmiştir.

---

## Problem

Geleneksel eğitim platformları çoğu zaman tüm öğrencilere aynı arayüzü ve aynı öğrenme akışını sunar.

Ancak her öğrencinin öğrenme biçimi, dikkat süresi, okuma konforu ve desteğe ihtiyaç duyduğu alanlar farklıdır. Bu durum özellikle bireysel öğrenme desteğine ihtiyaç duyan öğrenciler için platform deneyimini zorlaştırabilir.

NeuroAdapt bu problemi şu yaklaşımla çözer:

- Öğrencinin davranış verilerini analiz eder.
- Quiz sonuçlarını ve cevap sürelerini değerlendirir.
- Öğretmene sınıf ve öğrenci bazlı AI destekli öneriler sunar.
- Öğrenci arayüzünü daha erişilebilir ve kişiselleştirilmiş hale getirir.
- Puq.ai workflow katmanı ile öğretmen ve öğrenci için akıllı çıktılar üretir.

> NeuroAdapt herhangi bir tıbbi tanı koymaz. Amaç, öğrencinin öğrenme sürecindeki ihtiyaçlarını analiz ederek daha uygun bir öğrenme ortamı sağlamaktır.

---

## Çözüm

NeuroAdapt iki ana kullanıcı rolüne odaklanır:

### Öğrenci

Öğrenci tarafında sistem:

- Ders içeriklerini görüntüler.
- Quiz çözer.
- Cevap süresi ve doğru/yanlış oranı analiz edilir.
- Öğrenme deneyimi adaptif modlarla desteklenir.
- Kişisel AI öğrenme rehberi sayesinde öğrenciye sade öneriler sunulur.

### Öğretmen

Öğretmen tarafında sistem:

- Sınıf genel performansını gösterir.
- Desteğe ihtiyaç duyan öğrencileri listeler.
- Zorlanılan konuları analiz eder.
- Puq.ai destekli haftalık rapor üretir.
- Öğrenci için destek planı önerir.
- Öğretmen-öğrenci görüşmesi için planlama önerisi oluşturur.

---

## Öne Çıkan Özellikler

- AI destekli öğretmen dashboardu
- Öğrenci performans analizi
- Quiz tabanlı adaptif öğrenme akışı
- Okuma kolaylığı modu
- Odaklanma modu
- Puq.ai workflow entegrasyonu
- Haftalık AI rapor analizi
- Öğrenci destek planı üretimi
- Öğretmen-öğrenci görüşme planlama önerisi
- Öğrenci için kişisel AI öğrenme rehberi
- Modern ve responsive arayüz

---

## Puq.ai Kullanımı

Bu projede Puq.ai sadece basit bir chat cevabı üretmek için değil, platformun karar destek katmanını güçlendirmek için kullanılmıştır.

Puq.ai kullanılan ana workflow alanları:

### 1. Öğretmen Dashboard Analizi

Öğretmen dashboardunda sınıf verileri analiz edilerek öğretmene sade ve aksiyon alınabilir bilgiler sunulur.

Örnek çıktılar:

- Sınıf genel durumu
- En çok zorlanılan konu
- Desteğe ihtiyaç duyan öğrenci grubu
- Öğrenci performans eğilimleri
- Öğretmen için önerilen aksiyonlar

---

### 2. Haftalık AI Rapor Workflow'u

Bu workflow, öğretmenin haftalık sınıf performansını daha kolay yorumlamasını sağlar.

Sistem:

- Quiz sonuçlarını değerlendirir.
- Sınıf ortalamasını analiz eder.
- Zorlanılan konuları öne çıkarır.
- Öğretmene haftalık aksiyon önerileri üretir.

Amaç, öğretmenin ham verilerle uğraşmadan sınıfın öğrenme durumunu hızlıca anlayabilmesidir.

---

### 3. Öğrenci Destek Planı Workflow'u

Bu workflow, belirli öğrenciler için öğrenme desteği önerileri üretir.

Sistem:

- Öğrencinin performansını analiz eder.
- Yanlış yaptığı konu alanlarını değerlendirir.
- Öğrenciye uygun destek önerileri sunar.
- Öğretmene uygulanabilir kısa aksiyonlar verir.

---

### 4. Öğretmen-Öğrenci Görüşme Planlama Workflow'u

Bu workflow, öğretmenin öğrenciyle yapacağı birebir görüşme için içerik ve zaman planlamasına yardımcı olur.

Sistem:

- Görüşme amacını belirler.
- Öğrencinin ihtiyaç duyduğu destek alanlarını özetler.
- Öğretmene görüşmede konuşabileceği başlıklar önerir.

> Bu workflow demo kapsamında görüşme önerisi ve planı üretir. Harici bir Google Meet ya da takvim entegrasyonu zorunlu değildir.

---

### 5. Öğrenci Kişisel AI Rehberi

Öğrenci tarafında Puq.ai, öğrencinin öğrenme sürecini destekleyen sade ve motive edici öneriler üretir.

Örnek:

- “Bu konuda biraz daha tekrar yapman faydalı olabilir.”
- “Cevap süren iyi, ancak paragraf sorularında dikkatini artırman gerekiyor.”
- “Bugün kısa bir tekrar ile ilerleyebilirsin.”

---

## Adaptif Öğrenme Modları

NeuroAdapt, öğrencinin öğrenme deneyimini daha konforlu hale getirmek için farklı arayüz modları sunar.

### Standart Mod

Genel kullanım için varsayılan öğrenme arayüzüdür.

### Okuma Kolaylığı Modu

Metinlerin daha rahat okunmasını sağlar.

Özellikler:

- Daha geniş metin alanı
- Daha okunabilir yazı boyutu
- Daha sade içerik görünümü
- Dikkat dağıtıcı öğelerin azaltılması

### Odaklanma Modu

Öğrencinin dikkatini tek bir içeriğe yoğunlaştırmasını sağlar.

Özellikler:

- Gereksiz görsel yoğunluğun azaltılması
- Quiz ve konu içeriklerinin merkeze alınması
- Daha sade ve temiz ekran düzeni

---

## Demo Akışı

Demo sırasında önerilen kullanım akışı:

1. Homepage gösterilir.
2. Öğrenci paneline geçilir.
3. Ders içeriği ve quiz akışı gösterilir.
4. Adaptif öğrenme modları gösterilir.
5. Öğretmen dashboarduna geçilir.
6. Sınıf performansı ve öğrenci analizleri gösterilir.
7. Puq.ai destekli workflow çıktıları anlatılır:
   - Haftalık rapor
   - Öğrenci destek planı
   - Öğretmen-öğrenci görüşme önerisi
   - Öğrenci kişisel AI rehberi

---

## Teknoloji Mimarisi

```text
Frontend
   |
   | HTTP Requests
   v
Backend API
   |
   | Business Logic
   v
Database
   |
   | Student / Quiz / Teacher Data
   v
Puq.ai Workflow Layer
   |
   | AI Generated Insights
   v
Teacher & Student Dashboards
