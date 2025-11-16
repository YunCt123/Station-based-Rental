import api from './api';

// ✅ Interfaces based on API documentation
export interface IssueListItem {
  _id: string;
  title: string;
  description: string;
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  photos: string[];
  rental_id?: {
    _id: string;
    status: string;
    pickup: {
      datetime: string;
      location: string;
    };
    return: {
      datetime: string;
      location: string;
    };
  };
  vehicle_id?: {
    _id: string;
    name: string;
    brand: string;
    model: string;
    licensePlate: string;
    image: string;
  };
  station_id?: {
    _id: string;
    name: string;
    address: string;
    coordinates: [number, number];
  };
  createdAt: string;
  updatedAt: string;
}

export interface StaffInfo {
  _id: string;
  name: string;
  email: string;
  role: string;
}

export interface IssueResolution {
  solution_description: string;
  resolution_actions: string[];
  resolved_by: StaffInfo;
  resolved_at: string;
  resolution_notes: string;
  resolution_photos: string[];
  customer_satisfaction: 'SATISFIED' | 'NEUTRAL' | 'UNSATISFIED' | 'NOT_RATED';
  follow_up_required: boolean;
  estimated_cost: number;
  actual_cost: number;
}

export interface DetailedRental {
  _id: string;
  status: string;
  start_at: string;
  end_at: string;
  pickup: {
    datetime: string;
    location: string;
  };
  return: {
    datetime: string;
    location: string;
  };
  pricing_snapshot: {
    total_price: number;
    currency: string;
  };
  booking_id: {
    _id: string;
    start_at: string;
    end_at: string;
    status: string;
  };
}

export interface DetailedVehicle {
  _id: string;
  name: string;
  brand: string;
  model: string;
  year: number;
  licensePlate: string;
  image: string;
  type: string;
  seats: number;
  battery_kWh: number;
  range: number;
}

export interface DetailedStation {
  _id: string;
  name: string;
  address: string;
  city: string;
  coordinates: [number, number];
  contact_info: {
    phone: string;
    email: string;
  };
  operating_hours: Record<string, string>;
}

export interface IssueDetailData {
  _id: string;
  title: string;
  description: string;
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  photos: string[];
  rental_id?: DetailedRental;
  vehicle_id?: DetailedVehicle;
  station_id?: DetailedStation;
  assigned_to?: StaffInfo;
  resolution?: IssueResolution;
  createdAt: string;
  updatedAt: string;
}

export interface GetCustomerIssuesParams {
  rental_id?: string;
  status?: string;
  limit?: number;
  page?: number;
}

export interface IssueListResponse {
  success: boolean;
  data: IssueListItem[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    hasMore: boolean;
  };
}

export interface IssueDetailResponse {
  success: boolean;
  message: string;
  data: IssueDetailData;
}

class CustomerIssueService {
  /**
   * Get all issues for the logged-in customer
   */
  async getCustomerIssues(params?: GetCustomerIssuesParams): Promise<IssueListResponse> {
    try {
      console.log('📡 [CustomerIssueService] Getting customer issues with params:', params);

      const searchParams = new URLSearchParams();
      
      if (params?.rental_id) searchParams.append('rental_id', params.rental_id);
      if (params?.status) searchParams.append('status', params.status);
      if (params?.limit) searchParams.append('limit', params.limit.toString());
      if (params?.page) searchParams.append('page', params.page.toString());

      const queryString = searchParams.toString();
      const endpoint = queryString ? `/issues/?${queryString}` : '/issues/';

      const response = await api.get(endpoint);
      console.log('✅ [CustomerIssueService] Raw API response:', response);

      // ✅ Extract data safely - API might return { success: true, data: [...] } or directly [...]
      let issuesData: IssueListItem[] = [];
      
      if (Array.isArray(response)) {
        issuesData = response;
      } else if (response?.data && Array.isArray(response.data)) {
        issuesData = response.data;
      } else if (response?.success && response?.data && Array.isArray(response.data)) {
        issuesData = response.data;
      }

      console.log('📦 [CustomerIssueService] Extracted issues array:', issuesData.length, 'items');

      return {
        success: true,
        data: issuesData,
        pagination: response.pagination || response?.pagination
      };

    } catch (error) {
      console.error('❌ [CustomerIssueService] Error fetching customer issues:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to fetch customer issues');
    }
  }

  /**
   * Get detailed info about specific issue including staff resolution
   */
  async getIssueDetail(issueId: string): Promise<IssueDetailResponse> {
    try {
      console.log('📡 [CustomerIssueService] Getting issue detail for ID:', issueId);

      if (!issueId) {
        throw new Error('Issue ID is required');
      }

      const response = await api.get(`/issues/${issueId}/detail`);
      console.log('✅ [CustomerIssueService] Issue detail response:', response);

      return {
        success: true,
        message: 'Issue detail retrieved successfully',
        data: response.data
      };

    } catch (error) {
      console.error('❌ [CustomerIssueService] Error fetching issue detail:', error);
      
      if (error instanceof Error) {
        // Handle specific API errors
        if (error.message.includes('404') || error.message.includes('Not Found')) {
          throw new Error('Không tìm thấy báo cáo sự cố');
        }
        if (error.message.includes('403') || error.message.includes('Forbidden')) {
          throw new Error('Bạn chỉ có thể xem báo cáo của chính mình');
        }
        throw new Error(error.message);
      }
      
      throw new Error('Failed to fetch issue detail');
    }
  }

  /**
   * Create a new issue (if needed for customer issue reporting)
   */
  async createIssue(issueData: {
    title: string;
    description: string;
    rental_id?: string;
    vehicle_id?: string;
    photos?: string[];
    priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  }): Promise<IssueDetailData> {
    try {
      console.log('📡 [CustomerIssueService] Creating new issue:', issueData);

      const endpoint = issueData.rental_id 
        ? `/issues/rental/${issueData.rental_id}`
        : '/issues/';

      const response = await api.post(endpoint, issueData);
      console.log('✅ [CustomerIssueService] Issue created successfully:', response);

      return response.data;

    } catch (error) {
      console.error('❌ [CustomerIssueService] Error creating issue:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to create issue');
    }
  }
}

// Export singleton instance
export const customerIssueService = new CustomerIssueService();
export default customerIssueService;