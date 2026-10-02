/**
 * Client-side image compressor & optimizer
 * Compresses camera/gallery images from multi-megabytes to lightweight ~15-30KB web assets
 */
export interface CompressionResult {
  dataUrl: string;
  sizeKb: number;
  originalSizeKb: number;
  width: number;
  height: number;
}

export const compressImage = async (
  file: File,
  maxDimension: number = 320,
  quality: number = 0.82
): Promise<CompressionResult> => {
  return new Promise((resolve, reject) => {
    const originalSizeKb = Math.round(file.size / 1024);
    const reader = new FileReader();

    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        // Calculate proportional scale
        if (width > height) {
          if (width > maxDimension) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          }
        } else {
          if (height > maxDimension) {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Canvas 2D context not supported'));
          return;
        }

        // Draw image smoothly
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);

        // Convert to optimized JPEG format
        const dataUrl = canvas.toDataURL('image/jpeg', quality);
        // Estimate size in KB from base64 string length
        const sizeKb = Math.round((dataUrl.length * 3) / 4 / 1024);

        resolve({
          dataUrl,
          sizeKb,
          originalSizeKb,
          width,
          height,
        });
      };

      img.onerror = () => reject(new Error('فشل قراءة ملف الصورة'));
      img.src = e.target?.result as string;
    };

    reader.onerror = () => reject(new Error('تعذر قراءة الملف من الجهاز'));
    reader.readAsDataURL(file);
  });
};
