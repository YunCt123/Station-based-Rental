import { useState, useEffect, useCallback } from 'react';
import { checkUserActiveRental, getUserActiveRental } from '../../services/customerService';
import type { Rental } from '../../services/customerService';

export interface ActiveRentalState {
  hasActiveRental: boolean;
  activeRental: Rental | null;
  statusMessage?: string;
  isLoading: boolean;
  error: string | null;
}

/**
 * Hook to check if user has any active rental
 * Used for validation before creating new bookings
 */
export const useActiveRental = () => {
  const [state, setState] = useState<ActiveRentalState>({
    hasActiveRental: false,
    activeRental: null,
    isLoading: false,
    error: null
  });

  const checkActive = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const result = await checkUserActiveRental();
      setState({
        hasActiveRental: result.hasActiveRental,
        activeRental: result.activeRental,
        statusMessage: result.statusMessage,
        isLoading: false,
        error: null
      });
      
      return result;
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error.message || 'Không thể kiểm tra trạng thái thuê xe'
      }));
      throw error;
    }
  }, []);

  // Auto check on mount
  useEffect(() => {
    checkActive().catch(console.error);
  }, [checkActive]);

  return {
    ...state,
    checkActive,
    refresh: checkActive
  };
};

/**
 * Simple hook to get user's active rental
 * Used for displaying current rental information
 */
export const useGetActiveRental = () => {
  const [state, setState] = useState<{
    activeRental: Rental | null;
    isLoading: boolean;
    error: string | null;
  }>({
    activeRental: null,
    isLoading: false,
    error: null
  });

  const getActive = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const activeRental = await getUserActiveRental();
      setState({
        activeRental,
        isLoading: false,
        error: null
      });
      
      return activeRental;
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error.message || 'Không thể lấy thông tin thuê xe'
      }));
      throw error;
    }
  }, []);

  return {
    ...state,
    getActive,
    refresh: getActive
  };
};