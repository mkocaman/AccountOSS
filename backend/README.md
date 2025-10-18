# AccountOS Backend - Clean Architecture

AccountOS projesi için .NET 8 ile geliştirilmiş Clean Architecture tabanlı backend uygulaması.

## 📁 Proje Yapısı

```
backend/
├── AccountOS.sln                  # Solution dosyası
├── Directory.Build.props          # Ortak MSBuild ayarları
├── .editorconfig                  # Kod stili ayarları
└── src/
    ├── AccountOS.Api/            # ASP.NET Core Web API
    ├── AccountOS.Application/    # CQRS, Use Cases (MediatR)
    ├── AccountOS.Domain/         # Domain Entities, Interfaces
    ├── AccountOS.Infrastructure/ # EF Core, External Services
    └── AccountOS.Shared/         # Common Utilities
```

## 🏗️ Mimari Katmanlar

### AccountOS.Domain
- **Bağımlılıklar**: Sadece `Shared`
- **İçerik**: Domain entities, value objects, domain interfaces
- **Paketler**: Yok (saf domain katmanı)

### AccountOS.Shared
- **Bağımlılıklar**: Yok
- **İçerik**: Common utilities, extension methods, constants
- **Paketler**: Yok

### AccountOS.Application
- **Bağımlılıklar**: `Domain`, `Shared`
- **İçerik**: Use cases, CQRS handlers, DTOs, validators
- **Paketler**:
  - MediatR 13.0.0
  - FluentValidation.DependencyInjectionExtensions 12.0.0
  - AutoMapper.Extensions.Microsoft.DependencyInjection 12.0.1

### AccountOS.Infrastructure
- **Bağımlılıklar**: `Domain`, `Application`, `Shared`
- **İçerik**: EF Core DbContext, repositories, external service implementations
- **Paketler**:
  - Npgsql.EntityFrameworkCore.PostgreSQL 8.0.11
  - Microsoft.EntityFrameworkCore.Design 8.0.11

### AccountOS.Api
- **Bağımlılıklar**: `Application`, `Infrastructure`
- **İçerik**: Controllers, middleware, startup configuration
- **Paketler**:
  - Microsoft.AspNetCore.Authentication.JwtBearer 8.0.11
  - Serilog.AspNetCore 8.0.3
  - Swashbuckle.AspNetCore 6.8.1

## ✨ Özellikler

### Tamamlanan Modüller
- ✅ **Authentication & Authorization** (Prompt 1.9, 1.10, 1.12)
  - JWT tabanlı authentication
  - Multi-tenant CompanyId claim support
  - Role-based authorization
  - Password hashing (BCrypt)

- ✅ **Multi-Tenant Company System** (Prompt 1.8)
  - Company CRUD operations
  - User-Company relationship
  - Default company selection
  - Tenant isolation (Global Query Filter)

- ✅ **Currency & FxRate System** (Prompt 1.11)
  - 8 para birimi seed data (TRY, USD, EUR, GBP, RUB, UZS, AED, SAR)
  - Döviz kuru yönetimi (upsert)
  - Tarih bazlı kur sorgulama
  - Seed data verification endpoint

- ✅ **Customer (Cari) Management** (Prompt 1.13)
  - Customer CRUD operations
  - Customer types (Müşteri, Tedarikçi, Her İkisi)
  - Multi-tenant customer isolation
  - Soft delete support

- ✅ **Product Management** (Prompt 1.13)
  - Product CRUD operations
  - Multi-language product names (ProductTranslation)
  - Product types (Mal, Hizmet, Sabit Kıymet)
  - Stock tracking
  - Soft delete support

- ✅ **Language & Translation System** (Prompt 1.14 + 1.15 Enhancement)
  - 5 dil desteği (TR, EN, RU, UZ, AR)
  - RTL (Right-to-Left) support
  - Key-value translation pairs
  - Category-based filtering
  - Upsert mechanism
  - 15 seed translations
  - **Owner CRUD** - Create/Update/Delete languages & translations 🆕
  - Protected default language (TR cannot be deleted)

- ✅ **Stock Layers & FIFO System** (Prompt 1.15) 🆕
  - Layer-based inventory tracking
  - **FIFO (First-In-First-Out)** cost calculation
  - Multi-layer consumption support
  - Exchange rate snapshot per layer
  - Automatic Product.StockQuantity calculation
  - Complete audit trail (StockMovement)
  - Consumption history (StockConsumption)
  - Multi-currency support

- ✅ **Tenant User Limits** (Prompt 1.15) 🆕
  - Company.MaxUsers property (default: 5)
  - CurrentUserCount calculation
  - Automatic limit validation
  - Owner can increase/decrease limit
  - Pricing plan integration ready

### Teknik Özellikler
- ✅ **Clean Architecture** - Katmanlı mimari
- ✅ **CQRS Pattern** - MediatR ile komut/sorgu ayrımı
- ✅ **Validation** - FluentValidation
- ✅ **Soft Delete** - Global query filter
- ✅ **Audit Logging** - CreatedBy, UpdatedBy, DeletedBy
- ✅ **Optimistic Concurrency** - RowVersion
- ✅ **Result Pattern** - Exception yerine Result<T>
- ✅ **Global Exception Handler** - Merkezi hata yönetimi

## 🚀 Başlangıç

### Gereksinimler
- .NET 8 SDK
- PostgreSQL 17.x

### Projeyi Çalıştırma

```bash
# Solution'ı restore et
dotnet restore AccountOS.sln

# Projeyi build et
dotnet build AccountOS.sln

# API'yi çalıştır
cd src/AccountOS.Api
dotnet run
```

API varsayılan olarak https://localhost:5001 adresinde çalışacaktır.

### Swagger UI
Geliştirme ortamında Swagger UI otomatik olarak aktif olur:
```
https://localhost:5001/swagger
```

## 🔧 Geliştirme

### Clean Architecture Prensipleri
1. **Bağımlılık Kuralı**: Bağımlılıklar her zaman içe doğru (Domain'e doğru) olmalı
2. **Domain Katmanı**: Hiçbir dış bağımlılık içermemeli
3. **Application Katmanı**: Infrastructure detaylarından bağımsız
4. **Infrastructure Katmanı**: Application interface'lerini implement eder

### Kod Standartları
- C# 12 özellikleri kullanılabilir
- Nullable reference types aktif
- ImplicitUsings aktif
- .editorconfig kurallarına uyun

## 📦 NuGet Paketleri

### Application Layer
- **MediatR**: CQRS pattern implementasyonu
- **FluentValidation**: Request validation
- **AutoMapper**: Object mapping

### Infrastructure Layer
- **EF Core**: ORM
- **Npgsql**: PostgreSQL provider

### API Layer
- **JWT Bearer**: Authentication
- **Serilog**: Logging
- **Swashbuckle**: Swagger/OpenAPI documentation

## 🔐 Yapılandırma

`appsettings.json` dosyasını kullanarak:
- Database connection strings
- JWT settings
- Logging levels
- CORS policies

## 📝 Lisans

[Lisans bilgisi buraya eklenecek]

