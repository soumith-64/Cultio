/**
 * CULTIVO — Image Validation, Compression & Storage Service
 * Handles mobile image resizing/compression and upload to Firebase Storage or local fallback
 */

import { storage, isFirebaseConfigured } from '@/config/firebase';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';

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
   * Upload image to Firebase Storage (or return local dataURL if mock mode)
   */
  public static async uploadCropImage(
    file: File,
    userId: string,
    onProgress?: UploadProgressCallback
  ): Promise<{ downloadUrl: string; storagePath: string }> {
    // If Firebase Storage is not configured, simulate upload with progress
    if (!isFirebaseConfigured || !storage) {
      if (onProgress) {
        onProgress(20);
        await new Promise((r) => setTimeout(r, 200));
        onProgress(65);
        await new Promise((r) => setTimeout(r, 200));
        onProgress(100);
      }

      // Convert file to permanent Data URL for in-memory / local storage demo
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          resolve({
            downloadUrl: reader.result as string,
            storagePath: `local_storage/crops/${userId}/${Date.now()}_${file.name}`,
          });
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
    }

    // Real Firebase Storage upload
    const cleanFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const storagePath = `crop_images/${userId}/${Date.now()}_${cleanFileName}`;
    const storageRef = ref(storage, storagePath);

    return new Promise((resolve, reject) => {
      const uploadTask = uploadBytesResumable(storageRef, file, {
        contentType: file.type || 'image/jpeg',
        customMetadata: {
          uploadedBy: userId,
          uploadedAt: new Date().toISOString(),
          app: 'Cultivo',
        },
      });

      uploadTask.on(
        'state_changed',
        (snapshot) => {
          const progress = Math.round(
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100
          );
          if (onProgress) onProgress(progress);
        },
        (error) => {
          console.error('[Firebase Storage] Upload error:', error);
          reject(new Error(`Failed to upload crop image: ${error.message}`));
        },
        async () => {
          try {
            const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
            resolve({ downloadUrl, storagePath });
          } catch (err: any) {
            reject(new Error(`Failed to retrieve image download URL: ${err.message}`));
          }
        }
      );
    });
  }
}
