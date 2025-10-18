using Microsoft.Extensions.Configuration;
using System.Security.Cryptography;
using System.Text;

namespace AccountOS.Infrastructure.Services;

/// <summary>
/// AES encryption/decryption service for sensitive data
/// </summary>
public class EncryptionService
{
    private readonly byte[] _key;
    private readonly byte[] _iv;

    public EncryptionService(IConfiguration configuration)
    {
        // Key ve IV appsettings'den al (production'da environment variable kullan!)
        var encryptionKey = configuration["Encryption:Key"] ?? "AccountOS-Default-Key-32Chars!";
        var encryptionIV = configuration["Encryption:IV"] ?? "AccountOS-IV-16!";

        _key = DeriveKeyFromPassword(encryptionKey, 32);
        _iv = DeriveKeyFromPassword(encryptionIV, 16);
    }

    public string Encrypt(string plainText)
    {
        if (string.IsNullOrWhiteSpace(plainText))
            return plainText;

        using var aes = Aes.Create();
        aes.Key = _key;
        aes.IV = _iv;

        using var encryptor = aes.CreateEncryptor();
        using var ms = new MemoryStream();
        using var cs = new CryptoStream(ms, encryptor, CryptoStreamMode.Write);
        using (var sw = new StreamWriter(cs))
        {
            sw.Write(plainText);
        }

        return Convert.ToBase64String(ms.ToArray());
    }

    public string Decrypt(string cipherText)
    {
        if (string.IsNullOrWhiteSpace(cipherText))
            return cipherText;

        try
        {
            using var aes = Aes.Create();
            aes.Key = _key;
            aes.IV = _iv;

            using var decryptor = aes.CreateDecryptor();
            using var ms = new MemoryStream(Convert.FromBase64String(cipherText));
            using var cs = new CryptoStream(ms, decryptor, CryptoStreamMode.Read);
            using var sr = new StreamReader(cs);

            return sr.ReadToEnd();
        }
        catch
        {
            // Decrypt başarısız - plaintext olabilir (backward compatibility)
            return cipherText;
        }
    }

    private byte[] DeriveKeyFromPassword(string password, int keySize)
    {
        using var sha256 = SHA256.Create();
        var hash = sha256.ComputeHash(Encoding.UTF8.GetBytes(password));
        
        var key = new byte[keySize];
        Array.Copy(hash, key, Math.Min(keySize, hash.Length));
        
        return key;
    }
}

