import { useEffect, useCallback } from 'react';
// import { message } from 'antd';
import { userService } from '../services/userService';
import { getCurrentUser, type User } from '../utils/auth';

/**
 * Custom hook to auto-refresh user data from API when component mounts
 * Solves the issue where localStorage has outdated verification status
 * but database has been updated by admin
 */
export const useAutoRefreshUser = (onUserUpdate?: (user: User) => void) => {
  const handleUserUpdate = useCallback((user: User) => {
    if (onUserUpdate) {
      onUserUpdate(user);
    }
  }, [onUserUpdate]);

  useEffect(() => {
    const autoRefreshUserData = async () => {
      const currentUser = getCurrentUser();
      if (currentUser && localStorage.getItem('access_token')) {
        console.log('🔄 [useAutoRefreshUser] Auto-refreshing user data...');
        try {
          const freshUserData = await userService.getCurrentUser();
          console.log('✅ [useAutoRefreshUser] Auto-refresh successful:', {
            oldStatus: currentUser.verificationStatus,
            newStatus: freshUserData.verificationStatus,
            changed: currentUser.verificationStatus !== freshUserData.verificationStatus
          });
          
          // Map UserProfile to User format for compatibility
          const mappedUser: User = {
            id: freshUserData._id,
            name: freshUserData.name,
            email: freshUserData.email,
            role: freshUserData.role,
            phoneNumber: freshUserData.phoneNumber,
            dateOfBirth: freshUserData.dateOfBirth,
            isVerified: freshUserData.isVerified,
            licenseNumber: freshUserData.licenseNumber,
            licenseExpiry: freshUserData.licenseExpiry ? new Date(freshUserData.licenseExpiry) : undefined,
            licenseClass: freshUserData.licenseClass,
            idCardFront: freshUserData.idCardFront,
            idCardBack: freshUserData.idCardBack,
            driverLicense: freshUserData.driverLicense,
            selfiePhoto: freshUserData.selfiePhoto,
            verificationStatus: freshUserData.verificationStatus,
            rejectionReason: freshUserData.rejectionReason,
            verifiedBy: freshUserData.verifiedBy,
            verifiedAt: freshUserData.verifiedAt ? new Date(freshUserData.verifiedAt) : undefined,
          };
          
          // Update localStorage
          localStorage.setItem('user', JSON.stringify(mappedUser));
          
          // Call callback if provided
          handleUserUpdate(mappedUser);
          
          // Show success message only if status changed to APPROVED
          // if (currentUser.verificationStatus !== 'APPROVED' && freshUserData.verificationStatus === 'APPROVED') {
          //   message.success('🎉 Your account has been verified! You can now make bookings.');
          // }
          
          return mappedUser;
        } catch (error) {
          console.error('❌ [useAutoRefreshUser] Auto-refresh failed:', error);
          // Don't show error message as this is a background operation
          return null;
        }
      }
      return null;
    };
    
    autoRefreshUserData();
  }, [handleUserUpdate]); // Run once on mount
};

export default useAutoRefreshUser;