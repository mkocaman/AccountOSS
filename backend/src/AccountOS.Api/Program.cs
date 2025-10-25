using AccountOS.Application;
using AccountOS.Infrastructure;
using AccountOS.Api.Middleware;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using Microsoft.EntityFrameworkCore;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

// Configuration
var configuration = builder.Configuration;

// Add services to the container
builder.Services.AddControllers();

// JWT Authentication
builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = configuration["Jwt:Issuer"],
        ValidAudience = configuration["Jwt:Audience"],
        IssuerSigningKey = new SymmetricSecurityKey(
            Encoding.UTF8.GetBytes(configuration["Jwt:SecretKey"]!))
    };
});

builder.Services.AddAuthorization();

// Swagger/OpenAPI
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(options =>
{
    options.SwaggerDoc("v1", new()
    {
        Title = "AccountOS API",
        Version = "v1",
        Description = "Muhasebe ve ERP sistemi - Multi-tenant SaaS",
        Contact = new()
        {
            Name = "AccountOS Team",
            Email = "info@accountos.com"
        }
    });
    
    // JWT Authorization header
    options.AddSecurityDefinition("Bearer", new()
    {
        Name = "Authorization",
        Type = Microsoft.OpenApi.Models.SecuritySchemeType.Http,
        Scheme = "Bearer",
        BearerFormat = "JWT",
        In = Microsoft.OpenApi.Models.ParameterLocation.Header,
        Description = "JWT Authorization header. Örnek: 'Bearer {token}'"
    });
    
    options.AddSecurityRequirement(new()
    {
        {
            new()
            {
                Reference = new()
                {
                    Type = Microsoft.OpenApi.Models.ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            Array.Empty<string>()
        }
    });
    
    // Ignore problematic controllers for now
    options.IgnoreObsoleteActions();
});

// CORS - Frontend bağlantısı için
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins(
                "http://localhost:3000",      // Vite dev server
                "http://localhost:3001",      // Current frontend port
                "http://localhost:3002",      // Alternative port
                "http://localhost:3003",      // Alternative port
                "http://localhost:3005",      // Alternative port
                "https://localhost:3000",     // HTTPS Vite dev server
                "https://localhost:3001",     // HTTPS Current frontend port
                "https://localhost:3002",     // HTTPS Alternative port
                "https://localhost:3003",     // HTTPS Alternative port
                "https://localhost:3005",     // HTTPS Alternative port
                "https://accountos.com",      // Production (future)
                "https://www.accountos.com"   // Production www
            )
            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowCredentials()  // Cookie ve auth için gerekli
            .SetIsOriginAllowedToAllowWildcardSubdomains();
    });
});

// HttpContextAccessor - ICurrentUserService ve ITenantService için gerekli
builder.Services.AddHttpContextAccessor();

// Application Services
builder.Services.AddApplication();

// Infrastructure Services
var connectionString = configuration.GetConnectionString("DefaultConnection") 
    ?? throw new InvalidOperationException("Connection string 'DefaultConnection' not found.");
builder.Services.AddInfrastructure(connectionString);

// Background Services
builder.Services.AddHostedService<AccountOS.Api.BackgroundServices.EmailQueueBackgroundService>();
builder.Services.AddHostedService<AccountOS.Api.BackgroundServices.AlertCheckerBackgroundService>();

var app = builder.Build();

// Seed database (Development only)
if (app.Environment.IsDevelopment())
{
    using var scope = app.Services.CreateScope();
    var services = scope.ServiceProvider;
    try
    {
        var context = services.GetRequiredService<AccountOS.Infrastructure.Persistence.ApplicationDbContext>();
        var logger = services.GetRequiredService<ILogger<Program>>();
        
        // Apply migrations
        await context.Database.MigrateAsync();
        
        // Seed data ekle
        await AccountOS.Infrastructure.Persistence.ApplicationDbContextSeed.SeedAsync(context, logger);
        
        logger.LogInformation("✅ Database migration ve seed data tamamlandı");
    }
    catch (Exception ex)
    {
        var logger = services.GetRequiredService<ILogger<Program>>();
        logger.LogError(ex, "Veritabanı oluşturulurken hata");
    }
}

// Configure the HTTP request pipeline

// Swagger (Development ve Staging'de açık) - ÖNCE Swagger
if (app.Environment.IsDevelopment() || app.Environment.IsStaging())
{
    app.UseSwagger();
    app.UseSwaggerUI(options =>
    {
        options.SwaggerEndpoint("/swagger/v1/swagger.json", "AccountOS API v1");
        options.RoutePrefix = string.Empty; // Swagger root'ta açılsın
    });
}

// HTTPS redirect - sadece production'da
if (!app.Environment.IsDevelopment())
{
    app.UseHttpsRedirection();
}

// CORS - ÖNEMLİ: Diğer middleware'lerden ÖNCE!
app.UseCors("AllowFrontend");

// Security Headers (OWASP recommended)
app.UseMiddleware<SecurityHeadersMiddleware>();

// Rate Limiting (before authentication) - GEÇİCİ OLARAK DEVRE DIŞI
// app.UseMiddleware<RateLimitingMiddleware>();

// Global Exception Handler Middleware
app.UseMiddleware<ExceptionHandlerMiddleware>();

// Authentication & Authorization
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();
