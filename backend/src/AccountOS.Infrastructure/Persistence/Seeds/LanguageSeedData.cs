using AccountOS.Domain.Entities;

namespace AccountOS.Infrastructure.Persistence.Seeds;

/// <summary>
/// Dil seed data
/// </summary>
public static class LanguageSeedData
{
    /// <summary>
    /// 6 dil: TR, EN, UZ, AR, RU, DE
    /// </summary>
    public static List<Language> GetLanguages()
    {
        return new List<Language>
        {
            new Language
            {
                Id = Guid.Parse("11111111-1111-1111-1111-111111111111"),
                Code = "TR",
                Name = "Turkish",
                NativeName = "Türkçe",
                FlagIcon = "🇹🇷",
                IsRtl = false,
                IsActive = true,
                IsDefault = true,
                DisplayOrder = 1,
                CreatedAt = DateTime.UtcNow
            },
            new Language
            {
                Id = Guid.Parse("22222222-2222-2222-2222-222222222222"),
                Code = "EN",
                Name = "English",
                NativeName = "English",
                FlagIcon = "🇬🇧",
                IsRtl = false,
                IsActive = true,
                IsDefault = false,
                DisplayOrder = 2,
                CreatedAt = DateTime.UtcNow
            },
            new Language
            {
                Id = Guid.Parse("33333333-3333-3333-3333-333333333333"),
                Code = "UZ",
                Name = "Uzbek",
                NativeName = "O'zbek",
                FlagIcon = "🇺🇿",
                IsRtl = false,
                IsActive = true,
                IsDefault = false,
                DisplayOrder = 3,
                CreatedAt = DateTime.UtcNow
            },
            new Language
            {
                Id = Guid.Parse("44444444-4444-4444-4444-444444444444"),
                Code = "AR",
                Name = "Arabic",
                NativeName = "العربية",
                FlagIcon = "🇸🇦",
                IsRtl = true,
                IsActive = true,
                IsDefault = false,
                DisplayOrder = 4,
                CreatedAt = DateTime.UtcNow
            },
            new Language
            {
                Id = Guid.Parse("55555555-5555-5555-5555-555555555555"),
                Code = "RU",
                Name = "Russian",
                NativeName = "Русский",
                FlagIcon = "🇷🇺",
                IsRtl = false,
                IsActive = true,
                IsDefault = false,
                DisplayOrder = 5,
                CreatedAt = DateTime.UtcNow
            },
            new Language
            {
                Id = Guid.Parse("66666666-6666-6666-6666-666666666666"),
                Code = "DE",
                Name = "German",
                NativeName = "Deutsch",
                FlagIcon = "🇩🇪",
                IsRtl = false,
                IsActive = true,
                IsDefault = false,
                DisplayOrder = 6,
                CreatedAt = DateTime.UtcNow
            }
        };
    }

    /// <summary>
    /// Frontend'deki tr.json'dan Türkçe çeviriler
    /// </summary>
    public static List<Translation> GetTurkishTranslations()
    {
        var trLangId = Guid.Parse("11111111-1111-1111-1111-111111111111");
        var translations = new List<Translation>();

        // Common
        var commonTranslations = new Dictionary<string, string>
        {
            { "common.save", "Kaydet" },
            { "common.cancel", "İptal" },
            { "common.delete", "Sil" },
            { "common.edit", "Düzenle" },
            { "common.add", "Ekle" },
            { "common.create", "Oluştur" },
            { "common.update", "Güncelle" },
            { "common.search", "Ara" },
            { "common.filter", "Filtrele" },
            { "common.export", "Dışa Aktar" },
            { "common.import", "İçe Aktar" },
            { "common.download", "İndir" },
            { "common.upload", "Yükle" },
            { "common.view", "Görüntüle" },
            { "common.close", "Kapat" },
            { "common.back", "Geri" },
            { "common.next", "İleri" },
            { "common.previous", "Önceki" },
            { "common.submit", "Gönder" },
            { "common.confirm", "Onayla" },
            { "common.yes", "Evet" },
            { "common.no", "Hayır" },
            { "common.actions", "İşlemler" },
            { "common.status", "Durum" },
            { "common.active", "Aktif" },
            { "common.inactive", "Pasif" },
            { "common.loading", "Yükleniyor..." },
            { "common.noData", "Veri bulunamadı" },
            { "common.error", "Hata" },
            { "common.success", "Başarılı" },
            { "common.warning", "Uyarı" },
            { "common.info", "Bilgi" }
        };

        foreach (var kvp in commonTranslations)
        {
            translations.Add(new Translation
            {
                Id = Guid.NewGuid(),
                LanguageId = trLangId,
                Key = kvp.Key,
                Value = kvp.Value,
                Category = "common",
                CreatedAt = DateTime.UtcNow
            });
        }

        // Auth
        var authTranslations = new Dictionary<string, string>
        {
            { "auth.login", "Giriş Yap" },
            { "auth.logout", "Çıkış Yap" },
            { "auth.email", "E-posta" },
            { "auth.password", "Şifre" },
            { "auth.rememberMe", "Beni Hatırla" },
            { "auth.forgotPassword", "Şifremi Unuttum" },
            { "auth.welcome", "Hoş Geldiniz" },
            { "auth.loginTitle", "AccountOS'e Giriş Yapın" },
            { "auth.loginSubtitle", "Modern ERP & Muhasebe Sistemi" }
        };

        foreach (var kvp in authTranslations)
        {
            translations.Add(new Translation
            {
                Id = Guid.NewGuid(),
                LanguageId = trLangId,
                Key = kvp.Key,
                Value = kvp.Value,
                Category = "auth",
                CreatedAt = DateTime.UtcNow
            });
        }

        // Dashboard
        var dashboardTranslations = new Dictionary<string, string>
        {
            { "dashboard.title", "Dashboard" },
            { "dashboard.subtitle", "İşletmenizin genel durumu" },
            { "dashboard.totalSales", "Toplam Satış" },
            { "dashboard.totalRevenue", "Toplam Tahsilat" },
            { "dashboard.totalProfit", "Toplam Kâr" },
            { "dashboard.pendingReceivables", "Bekleyen Alacaklar" }
        };

        foreach (var kvp in dashboardTranslations)
        {
            translations.Add(new Translation
            {
                Id = Guid.NewGuid(),
                LanguageId = trLangId,
                Key = kvp.Key,
                Value = kvp.Value,
                Category = "dashboard",
                CreatedAt = DateTime.UtcNow
            });
        }

        // Menu
        var menuTranslations = new Dictionary<string, string>
        {
            { "menu.dashboard", "Dashboard" },
            { "menu.customers", "Müşteriler" },
            { "menu.suppliers", "Tedarikçiler" },
            { "menu.products", "Ürünler" },
            { "menu.invoices", "Faturalar" },
            { "menu.payments", "Ödemeler" },
            { "menu.reports", "Raporlar" },
            { "menu.settings", "Ayarlar" }
        };

        foreach (var kvp in menuTranslations)
        {
            translations.Add(new Translation
            {
                Id = Guid.NewGuid(),
                LanguageId = trLangId,
                Key = kvp.Key,
                Value = kvp.Value,
                Category = "menu",
                CreatedAt = DateTime.UtcNow
            });
        }

        // Errors
        var errorTranslations = new Dictionary<string, string>
        {
            { "errors.404", "Sayfa Bulunamadı" },
            { "errors.403", "Erişim Yetkiniz Yok" },
            { "errors.500", "Sunucu Hatası" },
            { "errors.404Message", "Üzgünüz, aradığınız sayfa bulunamadı." },
            { "errors.403Message", "Üzgünüz, bu sayfaya erişim yetkiniz bulunmuyor." },
            { "errors.500Message", "Üzgünüz, sunucu hatası oluştu. Lütfen daha sonra tekrar deneyin." },
            { "errors.backToHome", "Ana Sayfaya Dön" },
            { "errors.reload", "Sayfayı Yenile" }
        };

        foreach (var kvp in errorTranslations)
        {
            translations.Add(new Translation
            {
                Id = Guid.NewGuid(),
                LanguageId = trLangId,
                Key = kvp.Key,
                Value = kvp.Value,
                Category = "errors",
                CreatedAt = DateTime.UtcNow
            });
        }

        // Validation
        var validationTranslations = new Dictionary<string, string>
        {
            { "validation.required", "Bu alan zorunludur" },
            { "validation.email", "Geçerli bir e-posta adresi giriniz" }
        };

        foreach (var kvp in validationTranslations)
        {
            translations.Add(new Translation
            {
                Id = Guid.NewGuid(),
                LanguageId = trLangId,
                Key = kvp.Key,
                Value = kvp.Value,
                Category = "validation",
                CreatedAt = DateTime.UtcNow
            });
        }

        // Messages
        var messageTranslations = new Dictionary<string, string>
        {
            { "messages.saveSuccess", "Başarıyla kaydedildi" },
            { "messages.updateSuccess", "Başarıyla güncellendi" },
            { "messages.deleteSuccess", "Başarıyla silindi" },
            { "messages.error", "Bir hata oluştu" }
        };

        foreach (var kvp in messageTranslations)
        {
            translations.Add(new Translation
            {
                Id = Guid.NewGuid(),
                LanguageId = trLangId,
                Key = kvp.Key,
                Value = kvp.Value,
                Category = "messages",
                CreatedAt = DateTime.UtcNow
            });
        }

        // Theme
        var themeTranslations = new Dictionary<string, string>
        {
            { "theme.light", "Açık" },
            { "theme.dark", "Koyu" },
            { "theme.semiDark", "Semi-Dark" },
            { "theme.system", "Sistem" }
        };

        foreach (var kvp in themeTranslations)
        {
            translations.Add(new Translation
            {
                Id = Guid.NewGuid(),
                LanguageId = trLangId,
                Key = kvp.Key,
                Value = kvp.Value,
                Category = "theme",
                CreatedAt = DateTime.UtcNow
            });
        }

        return translations;
    }

    /// <summary>
    /// İngilizce çeviriler (frontend en.json'dan)
    /// </summary>
    public static List<Translation> GetEnglishTranslations()
    {
        var enLangId = Guid.Parse("22222222-2222-2222-2222-222222222222");
        var translations = new List<Translation>();

        // Common
        var commonTranslations = new Dictionary<string, string>
        {
            { "common.save", "Save" },
            { "common.cancel", "Cancel" },
            { "common.delete", "Delete" },
            { "common.edit", "Edit" },
            { "common.add", "Add" },
            { "common.create", "Create" },
            { "common.update", "Update" },
            { "common.search", "Search" },
            { "common.filter", "Filter" },
            { "common.export", "Export" },
            { "common.import", "Import" },
            { "common.download", "Download" },
            { "common.upload", "Upload" },
            { "common.view", "View" },
            { "common.close", "Close" },
            { "common.back", "Back" },
            { "common.next", "Next" },
            { "common.previous", "Previous" },
            { "common.submit", "Submit" },
            { "common.confirm", "Confirm" },
            { "common.yes", "Yes" },
            { "common.no", "No" },
            { "common.actions", "Actions" },
            { "common.status", "Status" },
            { "common.active", "Active" },
            { "common.inactive", "Inactive" },
            { "common.loading", "Loading..." },
            { "common.noData", "No data found" },
            { "common.error", "Error" },
            { "common.success", "Success" },
            { "common.warning", "Warning" },
            { "common.info", "Info" }
        };

        foreach (var kvp in commonTranslations)
        {
            translations.Add(new Translation
            {
                Id = Guid.NewGuid(),
                LanguageId = enLangId,
                Key = kvp.Key,
                Value = kvp.Value,
                Category = "common",
                CreatedAt = DateTime.UtcNow
            });
        }

        // Auth
        var authTranslations = new Dictionary<string, string>
        {
            { "auth.login", "Login" },
            { "auth.logout", "Logout" },
            { "auth.email", "Email" },
            { "auth.password", "Password" },
            { "auth.rememberMe", "Remember Me" },
            { "auth.forgotPassword", "Forgot Password" },
            { "auth.welcome", "Welcome" },
            { "auth.loginTitle", "Sign in to AccountOS" },
            { "auth.loginSubtitle", "Modern ERP & Accounting System" }
        };

        foreach (var kvp in authTranslations)
        {
            translations.Add(new Translation
            {
                Id = Guid.NewGuid(),
                LanguageId = enLangId,
                Key = kvp.Key,
                Value = kvp.Value,
                Category = "auth",
                CreatedAt = DateTime.UtcNow
            });
        }

        // Dashboard
        var dashboardTranslations = new Dictionary<string, string>
        {
            { "dashboard.title", "Dashboard" },
            { "dashboard.subtitle", "Overview of your business" },
            { "dashboard.totalSales", "Total Sales" },
            { "dashboard.totalRevenue", "Total Revenue" },
            { "dashboard.totalProfit", "Total Profit" },
            { "dashboard.pendingReceivables", "Pending Receivables" }
        };

        foreach (var kvp in dashboardTranslations)
        {
            translations.Add(new Translation
            {
                Id = Guid.NewGuid(),
                LanguageId = enLangId,
                Key = kvp.Key,
                Value = kvp.Value,
                Category = "dashboard",
                CreatedAt = DateTime.UtcNow
            });
        }

        // Menu
        var menuTranslations = new Dictionary<string, string>
        {
            { "menu.dashboard", "Dashboard" },
            { "menu.customers", "Customers" },
            { "menu.suppliers", "Suppliers" },
            { "menu.products", "Products" },
            { "menu.invoices", "Invoices" },
            { "menu.payments", "Payments" },
            { "menu.reports", "Reports" },
            { "menu.settings", "Settings" }
        };

        foreach (var kvp in menuTranslations)
        {
            translations.Add(new Translation
            {
                Id = Guid.NewGuid(),
                LanguageId = enLangId,
                Key = kvp.Key,
                Value = kvp.Value,
                Category = "menu",
                CreatedAt = DateTime.UtcNow
            });
        }

        // Errors
        var errorTranslations = new Dictionary<string, string>
        {
            { "errors.404", "Page Not Found" },
            { "errors.403", "Access Forbidden" },
            { "errors.500", "Server Error" },
            { "errors.404Message", "Sorry, the page you are looking for could not be found." },
            { "errors.403Message", "Sorry, you do not have permission to access this page." },
            { "errors.500Message", "Sorry, a server error occurred. Please try again later." },
            { "errors.backToHome", "Back to Home" },
            { "errors.reload", "Reload Page" }
        };

        foreach (var kvp in errorTranslations)
        {
            translations.Add(new Translation
            {
                Id = Guid.NewGuid(),
                LanguageId = enLangId,
                Key = kvp.Key,
                Value = kvp.Value,
                Category = "errors",
                CreatedAt = DateTime.UtcNow
            });
        }

        // Validation
        var validationTranslations = new Dictionary<string, string>
        {
            { "validation.required", "This field is required" },
            { "validation.email", "Please enter a valid email address" }
        };

        foreach (var kvp in validationTranslations)
        {
            translations.Add(new Translation
            {
                Id = Guid.NewGuid(),
                LanguageId = enLangId,
                Key = kvp.Key,
                Value = kvp.Value,
                Category = "validation",
                CreatedAt = DateTime.UtcNow
            });
        }

        // Messages
        var messageTranslations = new Dictionary<string, string>
        {
            { "messages.saveSuccess", "Saved successfully" },
            { "messages.updateSuccess", "Updated successfully" },
            { "messages.deleteSuccess", "Deleted successfully" },
            { "messages.error", "An error occurred" }
        };

        foreach (var kvp in messageTranslations)
        {
            translations.Add(new Translation
            {
                Id = Guid.NewGuid(),
                LanguageId = enLangId,
                Key = kvp.Key,
                Value = kvp.Value,
                Category = "messages",
                CreatedAt = DateTime.UtcNow
            });
        }

        // Theme
        var themeTranslations = new Dictionary<string, string>
        {
            { "theme.light", "Light" },
            { "theme.dark", "Dark" },
            { "theme.semiDark", "Semi-Dark" },
            { "theme.system", "System" }
        };

        foreach (var kvp in themeTranslations)
        {
            translations.Add(new Translation
            {
                Id = Guid.NewGuid(),
                LanguageId = enLangId,
                Key = kvp.Key,
                Value = kvp.Value,
                Category = "theme",
                CreatedAt = DateTime.UtcNow
            });
        }

        return translations;
    }
}

