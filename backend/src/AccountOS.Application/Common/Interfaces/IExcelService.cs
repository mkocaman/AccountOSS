namespace AccountOS.Application.Common.Interfaces;

/// <summary>
/// Excel import/export servisi
/// Raporlar için Excel dosyası oluşturur
/// Toplu veri girişi için Excel okur
/// </summary>
public interface IExcelService
{
    /// <summary>
    /// Excel dosyasından veri okur
    /// </summary>
    Task<List<T>> ImportFromExcelAsync<T>(Stream excelStream, CancellationToken cancellationToken = default) where T : class;
    
    /// <summary>
    /// Veriyi Excel'e dönüştürür
    /// </summary>
    Task<byte[]> ExportToExcelAsync<T>(IEnumerable<T> data, string sheetName = "Sheet1", CancellationToken cancellationToken = default);
}

