using AccountOS.Application.Common;
using MediatR;

namespace AccountOS.Application.Companies.Commands.InviteUser;

/// <summary>
/// Şirkete kullanıcı davet etme komutu
/// </summary>
public record InviteUserToCompanyCommand : IRequest<Result<bool>>
{
    /// <summary>Şirket ID</summary>
    public Guid CompanyId { get; init; }
    
    /// <summary>Davet edilecek kullanıcının email'i</summary>
    public string Email { get; init; } = string.Empty;
    
    /// <summary>Atanacak rol (Admin, Manager, Accountant, vb.)</summary>
    public string Role { get; init; } = "User";
}

