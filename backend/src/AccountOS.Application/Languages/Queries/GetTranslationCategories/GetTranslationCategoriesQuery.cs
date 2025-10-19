using AccountOS.Application.Common;
using MediatR;

namespace AccountOS.Application.Languages.Queries.GetTranslationCategories;

/// <summary>
/// Çeviri kategorilerini getir query'si
/// </summary>
public record GetTranslationCategoriesQuery : IRequest<Result<List<string>>>;

