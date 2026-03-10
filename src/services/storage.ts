/**
 * Cloudinary Object Storage Service
 * 
 * - Multipart upload
 * - Image optimization
 * - CDN delivery
 * - Auto format (WebP, AVIF)
 * 
 * Використання:
 * import storage from './services/storage';
 * 
 * const result = await storage.uploadImage(base64String);
 * console.log(result.url); // https://res.cloudinary.com/.../image.jpg
 */

import { v2 as cloudinary } from 'cloudinary';
import config from '../config';

// Ініціалізація Cloudinary
if (config.cloudinary.enabled) {
  cloudinary.config({
    cloud_name: config.cloudinary.cloudName,
    api_key: config.cloudinary.apiKey,
    api_secret: config.cloudinary.apiSecret,
  });
  console.log('✅ Cloudinary initialized');
} else {
  console.warn('⚠️  Cloudinary not configured, using fallback');
}

export interface UploadResult {
  url: string;
  publicId: string;
  format: string;
  bytes: number;
}

/**
 * Завантажити зображення в Cloudinary
 * @param base64Image Base64 string (data:image/jpeg;base64,...)
 * @param folder Папка в Cloudinary (напр. 'reports')
 */
export async function uploadImage(
  base64Image: string,
  folder: string = 'reports'
): Promise<UploadResult> {
  if (!config.cloudinary.enabled) {
    // Fallback: повертаємо placeholder
    console.warn('⚠️  Cloudinary not configured, returning placeholder');
    return {
      url: 'https://via.placeholder.com/400x300?text=Image+Not+Configured',
      publicId: 'placeholder',
      format: 'jpg',
      bytes: 0,
    };
  }

  try {
    // Видалити data:image/jpeg;base64, префікс
    const base64Data = base64Image.replace(/^data:image\/\w+;base64,/, '');

    // Завантажити в Cloudinary
    const result = await new Promise<any>((resolve, reject) => {
      cloudinary.uploader.upload(
        `data:image/jpeg;base64,${base64Data}`,
        {
          folder: `gentrust/${folder}`,
          transformation: [
            { width: 1920, height: 1920, crop: 'limit' }, // Max size
            { quality: 'auto:good' }, // Auto quality
            { format: 'auto' }, // Auto format (WebP, AVIF, etc.)
          ],
          resource_type: 'auto',
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
    });

    return {
      url: result.secure_url,
      publicId: result.public_id,
      format: result.format,
      bytes: result.bytes,
    };
  } catch (error: any) {
    console.error('❌ Cloudinary upload error:', error.message);
    throw new Error('Failed to upload image');
  }
}

/**
 * Видалити зображення з Cloudinary
 * @param publicId Public ID зображення
 */
export async function deleteImage(publicId: string): Promise<void> {
  if (!config.cloudinary.enabled) {
    return;
  }

  try {
    await cloudinary.uploader.destroy(publicId);
    console.log(`✅ Deleted image: ${publicId}`);
  } catch (error: any) {
    console.error('❌ Cloudinary delete error:', error.message);
  }
}

/**
 * Отримати URL зображення з трансформаціями
 * @param publicId Public ID зображення
 * @param transformations Трансформації (напр. { width: 300, height: 300 })
 */
export function getImageUrl(
  publicId: string,
  transformations?: { width?: number; height?: number; crop?: string }
): string {
  if (!config.cloudinary.enabled) {
    return 'https://via.placeholder.com/400x300';
  }

  const transformationsStr = transformations
    ? `${transformations.width || 400}x${transformations.height || 400}/${transformations.crop || 'crop'}/`
    : '';

  return cloudinary.url(publicId, {
    transformation: transformations
      ? [
          {
            width: transformations.width || 400,
            height: transformations.height || 400,
            crop: transformations.crop || 'crop',
          },
        ]
      : undefined,
    secure: true,
  });
}

// Export default
export default {
  uploadImage,
  deleteImage,
  getImageUrl,
};
