/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useCallback } from 'react';
import { customerService, type Rental, type Payment } from '../../services/customerService';

export const useMyRentals = () => {
  const [rentals, setRentals] = useState<Rental[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMyRentals = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await customerService.getMyRentals();
      setRentals(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch rentals');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMyRentals();
  }, [fetchMyRentals]);

  return { 
    rentals, 
    loading, 
    error, 
    refetch: fetchMyRentals 
  };
};

export const useRentalDetail = (rentalId: string | null) => {
  const [rental, setRental] = useState<Rental | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

 const fetchRentalDetail = useCallback(async () => {
  if (!rentalId) return;
  
  setLoading(true);
  setError(null);
  
  try {
    const rentalData = await customerService.getRentalDetail(rentalId);
    
    const bookingId = rentalData?.booking_id?._id;
    
    const paymentsPromises = [
      customerService.getRentalPayments(rentalId)
    ];
    
    if (bookingId) {
      paymentsPromises.push(customerService.getBookingPayments(bookingId));
    }
    
    const paymentsResults = await Promise.all(paymentsPromises);
    
    let allPayments = [...paymentsResults[0]]; 
    if (paymentsResults.length > 1) {
      const bookingPayments = paymentsResults[1];
      const existingIds = new Set(allPayments.map(p => p._id?.toString()));
      
      allPayments = [
        ...allPayments,
        ...bookingPayments.filter(p => !existingIds.has(p._id?.toString()))
      ];
    }
    
    
    setRental(rentalData);
    setPayments(allPayments);
  
  } catch (err) {
    setError(err instanceof Error ? err.message : 'Failed to fetch rental detail');
  } finally {
    setLoading(false);
  }
}, [rentalId]);

  useEffect(() => {
    fetchRentalDetail();
  }, [fetchRentalDetail]);

  return { 
    rental, 
    payments, 
    loading, 
    error, 
    refetch: fetchRentalDetail 
  };
};

export const useFinalPayment = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFinalPayment = async (rentalId: string): Promise<boolean> => {
  setLoading(true);
  setError(null);
  
  try {
    const returnResult = await customerService.completeReturn(rentalId);
    const { finalPayment } = returnResult;
    
    if (finalPayment.amount > 0) {
      console.log('💰 Additional payment required:', finalPayment.amount);
      
      try {
        const paymentResponse = await customerService.createFinalPayment(
          rentalId, 
          window.location.origin + '/payment-result'
        );
        window.location.href = paymentResponse?.checkoutUrl;
        return true;
        
      } catch (paymentError: any) {
        console.error('💳 Payment URL creation failed:', paymentError);
        
        try {
          const revertResult = await customerService.revertCustomerReturnPayment(rentalId);
          console.log('🔄 Payment reverted successfully:', revertResult.message);
          alert(`Tạo link thanh toán thất bại. Đã khôi phục trạng thái, bạn có thể thử lại. ${revertResult.message}`);
          return false; 
        } catch (revertError: any) {
          console.error('❌ Revert failed:', revertError);
          const revertErrorMsg = revertError instanceof Error ? revertError.message : 'Revert failed';
          setError(revertErrorMsg);
          alert(`Lỗi khôi phục: ${revertErrorMsg}. Vui lòng liên hệ hỗ trợ.`);
          return false;
        }
      }
      
    } else if (finalPayment.amount < 0) {
      alert(`Hoàn tiền ${Math.abs(finalPayment.amount).toLocaleString()} VND sẽ được xử lý`);
      return true;
      
    } else {
      alert('Thuê xe hoàn tất thành công! Không cần thanh toán thêm.');
      return true;
    }

  } catch (err: any) {
    const errorMessage = err instanceof Error ? err.message : 'Complete return failed';
    setError(errorMessage);
    alert('Hoàn thành trả xe thất bại: ' + errorMessage);
    return false;
  } finally {
    setLoading(false);
  }
};

  return { 
    handleFinalPayment, 
    loading, 
    error 
  };
};