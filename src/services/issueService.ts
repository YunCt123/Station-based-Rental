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
  vehicle_id: string;
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

/**
 * Create a new issue
 * POST /v1/issues
 */
export const createIssue = async (issueData: CreateIssueData): Promise<Issue> => {
  try {
    const response = await api.post('/issues', issueData);
    return response.data;
  } catch (error: any) {
    console.error('Error creating issue:', error);
    throw error?.message || 'Failed to create issue';
  }
};

/**
 * Get user's issues (customer/staff own issues)
 * GET /v1/issues
 */
// export const getUserIssues = async (): Promise<Issue[]> => {
//   try {
//     const response = await api.get('/issues');
//     // Handle both array and object responses
//     const data = response.data;
//     // If response is { data: [...] } or { issues: [...] }
//     if (data.data && Array.isArray(data.data)) {
//         return data.data;
//     }
//     if (data.issues && Array.isArray(data.issues)) {
//         return data.issues;
//     }
//     // If response is already an array
//     if (Array.isArray(data)) {
//         return data;
//     }
//     // If none of the above, return empty array
//     console.warn('Unexpected response format:', data);
//     return [];
//   } catch (error: any) {
//     console.error('Error fetching user issues:', error);
//     throw error?.message || 'Failed to fetch issues';
//   }
// };

export const getAllIssues = async (): Promise<Issue[]> => {
    try {
        const response = await api.get('/issues/all');
        // Handle both array and object responses
        const data = response.data;
        // If response is { data: [...] } or { issues: [...] }
        if (data.data && Array.isArray(data.data)) {
            return data.data;
        }
        if (data.issues && Array.isArray(data.issues)) {
            return data.issues;
        }
        // If response is already an array
        if (Array.isArray(data)) {
            return data;
        }
        // If none of the above, return empty array
        console.warn('Unexpected response format:', data);
        return [];
    } catch (error: any) {
        console.error('Error fetching all issues:', error);
        throw error?.message || 'Failed to fetch all issues';
    }
};

/**
 * Update an issue (staff/admin only)
 * PATCH /v1/issues/{id}
 */
export const updateIssue = async (id: string, updateData: UpdateIssueData): Promise<Issue> => {
  try {
    const response = await api.patch(`/issues/${id}`, updateData);
    return response.data;
  } catch (error: any) {
    console.error('Error updating issue:', error);
    throw error?.message || 'Failed to update issue';
  }
};
