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
      const [rentalData, paymentsData] = await Promise.all([
        customerService.getRentalDetail(rentalId),
        customerService.getRentalPayments(rentalId)
      ]);
      
      setRental(rentalData);
      setPayments(paymentsData);
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
      // Step 1: Complete return (customer final payment after staff inspection)
      const returnResult = await customerService.completeReturn(rentalId);
      const { finalPayment } = returnResult;
      
      if (finalPayment.amount > 0) {
        // Customer needs to pay additional amount
        console.log('💰 Additional payment required:', finalPayment.amount);
        
        const paymentResponse = await customerService.createFinalPayment(
          rentalId, 
          window.location.origin + '/payment-result'
        );
        
        // Redirect to VNPAY for payment
        window.location.href = paymentResponse.payment.vnpay_checkout_url;
        return true;
        
      } else if (finalPayment.amount < 0) {
        // Refund will be processed
        alert(`Hoàn tiền ${Math.abs(finalPayment.amount).toLocaleString()} VND sẽ được xử lý`);
        return true;
        
      } else {
        // No additional payment needed
        alert('Thuê xe hoàn tất thành công! Không cần thanh toán thêm.');
        return true;
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Payment failed';
      setError(errorMessage);
      alert('Thanh toán thất bại: ' + errorMessage);
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