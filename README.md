# 24Tube 

24Tube, anonim olarak video yüklenebilen ve videoların 24 saat sonra otomatik silindiği bir video paylaşım platformudur.

## Özellikler

- Maksimum 24 video yükleme
- Her video maksimum 24 dakika
- Anonim video yükleme (kayıt gerekmez)
- HTML5 ile video izleme
- Videolar 24 saat sonra otomatik silinir
- Reklamsız ve sade bir arayüz

-------------------------------------

# Otel Belge ve Video Yükleme Sistemi

Bu proje, otellerin çalışanlarına yönelik belge (PDF, Word, Excel) ve video (MP4) dosyalarını belirli klasörlere ve belirli sürelerle yükleyebileceği bir sistemdir. Süresi dolan dosyalar sistemden otomatik olarak silinir.

Özellikler
-	Klasör seçerek belge ve video yükleme
-	Her dosya için süre belirleme (örneğin 3 gün)
-	Süresi dolan dosyaların otomatik silinmesi
- Videoları HTML5 player ile izleyebilme
- Belgeleri doğrudan sistem üzerinden açabilme (isteğe bağlı)

## Teknolojiler

- Node.js + Express.js
- Multer (video yükleme)
- FFmpeg (sıkıştırma ve dönüştürme)
- HTML5 video player
- (Database kararsız: MongoDB, PostgreSQL, Supabase düşünülebilir)
