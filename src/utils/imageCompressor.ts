/**
 * Utility to compress image files or base64 data URLs before saving to Firestore.
 * Firestore document size limit is 1 MiB (1,048,576 bytes).
 * This compresses images to JPEG/WebP format with max dimensions (1200x1200px) and quality (~0.75),
 * ensuring the resulting base64 string is under ~150-200 KB.
 */
export function compressImage(
  input: File | string,
  maxWidth = 1200,
  maxHeight = 1200,
  quality = 0.75
): Promise<string> {
  return new Promise((resolve) => {
    const processSrc = (src: string) => {
      // If it's a normal web URL, no need to compress base64
      if (!src.startsWith('data:image')) {
        resolve(src);
        return;
      }

      // If base64 string is already very small (under ~200 KB), return as-is
      if (src.length < 250000) {
        resolve(src);
        return;
      }

      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > maxWidth || height > maxHeight) {
          if (width / height > maxWidth / maxHeight) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          } else {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(src);
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);

        // Export as compressed image/jpeg
        const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(compressedDataUrl);
      };

      img.onerror = (err) => {
        console.warn('Image load error during compression, using original', err);
        resolve(src);
      };

      img.src = src;
    };

    if (input instanceof File) {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (typeof e.target?.result === 'string') {
          processSrc(e.target.result);
        } else {
          resolve('');
        }
      };
      reader.onerror = () => resolve('');
      reader.readAsDataURL(input);
    } else if (typeof input === 'string') {
      processSrc(input);
    } else {
      resolve('');
    }
  });
}
