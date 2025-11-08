// Test API responses for debugging
import { customerService } from '../services/customerService';
import { rentalService } from '../services/rentalService';

const testAPIResponses = async () => {
  console.log('🧪 Testing API responses...');
  
  try {
    // Test 1: Get user rentals
    console.log('\n📋 Testing getMyRentals:');
    const rentals = await customerService.getMyRentals();
    console.log('Rentals response:', rentals);
    console.log('Rental statuses:', rentals.map(r => ({ id: r._id, status: r.status, pickup: r.pickup })));
    
    // Test 2: Check if any rental has REJECTED status
    const rejectedRentals = rentals.filter(r => r.status === 'REJECTED');
    console.log('Rejected rentals found:', rejectedRentals.length);
    
    if (rejectedRentals.length > 0) {
      console.log('Rejected rental details:', rejectedRentals[0]);
    }
    
    // Test 3: Check pickup data structure
    const rentalsWithPickup = rentals.filter(r => r.pickup);
    console.log('Rentals with pickup data:', rentalsWithPickup.length);
    
    if (rentalsWithPickup.length > 0) {
      console.log('Pickup data structure:', rentalsWithPickup[0].pickup);
    }
    
  } catch (error) {
    console.error('❌ API Test Error:', error);
  }
};

// Call this in browser console
window.testAPIResponses = testAPIResponses;

export default testAPIResponses;