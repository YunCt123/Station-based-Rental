// 🔧 BACKEND DEBUG PATCH
// File: booking.controller.js
// Replace the calculateBookingPrice function with this version:

export const calculateBookingPrice = catchAsync(async (req,res) => {
  const { vehicleId,startAt,endAt,insurancePremium } = req.body;
  
  // 🔍 DEBUG: Log received parameters
  console.log('🔍 [Backend Controller] Calculate price request received:');
  console.log('  vehicleId:', vehicleId);
  console.log('  startAt:', startAt);
  console.log('  endAt:', endAt);
  console.log('  insurancePremium:', insurancePremium);
  console.log('  typeof insurancePremium:', typeof insurancePremium);
  console.log('  insurancePremium === true:', insurancePremium === true);
  console.log('  insurancePremium === false:', insurancePremium === false);
  console.log('  !!insurancePremium:', !!insurancePremium);
  console.log('  req.body full:', JSON.stringify(req.body, null, 2));

  const breakdown = await bookingService.calculateBookingPrice({ vehicleId,startAt,endAt,insurancePremium });
  
  console.log('📤 [Backend Controller] Sending response:');
  console.log('  insurancePrice:', breakdown.insurancePrice);
  console.log('  basePrice:', breakdown.basePrice);
  console.log('  totalPrice:', breakdown.totalPrice);
  
  res.json({ success: true,data: breakdown });
});

// 🔧 ALSO ADD TO booking.service.js
// In the calculateBookingPrice function, around line 79, replace with:

// ✅ Calculate additional costs with better debugging
console.log('🔍 [Backend Service] Insurance calculation:', {
  'received insurancePremium': insurancePremium,
  'typeof insurancePremium': typeof insurancePremium,
  'insurancePremium === true': insurancePremium === true,
  'insurancePremium === false': insurancePremium === false,
  'Boolean(insurancePremium)': Boolean(insurancePremium),
  'basePrice': basePrice
});

const insurancePrice = insurancePremium ? basePrice * 0.1 : 0;

console.log('✅ [Backend Service] Insurance result:', {
  'calculated insurancePrice': insurancePrice,
  'logic used': insurancePremium ? 'basePrice * 0.1' : '0'
});

// REST OF THE FUNCTION REMAINS THE SAME...