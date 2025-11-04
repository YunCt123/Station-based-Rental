import React, { useState } from 'react';
import { Layout } from 'antd';
import MyRentalsScreen from './MyRentalsScreen';
import RentalDetailScreen from './RentalDetailScreen'; 
import FinalPaymentScreen from './FinalPaymentScreen';
import { useRentalDetail } from '../../../hooks/customer/useRentals';
import type { Rental } from '../../../services/customerService';

const { Content } = Layout;

type Screen = 'rentals' | 'detail' | 'payment';

const CustomerRentalApp: React.FC = () => {
  const [currentScreen, setCurrentScreen] = useState<Screen>('rentals');
  const [selectedRentalId, setSelectedRentalId] = useState<string | null>(null);
  const [selectedRental, setSelectedRental] = useState<Rental | null>(null);

  const { rental, payments, loading } = useRentalDetail(selectedRentalId);

  const navigateToRentalDetail = (rentalId: string) => {
    setSelectedRentalId(rentalId);
    setCurrentScreen('detail');
  };

  const navigateToPayment = (rental: Rental) => {
    setSelectedRental(rental);
    setCurrentScreen('payment');
  };

  const navigateBack = () => {
    setCurrentScreen('rentals');
    setSelectedRentalId(null);
    setSelectedRental(null);
  };

  const handlePaymentSuccess = () => {
    // Refresh and go back to rentals list
    navigateBack();
  };

  return (
    <Layout style={{ minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
      <Content>
        {currentScreen === 'rentals' && (
          <MyRentalsScreen 
            onRentalSelect={navigateToRentalDetail}
            onPaymentSelect={navigateToPayment}
          />
        )}

        {currentScreen === 'detail' && rental && (
          <RentalDetailScreen
            rental={rental}
            payments={payments}
            onBack={navigateBack}
            onPayment={navigateToPayment}
          />
        )}

        {currentScreen === 'detail' && loading && (
          <div style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            minHeight: '400px' 
          }}>
            <span>Đang tải chi tiết...</span>
          </div>
        )}

        {currentScreen === 'payment' && selectedRental && (
          <FinalPaymentScreen
            rental={selectedRental}
            onSuccess={handlePaymentSuccess}
            onBack={navigateBack}
          />
        )}
      </Content>
    </Layout>
  );
};

export default CustomerRentalApp;