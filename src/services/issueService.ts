/* eslint-disable @typescript-eslint/no-explicit-any */
import api from './api';

export interface Issue {
  _id: string;
  reporter_id: string;
  rental_id?: string;
  vehicle_id: string;
  station_id?: string;
  title: string;
  description?: string;
  photos: string[];
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED';
  createdAt: string;
  updatedAt: string;
  // Populated fields
  reporter?: {
    _id: string;
    name: string;
    email: string;
  };
  vehicle?: {
    _id: string;
    name?: string;
    model: string;
    licensePlate: string;
  };
  station?: {
    _id: string;
    name: string;
    address: string;
  };
}

export interface CreateIssueData {
  vehicle_id?: string;
  station_id?: string;
  rental_id?: string;
  title: string;
  description?: string;
  photos?: string[];
}

export interface UpdateIssueData {
  title?: string;
  description?: string;
  status?: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED';
  photos?: string[];
}

export interface GetIssuesParams {
  rental_id?: string;
  vehicle_id?: string;
  station_id?: string;
  status?: string;
  limit?: number;
  page?: number;
}

/**
 * Customer APIs
 */

// Báo cáo sự cố cho rental đang thuê
export const reportRentalIssue = async (rentalId: string, issueData: Omit<CreateIssueData, 'vehicle_id' | 'rental_id'>): Promise<Issue> => {
  try {
    const response = await api.post(`/rentals/${rentalId}/report-issue`, issueData);
    return response.data.data;
  } catch (error: any) {
    console.error('Error reporting rental issue:', error);
    throw error?.response?.data?.message || error?.message || 'Failed to report issue';
  }
};

// Xem sự cố của rental cụ thể (customer view)
export const getRentalIssues = async (rentalId: string, params: Omit<GetIssuesParams, 'rental_id'> = {}): Promise<Issue[]> => {
  try {
    const response = await api.get(`/rentals/${rentalId}/issues`, { params });
    const data = response.data;
    if (data.data && Array.isArray(data.data)) {
      return data.data;
    }
    return Array.isArray(data) ? data : [];
  } catch (error: any) {
    console.error('Error fetching rental issues:', error);
    throw error?.response?.data?.message || error?.message || 'Failed to fetch rental issues';
  }
};

// Xem tất cả sự cố của customer
export const getMyIssues = async (params: GetIssuesParams = {}): Promise<Issue[]> => {
  try {
    const response = await api.get('/issues', { params });
    const data = response.data;
    if (data.data && Array.isArray(data.data)) {
      return data.data;
    }
    return Array.isArray(data) ? data : [];
  } catch (error: any) {
    console.error('Error fetching my issues:', error);
    throw error?.response?.data?.message || error?.message || 'Failed to fetch issues';
  }
};

/**
 * Create a new issue
 * POST /v1/issues
 */
export const createIssue = async (issueData: CreateIssueData): Promise<Issue> => {
  try {
    const response = await api.post('/issues', issueData);
    return response.data.data || response.data;
  } catch (error: any) {
    console.error('Error creating issue:', error);
    throw error?.response?.data?.message || error?.message || 'Failed to create issue';
  }
};

/**
 * Staff/Admin APIs
 */

// Xem tất cả sự cố (staff/admin)
export const getAllIssues = async (params: GetIssuesParams = {}): Promise<Issue[]> => {
  try {
    const response = await api.get('/issues/all', { params });
    const data = response.data;
    if (data.data && Array.isArray(data.data)) {
      return data.data;
    }
    if (data.issues && Array.isArray(data.issues)) {
      return data.issues;
    }
    return Array.isArray(data) ? data : [];
  } catch (error: any) {
    console.error('Error fetching all issues:', error);
    throw error?.response?.data?.message || error?.message || 'Failed to fetch all issues';
  }
};

// Xem sự cố của rental cụ thể (staff view)
export const getStaffRentalIssues = async (rentalId: string, params: Omit<GetIssuesParams, 'rental_id'> = {}): Promise<Issue[]> => {
  try {
    const response = await api.get(`/issues/rental/${rentalId}`, { params });
    const data = response.data;
    if (data.data && Array.isArray(data.data)) {
      return data.data;
    }
    return Array.isArray(data) ? data : [];
  } catch (error: any) {
    console.error('Error fetching staff rental issues:', error);
    throw error?.response?.data?.message || error?.message || 'Failed to fetch rental issues';
  }
};

/**
 * Update an issue (staff/admin only)
 * PATCH /v1/issues/{id}
 */
export const updateIssue = async (id: string, updateData: UpdateIssueData): Promise<Issue> => {
  try {
    const response = await api.patch(`/issues/${id}`, updateData);
    return response.data.data || response.data;
  } catch (error: any) {
    console.error('Error updating issue:', error);
    throw error?.response?.data?.message || error?.message || 'Failed to update issue';
  }
};

/**
 * Helper functions
 */

// Get status display text
export const getIssueStatusText = (status: string): string => {
  switch (status) {
    case 'OPEN': return 'Đã báo cáo';
    case 'IN_PROGRESS': return 'Đang xử lý';
    case 'RESOLVED': return 'Đã giải quyết';
    default: return 'Không xác định';
  }
};

// Get status color class
export const getIssueStatusColor = (status: string): string => {
  switch (status) {
    case 'OPEN': return 'bg-gray-100 text-gray-800';
    case 'IN_PROGRESS': return 'bg-blue-100 text-blue-800';
    case 'RESOLVED': return 'bg-green-100 text-green-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

// Get next status transition
export const getNextStatus = (currentStatus: string): string | null => {
  switch (currentStatus) {
    case 'OPEN': return 'IN_PROGRESS';
    case 'IN_PROGRESS': return 'RESOLVED';
    case 'RESOLVED': return null;
    default: return null;
  }
};

export default {
  // Customer APIs
  reportRentalIssue,
  getRentalIssues,
  getMyIssues,
  createIssue,
  
  // Staff APIs
  getAllIssues,
  updateIssue,
  getStaffRentalIssues,
  
  // Helpers
  getIssueStatusText,
  getIssueStatusColor,
  getNextStatus
};
