import api from './api';

// Types for Upload API responses
export interface UploadedPhoto {
  url: string;
  public_id: string;
  width: number;
  height: number;
  format: string;
  bytes: number;
}

export interface SinglePhotoUploadResponse {
  success: boolean;
  data: UploadedPhoto;
}

export interface MultiplePhotosUploadResponse {
  success: boolean;
  data: {
    photos: UploadedPhoto[];
    count: number;
  };
}

/**
 * Upload single issue photo
 * POST /api/v1/upload/single-issue-photo
 */
export const uploadSingleIssuePhoto = async (file: File): Promise<UploadedPhoto> => {
  try {
    const formData = new FormData();
    formData.append('image', file);

    const response = await api.post('/upload/single-issue-photo', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data.data;
  } catch (error: unknown) {
    console.error('Error uploading single issue photo:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to upload photo';
    throw errorMessage;
  }
};

/**
 * Upload multiple issue photos
 * POST /api/v1/upload/issue-photos
 */
export const uploadIssuePhotos = async (files: File[]): Promise<UploadedPhoto[]> => {
  try {
    if (files.length > 10) {
      throw new Error('Maximum 10 photos allowed per issue');
    }

    const formData = new FormData();
    files.forEach((file) => {
      formData.append('photos', file);
    });

    const response = await api.post('/upload/issue-photos', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data.data.photos;
  } catch (error: unknown) {
    console.error('Error uploading issue photos:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to upload photos';
    throw errorMessage;
  }
};

/**
 * File validation functions
 */

export const validateFiles = (files: File[]): { valid: boolean; error?: string } => {
  const maxSize = 5 * 1024 * 1024; // 5MB per file
  const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
  const maxCount = 10;

  if (files.length > maxCount) {
    return {
      valid: false,
      error: `Tối đa ${maxCount} ảnh được cho phép`
    };
  }

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    
    if (!allowedTypes.includes(file.type)) {
      return {
        valid: false,
        error: `Ảnh ${file.name} không đúng định dạng. Chỉ cho phép JPEG, PNG`
      };
    }

    if (file.size > maxSize) {
      return {
        valid: false,
        error: `Ảnh ${file.name} quá lớn. Tối đa 5MB`
      };
    }
  }

  return { valid: true };
};

/**
 * Image compression helper (optional)
 */
export const compressImage = async (file: File, maxWidth = 1920, quality = 0.8): Promise<File> => {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;
    const img = new Image();

    img.onload = () => {
      // Calculate new dimensions
      const ratio = Math.min(maxWidth / img.width, maxWidth / img.height);
      const newWidth = img.width * ratio;
      const newHeight = img.height * ratio;

      canvas.width = newWidth;
      canvas.height = newHeight;

      // Draw and compress
      ctx.drawImage(img, 0, 0, newWidth, newHeight);
      
      canvas.toBlob((blob) => {
        if (blob) {
          const compressedFile = new File([blob], file.name, {
            type: file.type,
            lastModified: Date.now()
          });
          resolve(compressedFile);
        } else {
          resolve(file);
        }
      }, file.type, quality);
    };

    img.src = URL.createObjectURL(file);
  });
};

export default {
  uploadSingleIssuePhoto,
  uploadIssuePhotos,
  validateFiles,
  compressImage
};