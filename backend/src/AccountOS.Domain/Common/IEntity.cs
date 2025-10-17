namespace AccountOS.Domain.Common;

/// <summary>
/// Tüm entity'lerin implement etmesi gereken temel interface
/// </summary>
public interface IEntity
{
    Guid Id { get; set; }
}

