// 💱 BACKEND CURRENCY PATCH
// File: booking.service.js
// Replace the calculateBookingPrice function with this version:

// ✅ FIXED: Calculate booking price with currency support
async calculateBookingPrice({ vehicleId, startAt, endAt, insurancePremium = false, currency = 'USD' }) {
  console.log('🔧 [Backend] Calculating price for:', { vehicleId, startAt, endAt, insurancePremium, currency });
  
  // Load vehicle/pricing
  const vehicle = await vehicleRepository.findById(vehicleId);
  if (!vehicle) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Vehicle not found');
  }

  const pricing = vehicle.pricing || {
    hourly: vehicle.pricePerHour || 20, // Default $20/hour
    daily: vehicle.pricePerDay || 135,  // Default $135/day
    currency: 'USD'
  };

  console.log('💰 [Backend] Original vehicle pricing (USD):', pricing);

  // 💱 Convert rates to VND if requested
  let hourlyRate = pricing.hourly;
  let dailyRate = pricing.daily;
  let finalCurrency = 'USD';
  
  if (currency === 'VND') {
    const USD_TO_VND_RATE = 26000; // Use your preferred rate
    hourlyRate = pricing.hourly * USD_TO_VND_RATE;
    dailyRate = pricing.daily * USD_TO_VND_RATE;
    finalCurrency = 'VND';
    
    console.log('💱 [Backend] Converted rates to VND:', {
      'USD hourly': pricing.hourly,
      'VND hourly': hourlyRate,
      'USD daily': pricing.daily,
      'VND daily': dailyRate,
      'rate': USD_TO_VND_RATE
    });
  }

  const start = new Date(startAt);
  const end = new Date(endAt);
  if (isNaN(start.getTime()) || isNaN(end.getTime()) || end <= start) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid startAt/endAt range');
  }

  const ms = end - start;
  const hours = ms / (1000 * 60 * 60);
  const days = hours / 24;

  console.log('⏰ [Backend] Time calculation:', { 
    hours: hours.toFixed(2), 
    days: days.toFixed(2),
    start: start.toISOString(),
    end: end.toISOString()
  });

  // ✅ Calculate base price using converted rates
  let basePrice = 0;
  let rentalType = '';
  
  if (hours >= 24 && dailyRate > 0) {
    // ✅ Use daily pricing for 24+ hours
    rentalType = 'daily';
    const totalDays = Math.ceil(days);
    
    console.log('📅 [Backend] Using daily pricing:', { totalDays, dailyRate });
    
    // Apply weekend multiplier per day
    for (let i = 0; i < totalDays; i++) {
      const dayDate = new Date(start.getTime() + i * 24 * 60 * 60 * 1000);
      const isWeekend = dayDate.getDay() === 0 || dayDate.getDay() === 6;
      const weekendMultiplier = isWeekend ? 1.2 : 1.0;
      
      const dayPrice = dailyRate * weekendMultiplier;
      basePrice += dayPrice;
      
      console.log(`📅 [Backend] Day ${i + 1}: ${dayDate.toDateString()}, Weekend: ${isWeekend}, Price: ${finalCurrency === 'VND' ? '₫' : '$'}${dayPrice.toFixed(0)}`);
    }
    
  } else {
    // ✅ Use hourly pricing for < 24 hours
    rentalType = 'hourly';
    const totalHours = Math.ceil(hours);
    
    console.log('⏰ [Backend] Using hourly pricing:', { totalHours, hourlyRate });
    
    // Apply peak and weekend multipliers per hour
    for (let i = 0; i < totalHours; i++) {
      const hourStart = new Date(start.getTime() + i * 60 * 60 * 1000);
      const hour = hourStart.getHours();
      const isWeekend = hourStart.getDay() === 0 || hourStart.getDay() === 6;
      
      // Peak hours: 7-9 AM and 5-7 PM
      const isPeakHour = (hour >= 7 && hour < 9) || (hour >= 17 && hour < 19);
      
      const peakMultiplier = isPeakHour ? 1.5 : 1.0;
      const weekendMultiplier = isWeekend ? 1.2 : 1.0;
      
      const hourPrice = hourlyRate * peakMultiplier * weekendMultiplier;
      basePrice += hourPrice;
      
      console.log(`⏰ [Backend] Hour ${i + 1}: ${hourStart.toLocaleString()}, Peak: ${isPeakHour}, Weekend: ${isWeekend}, Price: ${finalCurrency === 'VND' ? '₫' : '$'}${hourPrice.toFixed(0)}`);
    }
  }

  console.log('💵 [Backend] Base price calculation:', { 
    rentalType, 
    basePrice: basePrice.toFixed(0),
    currency: finalCurrency
  });

  // ✅ Calculate additional costs (insurance, taxes, etc.)
  console.log('🛡️ [Backend] Insurance calculation:', {
    insurancePremium,
    basePrice,
    willApplyInsurance: !!insurancePremium
  });
  
  const insurancePrice = insurancePremium ? basePrice * 0.1 : 0;
  const subtotal = basePrice + insurancePrice;
  const taxes = subtotal * 0.1;
  const total = subtotal + taxes;
  const deposit = total * 0.2;

  console.log('🛡️ [Backend] Insurance result:', {
    insurancePrice: insurancePrice.toFixed(0),
    condition: insurancePremium ? 'Applied 10%' : 'No insurance'
  });

  // ✅ Return pricing in requested currency
  const decimalPlaces = finalCurrency === 'VND' ? 0 : 2; // VND doesn't use decimals

  const breakdown = {
    // Backend expected format
    hourly_rate: Number(hourlyRate.toFixed(decimalPlaces)),
    daily_rate: Number(dailyRate.toFixed(decimalPlaces)),
    currency: finalCurrency,
    deposit: Number(deposit.toFixed(decimalPlaces)),
    policy_version: 'v1.0',
    
    // Frontend compatibility format
    basePrice: Number(basePrice.toFixed(decimalPlaces)),
    insurancePrice: Number(insurancePrice.toFixed(decimalPlaces)),
    taxes: Number(taxes.toFixed(decimalPlaces)),
    totalPrice: Number(total.toFixed(decimalPlaces)),
    details: {
      rawBase: Number(basePrice.toFixed(decimalPlaces)),
      rentalType,
      hours: Number(hours.toFixed(2)),
      days: Number(days.toFixed(2))
    }
  };

  console.log('✅ [Backend] Final price breakdown (', finalCurrency, '):', breakdown);
  return breakdown;
},

// 📝 ALSO UPDATE the controller to pass currency parameter:
// File: booking.controller.js - calculateBookingPrice function:

export const calculateBookingPrice = catchAsync(async (req,res) => {
  const { vehicleId, startAt, endAt, insurancePremium, currency } = req.body;
  
  console.log('🔍 [Backend Controller] Calculate price request:', {
    vehicleId,
    startAt,
    endAt,
    insurancePremium,
    currency: currency || 'USD', // Default to USD
    'typeof insurancePremium': typeof insurancePremium
  });

  const breakdown = await bookingService.calculateBookingPrice({ 
    vehicleId, 
    startAt, 
    endAt, 
    insurancePremium,
    currency: currency || 'USD' // Pass currency to service
  });
  
  console.log('📤 [Backend Controller] Sending response (', breakdown.currency, '):', {
    basePrice: breakdown.basePrice,
    insurancePrice: breakdown.insurancePrice,
    totalPrice: breakdown.totalPrice
  });
  
  res.json({ success: true, data: breakdown });
});