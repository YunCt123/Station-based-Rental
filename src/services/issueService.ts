/* eslint-disable @typescript-eslint/no-explicit-any */
import api from './api';

export type IssueStatus = 'OPEN' | 'IN_PROGRESS' | 'RESOLVED';

export interface Issue {
  _id: string;
  reporter_id: string;
  rental_id?: string;
  vehicle_id: string;
  station_id?: string;
  title: string;
  description?: string;
  photos: string[];
  status: IssueStatus;
  createdAt: string;
  updatedAt: string;
  // Populated fields
  reporter?: {
    _id: string;
    name: string;
    email: string;
    phone?: string;
    phoneNumber?: string;
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
  status?: IssueStatus;
  photos?: string[];
}

export interface GetIssuesParams {
  rental_id?: string;
  vehicle_id?: string;
  station_id?: string;
  status?: IssueStatus | string;
  limit?: number;
  page?: number;
}

/* ---------------- Customer APIs ---------------- */

// Báo cáo sự cố cho rental đang thuê
export const reportRentalIssue = async (
  rentalId: string,
  issueData: Omit<CreateIssueData, 'vehicle_id' | 'rental_id'>
): Promise<Issue> => {
  try {
    const payload = {
      ...issueData,
      rental_id: rentalId
    };
    // Try alternative endpoint if the current one doesn't work
    const res = await api.post(`/rentals/${rentalId}/report-issue`, payload);
    return res.data?.data ?? res.data;
  } catch (err: any) {
    const msg = err?.response?.data?.message ?? err?.message ?? 'Failed to report issue';
    throw new Error(msg);
  }
};

// Xem sự cố của rental cụ thể (customer view)
export const getRentalIssues = async (
  rentalId: string,
  params: Omit<GetIssuesParams, 'rental_id'> = {}
): Promise<Issue[]> => {
  try {
    const res = await api.get(`/rentals/${rentalId}/issues`, { params });
    const data = res.data;
    if (Array.isArray(data?.data)) return data.data;
    if (Array.isArray(data)) return data;
    return [];
  } catch (err: any) {
    const msg = err?.response?.data?.message ?? err?.message ?? 'Failed to fetch rental issues';
    throw new Error(msg);
  }
};

// Xem sự cố do user tạo
export const getMyIssues = async (params: GetIssuesParams = {}): Promise<Issue[]> => {
  try {
    const res = await api.get('/issues/my', { params });
    const data = res.data;
    if (Array.isArray(data?.data)) return data.data;
    if (Array.isArray(data)) return data;
    return [];
  } catch (err: any) {
    const msg = err?.response?.data?.message ?? err?.message ?? 'Failed to fetch my issues';
    throw new Error(msg);
  }
};

/* ---------------- Create Issue ---------------- */

export const createIssue = async (issueData: CreateIssueData): Promise<Issue> => {
  try {
    const res = await api.post('/issues', issueData);
    return res.data?.data ?? res.data;
  } catch (err: any) {
    const msg = err?.response?.data?.message ?? err?.message ?? 'Failed to create issue';
    throw new Error(msg);
  }
};

/* ---------------- Staff/Admin APIs ---------------- */

// Xem tất cả sự cố (staff/admin)
export const getAllIssues = async (params: GetIssuesParams = {}): Promise<Issue[]> => {
  try {
    const res = await api.get('/issues/all', { params });
    const data = res.data;
    if (Array.isArray(data?.data)) return data.data;
    if (Array.isArray(data?.issues)) return data.issues;
    if (Array.isArray(data)) return data;
    return [];
  } catch (err: any) {
    const msg = err?.response?.data?.message ?? err?.message ?? 'Failed to fetch all issues';
    throw new Error(msg);
  }
};

// Xem sự cố của rental cụ thể (staff view)
export const getStaffRentalIssues = async (
  rentalId: string,
  params: Omit<GetIssuesParams, 'rental_id'> = {}
): Promise<Issue[]> => {
  try {
    const res = await api.get(`/issues/rental/${rentalId}`, { params });
    const data = res.data;
    if (Array.isArray(data?.data)) return data.data;
    if (Array.isArray(data)) return data;
    return [];
  } catch (err: any) {
    const msg = err?.response?.data?.message ?? err?.message ?? 'Failed to fetch rental issues';
    throw new Error(msg);
  }
};

/* ---------------- Update Issue ---------------- */

// Cập nhật sự cố (admin/staff) – dùng PATCH khớp REST semantics
export const updateIssue = async (issueId: string, data: UpdateIssueData): Promise<Issue> => {
  try {
    const res = await api.patch(`/issues/${issueId}`, data);
    return res.data?.data ?? res.data;
  } catch (err: any) {
    const msg = err?.response?.data?.message ?? err?.message ?? 'Failed to update issue';
    throw new Error(msg);
  }
};

/* ---------------- Helpers ---------------- */

export const getIssueStatusText = (status: string): string => {
  switch (status) {
    case 'OPEN':
      return 'Đã báo cáo';
    case 'IN_PROGRESS':
      return 'Đang xử lý';
    case 'RESOLVED':
      return 'Đã giải quyết';
    default:
      return 'Không xác định';
  }
};

export const getIssueStatusColor = (status: string): string => {
  switch (status) {
    case 'OPEN':
      return 'bg-gray-100 text-gray-800';
    case 'IN_PROGRESS':
      return 'bg-blue-100 text-blue-800';
    case 'RESOLVED':
      return 'bg-green-100 text-green-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

export const getNextStatus = (currentStatus: string): string | null => {
  switch (currentStatus) {
    case 'OPEN':
      return 'IN_PROGRESS';
    case 'IN_PROGRESS':
      return 'RESOLVED';
    case 'RESOLVED':
      return null;
    default:
      return null;
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
  getStaffRentalIssues,
  updateIssue,

  // Helpers
  getIssueStatusText,
  getIssueStatusColor,
  getNextStatus,
};