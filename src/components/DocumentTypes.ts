// Document types for verification uploads
export const DOCUMENT_TYPES = {
  DRIVERS_LICENSE: "drivers_license",
  NATIONAL_ID_FRONT: "national_id_front", 
  NATIONAL_ID_BACK: "national_id_back",
  SELFIE_PHOTO: "selfie_photo"
} as const;

export type DocumentType = typeof DOCUMENT_TYPES[keyof typeof DOCUMENT_TYPES];