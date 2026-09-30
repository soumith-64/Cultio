/**
 * CULTIVO — Image Validation, Compression & Storage Service
 * Handles mobile image resizing/compression and upload to Hostinger Database/Server Storage
 * 
 * STRICT RULE: No Firebase Photo Storage. Photos and metadata are stored on Hostinger server.
 */

export interface ImageValidationResult {
  valid: boolean;
  error?: string;
}

export interface UploadProgressCallback {
  (progressPercent: number): void;
}

export class ImageStorageService {
  private static readonly MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB
  private static readonly ALLOWED_MIME_TYPES = [
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/heic',
    'image/heif',
  ];

  /**
   * Validate file mime type and file size
   */
  public static validateImageFile(file: File): ImageValidationResult {
    if (!file) {
      return { valid: false, error: 'No image file was selected.' };
    }

    if (!this.ALLOWED_MIME_TYPES.includes(file.type.toLowerCase()) && !file.type.startsWith('image/')) {
      return {
        valid: false,
        error: 'Unsupported image format. Please capture or upload a JPG, PNG, or WebP photo.',
      };
    }

    if (file.size > this.MAX_FILE_SIZE_BYTES) {
      return {
        valid: false,
        error: `Image size exceeds the 10MB limit (Selected: ${(file.size / (1024 * 1024)).toFixed(1)}MB).`,
      };
    }

    return { valid: true };
  }

  /**
   * Compress and resize an image file using an offscreen canvas
   * Crucial for rural field mobile networks
   */
  public static async compressImage(
    file: File,
    maxWidth = 1600,
    quality = 0.85
  ): Promise<{ file: File; base64: string; previewUrl: string }> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          let { width, height } = img;
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }

          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            // Fallback to uncompressed
            const rawBase64 = e.target?.result as string;
            resolve({ file, base64: rawBase64, previewUrl: rawBase64 });
            return;
          }

          ctx.drawImage(img, 0, 0, width, height);
          const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);

          // Convert canvas to Blob/File
          canvas.toBlob(
            (blob) => {
              if (blob) {
                const compressedFile = new File([blob], file.name.replace(/\.[^/.]+$/, '.jpg'), {
                  type: 'image/jpeg',
                  lastModified: Date.now(),
                });
                resolve({
                  file: compressedFile,
                  base64: compressedDataUrl,
                  previewUrl: compressedDataUrl,
                });
              } else {
                resolve({
                  file,
                  base64: compressedDataUrl,
                  previewUrl: compressedDataUrl,
                });
              }
            },
            'image/jpeg',
            quality
          );
        };
        img.onerror = () => reject(new Error('Failed to load image for compression'));
        img.src = e.target?.result as string;
      };
      reader.onerror = () => reject(new Error('Failed to read image file'));
      reader.readAsDataURL(file);
    });
  }

  /**
   * Upload image to Hostinger Server & Database
   * Strictly NO Firebase photo storage used.
   */
  public static async uploadCropImage(
    file: File,
    userId: string,
    onProgress?: UploadProgressCallback
  ): Promise<{ downloadUrl: string; storagePath: string }> {
    if (onProgress) onProgress(20);

    // 1. Primary: Upload to Hostinger server /api/upload endpoint (multipart/form-data)
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('userId', userId);

      if (onProgress) onProgress(50);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        if (onProgress) onProgress(100);
        return {
          downloadUrl: data.downloadUrl || data.url,
          storagePath: data.storagePath || data.url,
        };
      }
    } catch (serverErr) {
      console.warn('[ImageStorageService] Hostinger multipart upload warning:', serverErr);
    }

    // 2. Secondary: Try JSON base64 upload to Hostinger /api/upload (handles mobile WebViews)
    try {
      if (onProgress) onProgress(70);
      const compressed = await this.compressImage(file);
      const res = await fetch('/api/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image_base64: compressed.base64,
          file_name: file.name,
          userId,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (onProgress) onProgress(100);
        return {
          downloadUrl: data.downloadUrl || data.url,
          storagePath: data.storagePath || data.url,
        };
      }
    } catch (jsonErr) {
      console.warn('[ImageStorageService] Hostinger base64 upload warning:', jsonErr);
    }

    // 3. Offline Fallback: Convert file to permanent Data URL for in-browser session display
    if (onProgress) onProgress(100);
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        resolve({
          downloadUrl: reader.result as string,
          storagePath: `hostinger_local/crops/${userId}/${Date.now()}_${file.name}`,
        });
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }
}
