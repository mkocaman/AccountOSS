namespace AccountOS.Application.Common.Interfaces;

/// <summary>
/// Yevmiye kaydı servisi
/// </summary>
public interface IJournalEntryService
{
    /// <summary>
    /// Fatura için otomatik yevmiye kaydı oluştur
    /// </summary>
    Task CreateInvoiceJournalEntryAsync(
        Guid invoiceId,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Ödeme için otomatik yevmiye kaydı oluştur
    /// </summary>
    Task CreatePaymentJournalEntryAsync(
        Guid paymentId,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Gider için otomatik yevmiye kaydı oluştur
    /// </summary>
    Task CreateExpenseJournalEntryAsync(
        Guid expenseId,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Manuel yevmiye kaydı oluştur
    /// </summary>
    Task<Guid> CreateManualJournalEntryAsync(
        DateTime entryDate,
        string description,
        List<(Guid AccountId, decimal Debit, decimal Credit, string? Description)> lines,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Yevmiye kaydını onayla
    /// </summary>
    Task ApproveJournalEntryAsync(
        Guid journalEntryId,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Yevmiye kaydını deftere işle
    /// </summary>
    Task PostJournalEntryAsync(
        Guid journalEntryId,
        CancellationToken cancellationToken = default);
}

