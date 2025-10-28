/* eslint-disable @typescript-eslint/no-explicit-any */
import api from './api';

// Document types based on backend schema
export interface Document {
  _id: string;
  user_id: string;
  type: 'DRIVER_LICENSE' | 'ID_CARD_FRONT' | 'ID_CARD_BACK';
  number?: string;
  expiry?: string;
  image_url: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  reviewed_by?: string;
  reviewed_at?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DocumentUpload {
  type: 'DRIVER_LICENSE' | 'ID_CARD_FRONT' | 'ID_CARD_BACK';
  file: File;
  number?: string;
  expiry?: string;
}

export interface PendingDocument {
  _id: string;
  name: string;
  email: string;
  phoneNumber?: string;
  dateOfBirth?: string;
  role: string;
  isVerified: boolean;
  verificationStatus: 'PENDING' | 'APPROVED' | 'REJECTED';
  
  // Verification images
  idCardFront?: string;
  idCardBack?: string;
  driverLicense?: string;
  selfiePhoto?: string;
  
  rejectionReason?: string;
  verifiedAt?: string;
  verifiedBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DocumentApproval {
  status: 'APPROVED' | 'REJECTED';
  rejectionReason?: string;
}

// User Profile interfaces
export interface UserProfile {
  _id: string;
  name: string;
  email: string;
  dateOfBirth?: string;
  role: string;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UserProfileUpdate {
  firstName?: string;
  lastName?: string;
  email?: string;
  phoneNumber?: string;
  dateOfBirth?: string;
}

// API Functions

/**
 * Upload file only to get URL
 * POST /upload or /files
 */
export const uploadFile = async (file: File): Promise<{ url: string }> => {
  const formData = new FormData();
  formData.append('file', file);

  
  try {
    // Try /upload first
    const response = await api.post('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    // Fallback to /files
    const response = await api.post('/files', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }
};

/**
 * Create document record with image URL
 * POST /documents
 */
export const createDocument = async (data: {
  type: 'DRIVER_LICENSE' | 'ID_CARD_FRONT' | 'ID_CARD_BACK';
  image_url: string;
  number?: string;
  expiry?: string;
}): Promise<Document> => {
  
  const response = await api.post('/documents', data);
  return response.data;
};

/**
 * Upload document (primary method)
 * POST /documents with multipart/form-data
 */
export const uploadDocument = async (documentData: DocumentUpload): Promise<Document> => {
  try {
    const formData = new FormData();
    formData.append('file', documentData.file);
    formData.append('type', documentData.type);
    
    if (documentData.number) {
      formData.append('number', documentData.number);
    }
    
    if (documentData.expiry) {
      formData.append('expiry', documentData.expiry);
    }


    const response = await api.post('/documents', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    return response.data;
  } catch (error: any) {
    console.error('Upload document error:', error);
    console.error('Error response:', error.response?.data);
    throw new Error(error.response?.data?.message || 'Failed to upload document');
  }
};

/**
 * Get user documents
 * GET /v1/documents
 */
export const getUserDocuments = async (): Promise<Document[]> => {
  const response = await api.get('/documents');
  return response.data;
};

/**
 * Get pending documents (staff/admin only)
 * GET /v1/users/verification/pending
 */
export const getPendingDocuments = async (): Promise<PendingDocument[]> => {
  try {
    console.log('📞 Calling API: GET /users/verification/pending');
    const response = await api.get('/users/verification/pending');
    console.log('📥 Raw API response:', response);
    console.log('📊 Response data:', response.data);
    
    const documents = response.data.data || response.data;
    console.log('📋 Processed documents:', documents);
    console.log('🔢 Number of documents:', Array.isArray(documents) ? documents.length : 'Not an array');
    
    return documents;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error('❌ getPendingDocuments failed:', error);
    console.error('📝 Error details:', {
      message: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data
    });
    throw error;
  }
};

/**
 * Approve or reject user verification (staff/admin only)
 * POST /v1/users/{userId}/verification/review
 */
export const approveDocument = async (
  userId: string, 
  approvalData: DocumentApproval
): Promise<Document> => {
  try {
    console.log('📞 Calling API: POST /users/' + userId + '/verification/review');
    console.log('📝 Approval data:', approvalData);
    
    const response = await api.post(`/users/${userId}/verification/review`, approvalData);
    console.log('✅ Approval response:', response.data);
    
    return response.data;
  } catch (error: any) {
    console.error('❌ approveDocument failed:', error);
    console.error('📝 Error details:', {
      message: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data
    });
    throw error;
  }
};

// Helper functions

/**
 * Get status color for document status
 */
export const getDocumentStatusColor = (status: Document['status']) => {
  switch (status) {
    case 'APPROVED':
      return 'text-green-600 bg-green-100';
    case 'REJECTED':
      return 'text-red-600 bg-red-100';
    case 'PENDING':
      return 'text-yellow-600 bg-yellow-100';
    default:
      return 'text-gray-600 bg-gray-100';
  }
};

/**
 * Get document type label
 */
export const getDocumentTypeLabel = (type: Document['type']) => {
  switch (type) {
    case 'ID_CARD_FRONT':
      return 'ID Card (Front)';
    case 'ID_CARD_BACK':
      return 'ID Card (Back)';
    case 'DRIVER_LICENSE':
      return 'Driver License';
    default:
      return 'Unknown';
  }
};


/**
 * Upload verification images for user
 * POST /v1/users/verification/upload
 */
export const uploadVerificationImages = async (images: {
  idCardFront?: string;
  idCardBack?: string;
  driverLicense?: string;
  selfiePhoto?: string;
}): Promise<any> => {
  const response = await api.post('/users/verification/upload', images);
  return response.data;
};

/**
 * Get user verification status
 * GET /v1/users/verification/status
 */
export const getVerificationStatus = async (): Promise<any> => {
  const response = await api.get('/users/verification/status');
  return response.data.data || response.data;
};


/**
 * Validate file before upload
 */
export const validateDocumentFile = (file: File): { isValid: boolean; error?: string } => {
  const maxSize = 10 * 1024 * 1024; // 10MB
  const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];

  if (!allowedTypes.includes(file.type)) {
    return {
      isValid: false,
      error: 'File type not supported. Please upload JPG, PNG, or PDF files.',
    };
  }

  if (file.size > maxSize) {
    return {
      isValid: false,
      error: 'File size too large. Maximum size is 10MB.',
    };
  }

  return { isValid: true };
};
