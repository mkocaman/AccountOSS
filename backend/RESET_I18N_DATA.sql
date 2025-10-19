-- i18n verilerini sıfırla ve yeniden seed et
-- ⚠️ DİKKAT: Bu script mevcut dil ve çeviri verilerini SİLER!

-- Önce çevirileri sil (Foreign Key)
DELETE FROM translations;

-- Sonra dilleri sil
DELETE FROM languages;

-- ✅ Artık ApplicationDbContextSeed otomatik olarak yeni seed data'yı ekleyecek
-- Backend'i yeniden başlat: dotnet run

