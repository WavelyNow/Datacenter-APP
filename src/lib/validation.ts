import { PipeSegment, EquipmentItem } from './types';

export const VALIDATION_LIMITS = {
  MAX_IMAGE_SIZE_BYTES: 5 * 1024 * 1024, // 5MB
  MAX_EQUIPMENT_PHOTOS: 10,
  MAX_SEGMENTS: 100,
  MAX_EQUIPMENT_ITEMS: 50,
  MIN_PIPE_LENGTH: 0.1,
  MAX_PIPE_LENGTH: 10000,
  MIN_GLYCOL_PERCENTAGE: 0,
  MAX_GLYCOL_PERCENTAGE: 100,
} as const;

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export const validateBase64Image = (base64: string): ValidationResult => {
  const errors: string[] = [];

  // Check format
  const imageFormatRegex = /^data:image\/(png|jpeg|jpg|webp);base64,/;
  if (!imageFormatRegex.test(base64)) {
    errors.push('Invalid image format. Only PNG, JPEG, and WebP are allowed.');
  }

  // Check size
  const sizeInBytes = (base64.length * 3) / 4;
  if (sizeInBytes > VALIDATION_LIMITS.MAX_IMAGE_SIZE_BYTES) {
    errors.push(`Image size exceeds ${VALIDATION_LIMITS.MAX_IMAGE_SIZE_BYTES / 1024 / 1024}MB limit.`);
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

export const validatePipeSegment = (segment: PipeSegment): ValidationResult => {
  const errors: string[] = [];

  if (!segment.material) {
    errors.push('Material is required');
  }

  if (segment.material !== 'custom' && !segment.size) {
    errors.push('Size is required');
  }

  if (segment.length < VALIDATION_LIMITS.MIN_PIPE_LENGTH) {
    errors.push(`Length must be at least ${VALIDATION_LIMITS.MIN_PIPE_LENGTH}m`);
  }

  if (segment.length > VALIDATION_LIMITS.MAX_PIPE_LENGTH) {
    errors.push(`Length cannot exceed ${VALIDATION_LIMITS.MAX_PIPE_LENGTH}m`);
  }

  if (segment.material === 'custom') {
    if (!segment.customInnerDiameter || segment.customInnerDiameter <= 0) {
      errors.push('Custom inner diameter must be greater than 0');
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

export const validateEquipmentItem = (item: EquipmentItem): ValidationResult => {
  const errors: string[] = [];

  // Name is no longer strictly required - will use fallback in PDF
  // if (!item.name || item.name.trim() === '') {
  //   errors.push('Equipment name is required');
  // }

  if (item.volume < 0) {
    errors.push('Volume cannot be negative');
  }

  if (item.weight < 0) {
    errors.push('Weight cannot be negative');
  }

  if (item.photos && item.photos.length > VALIDATION_LIMITS.MAX_EQUIPMENT_PHOTOS) {
    errors.push(`Maximum ${VALIDATION_LIMITS.MAX_EQUIPMENT_PHOTOS} photos allowed`);
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

export const sanitizeProjectName = (name: string): string => {
  // Remove special characters that could cause file system issues
  return name.replace(/[^a-zA-Z0-9_\-\s]/g, '').trim();
};

/** Validare la upload (client): dimensiune + tip. Întoarce mesaj de eroare sau null. */
export function validateUploadFile(file: File, maxMb: number, allowedTypes: string[] = ['image/png', 'image/jpeg', 'image/webp']): string | null {
    if (!file) return 'Fișier lipsă';
    if (file.size > maxMb * 1024 * 1024) {
        return `Fișierul depășește ${maxMb} MB (are ${(file.size / 1024 / 1024).toFixed(1)} MB)`;
    }
    if (allowedTypes.length && !allowedTypes.includes(file.type)) {
        return `Tip neacceptat: ${file.type || 'necunoscut'}`;
    }
    return null;
}
