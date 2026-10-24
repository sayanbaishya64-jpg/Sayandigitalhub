import { compressImage } from '../utils/imageCompressor';

/**
 * Cloudinary Unsigned Upload Utility for SAYAN DIGITAL HUB
 * Uses Cloudinary REST endpoint with an unsigned upload preset.
 * No API secrets are exposed on the frontend.
 */

export interface CloudinaryUploadResult {
  url: string;
  publicId?: string;
  bytes?: number;
  format?: string;
  isCloudinary: boolean;
  error?: string;
}

/**
 * Returns true if Cloudinary environment variables are configured.
 */
export function isCloudinaryConfigured(): boolean {
  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;
  return Boolean(cloudName && cloudName.trim() && uploadPreset && uploadPreset.trim());
}

/**
 * Uploads an image (File, Blob, or base64 data URL) to Cloudinary.
 * If Cloudinary env vars are missing or upload fails, falls back gracefully to a high-efficiency compressed data URL.
 */
export async function uploadImageToCloudinary(
  input: File | Blob | string,
  options?: { folder?: string; maxBytes?: number }
): Promise<CloudinaryUploadResult> {
  const maxAllowedBytes = options?.maxBytes || 10 * 1024 * 1024; // 10MB default limit

  // 1. File Size Validation
  if (input instanceof File || input instanceof Blob) {
    if (input.size > maxAllowedBytes) {
      throw new Error(`File size (${(input.size / (1024 * 1024)).toFixed(1)} MB) exceeds maximum allowed limit of ${(maxAllowedBytes / (1024 * 1024)).toFixed(0)} MB.`);
    }
  }

  let fileOrString: File | string;
  if (input instanceof File) {
    fileOrString = input;
  } else if (input instanceof Blob) {
    fileOrString = new File([input], 'upload.jpg', { type: input.type || 'image/jpeg' });
  } else {
    fileOrString = input;
  }

  // 2. Compress image to optimal dimensions (~1200x1200px) before upload
  let compressedDataUrl = '';
  try {
    compressedDataUrl = await compressImage(fileOrString, 1200, 1200, 0.8);
  } catch (err) {
    console.warn('Image compression fallback notice:', err);
  }

  const cloudName = (import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || '').trim();
  const uploadPreset = (import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || '').trim();

  // 3. If Cloudinary env vars are not set, return compressed base64 JPEG fallback
  if (!cloudName || !uploadPreset) {
    console.info('Cloudinary environment variables not found (VITE_CLOUDINARY_CLOUD_NAME / VITE_CLOUDINARY_UPLOAD_PRESET). Using optimized compressed storage.');
    return {
      url: compressedDataUrl || (typeof input === 'string' ? input : ''),
      isCloudinary: false
    };
  }

  // 4. Perform Unsigned Upload to Cloudinary REST Endpoint
  const endpoint = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;
  const formData = new FormData();

  // If input is a File, attach directly or attach compressed data URL
  if (input instanceof File) {
    formData.append('file', input);
  } else if (compressedDataUrl) {
    formData.append('file', compressedDataUrl);
  } else if (typeof input === 'string') {
    formData.append('file', input);
  } else {
    throw new Error('Invalid image format provided for upload.');
  }

  formData.append('upload_preset', uploadPreset);
  if (options?.folder) {
    formData.append('folder', options.folder);
  } else {
    formData.append('folder', 'sayan_digital_hub/banners');
  }

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      body: formData
    });

    const data = await response.json();

    if (!response.ok) {
      console.warn('Cloudinary upload endpoint returned error:', data);
      const errorMessage = data?.error?.message || `Cloudinary upload failed with status ${response.status}`;
      // Fallback to compressed base64 if Cloudinary preset throws an error (e.g. invalid preset name)
      if (compressedDataUrl) {
        console.warn('Falling back to compressed base64 image payload due to Cloudinary error:', errorMessage);
        return {
          url: compressedDataUrl,
          isCloudinary: false,
          error: `Cloudinary notice: ${errorMessage}. Image preserved via compressed fallback.`
        };
      }
      throw new Error(errorMessage);
    }

    if (!data.secure_url) {
      throw new Error('Cloudinary response did not contain a valid secure HTTPS image URL.');
    }

    return {
      url: data.secure_url,
      publicId: data.public_id,
      bytes: data.bytes,
      format: data.format,
      isCloudinary: true
    };
  } catch (err: any) {
    console.error('Cloudinary API upload error:', err);
    if (compressedDataUrl) {
      return {
        url: compressedDataUrl,
        isCloudinary: false,
        error: err.message || 'Cloudinary upload failed. Preserved image via compressed storage.'
      };
    }
    throw new Error(`Failed to upload banner image: ${err.message || 'Network error'}`);
  }
}
