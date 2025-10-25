import client from '@/utils/client';

/**
 * Dosya yükleme servisi
 */

export interface UploadResponse {
  url: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
}

export const uploadService = {
  /**
   * Avatar yükle
   */
  uploadAvatar: async (file: File): Promise<UploadResponse> => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await client.post('/upload/avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });

    return response.data;
  },

  /**
   * Şirket logosu yükle
   */
  uploadLogo: async (file: File): Promise<UploadResponse> => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await client.post('/upload/logo', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });

    return response.data;
  },

  /**
   * Fatura eki yükle
   */
  uploadInvoiceAttachment: async (
    invoiceId: string,
    file: File
  ): Promise<UploadResponse> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('invoiceId', invoiceId);

    const response = await client.post('/upload/invoice-attachment', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });

    return response.data;
  },

  /**
   * Dosya sil
   */
  deleteFile: async (url: string): Promise<void> => {
    await client.delete('/upload', {
      data: { url }
    });
  },

  /**
   * Resmi optimize et (client-side)
   */
  optimizeImage: async (
    file: File,
    maxWidth: number = 800,
    maxHeight: number = 800,
    quality: number = 0.8
  ): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);

      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;

        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;

          // Boyut kontrolü
          if (width > height) {
            if (width > maxWidth) {
              height = Math.round((height * maxWidth) / width);
              width = maxWidth;
            }
          } else {
            if (height > maxHeight) {
              width = Math.round((width * maxHeight) / height);
              height = maxHeight;
            }
          }

          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);

          canvas.toBlob(
            (blob) => {
              if (blob) {
                resolve(blob);
              } else {
                reject(new Error('Canvas to Blob failed'));
              }
            },
            'image/jpeg',
            quality
          );
        };

        img.onerror = reject;
      };

      reader.onerror = reject;
    });
  }
};
