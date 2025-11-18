# Customer Rental Management System

## 📋 Overview
Hệ thống quản lý thuê xe cho khách hàng với đầy đủ tính năng theo dõi, thanh toán và lịch sử thuê xe.

## 🚀 Features

### 1. **My Rentals Screen** (`/my-rentals`)
- ✅ Hiển thị danh sách xe đang thuê
- ✅ Phân loại theo trạng thái: Đang sử dụng, Cần thanh toán, Chờ nhận xe, Lịch sử
- ✅ Thông tin chi tiết từng rental
- ✅ Badge hiển thị số lượng cho mỗi tab

### 2. **Rental Detail Screen**
- ✅ Thông tin chi tiết xe và trạm
- ✅ Timeline lịch trình thuê xe
- ✅ Ảnh nhận xe và trả xe
- ✅ Lịch sử thanh toán
- ✅ Nút thanh toán cho rental cần thanh toán

### 3. **Final Payment Screen**
- ✅ Chi tiết phí thuê xe
- ✅ Hỗ trợ 3 scenarios: Thanh toán thêm, Hoàn tiền, Không cần thanh toán
- ✅ Tích hợp VNPAY cho thanh toán online
- ✅ Hiển thị ảnh kiểm tra từ nhân viên

### 4. **Payment History**
- ✅ Lịch sử tất cả giao dịch
- ✅ Chi tiết từng loại thanh toán (Đặt cọc, Thanh toán cuối, Hoàn tiền)
- ✅ Trạng thái giao dịch với icon và màu sắc

## 🛠 Technical Implementation

### **File Structure**
```
src/
├── pages/customer/rentals/
│   ├── CustomerRentalApp.tsx      # Main app component
│   ├── MyRentalsScreen.tsx        # Danh sách rental
│   ├── RentalDetailScreen.tsx     # Chi tiết rental
│   ├── FinalPaymentScreen.tsx     # Thanh toán cuối
│   └── index.ts                   # Exports
├── components/customer/
│   ├── RentalCard.tsx            # Card hiển thị rental
│   └── PaymentHistory.tsx        # Lịch sử thanh toán
├── hooks/customer/
│   └── useRentals.ts             # Custom hooks
├── services/
│   └── customerService.ts        # API service
└── styles/
    └── customer-rentals.css      # Custom styles
```

### **API Endpoints**
- `GET /api/v1/rentals/` - Lấy danh sách rentals
- `GET /api/v1/rentals/:id` - Chi tiết rental
- `GET /api/v1/payments/rentals/:id` - Lịch sử thanh toán
- `POST /api/v1/rentals/:id/complete-return` - Hoàn tất trả xe
- `POST /api/v1/payments/rentals/:id/final` - Tạo thanh toán cuối

### **Routes Added**
- `/my-rentals` - Màn hình chính cho customer
- `/dashboard` - Auto redirect cho customer → `/my-rentals`
- `/role-switcher` - Role switcher cho admin/staff

### **Header Updates**
- ✅ Added "Xe thuê của tôi" menu item
- ✅ Responsive mobile menu
- ✅ Customer-specific navigation

## 🎨 UI/UX Features

### **Responsive Design**
- ✅ Mobile-first approach
- ✅ Tablet and desktop optimization
- ✅ Touch-friendly interactions

### **Visual Indicators**
- ✅ Color-coded status badges
- ✅ Progress indicators
- ✅ Loading states
- ✅ Empty states

### **User Experience**
- ✅ Intuitive navigation
- ✅ Real-time updates
- ✅ Error handling
- ✅ Success notifications

## 📱 Usage Flow

### **Customer Journey**
1. **Login** → Customer role detected
2. **Dashboard** → Auto redirect to `/my-rentals`
3. **View Rentals** → See all rentals by status
4. **Rental Detail** → Click any rental card
5. **Payment** → Click "Thanh toán" for RETURN_PENDING rentals
6. **Complete** → Rental status → COMPLETED

### **Status Flow**
```
CONFIRMED → ONGOING → RETURN_PENDING → COMPLETED
    ↓          ↓            ↓            ↓
Chờ nhận   Đang sử dụng  Cần thanh toán  Hoàn tất
```

## 🔧 Development

### **Prerequisites**
```bash
npm install
# All dependencies already included in package.json
```

### **File Imports**
```typescript
// Use the CustomerRentalApp
import CustomerRentalApp from './pages/customer/rentals/CustomerRentalApp';

// Individual components
import { MyRentalsScreen, RentalDetailScreen } from './pages/customer/rentals';

// Services and hooks
import { customerService, useMyRentals } from './pages/customer/rentals';
```

### **Styling**
```css
/* Import in your CSS */
@import url("./styles/customer-rentals.css");
```

## 🚨 Important Notes

### **Authentication**
- Customer role auto-detected from `getCurrentUser()`
- Protected routes require authentication
- Auto-redirect based on user role

### **API Integration**
- Uses existing `api.ts` service
- Error handling with try/catch
- Loading states for better UX

### **Payment Integration**
- VNPAY sandbox for testing
- Handles 3 payment scenarios
- Real-time payment status

### **Mobile Optimization**
- Touch-friendly buttons
- Responsive card layouts
- Mobile-specific interactions

## 📊 Test Scenarios

### **Test Data Required**
```javascript
// Rental with different statuses
{
  status: 'ONGOING',        // Đang sử dụng
  status: 'RETURN_PENDING', // Cần thanh toán  
  status: 'CONFIRMED',      // Chờ nhận xe
  status: 'COMPLETED'       // Hoàn tất
}
```

### **Payment Test Cases**
1. **Additional Payment** (finalAmount > 0)
2. **Refund** (finalAmount < 0)  
3. **No Payment** (finalAmount = 0)

## 🔍 Debugging

### **Common Issues**
1. **Empty rental list** → Check API endpoint `/api/v1/rentals/`
2. **Payment failed** → Check VNPAY configuration
3. **Photos not loading** → Check image URLs from backend

### **Error Handling**
- Network errors shown with retry button
- Invalid data handled gracefully  
- User-friendly error messages

## 📈 Future Enhancements

- [ ] Real-time notifications
- [ ] QR code scanning for vehicle access
- [ ] GPS tracking integration
- [ ] Offline mode support
- [ ] Multi-language support

---

**Created:** November 4, 2025  
**Version:** 1.0.0  
**Author:** EV Station Development Team  
**Status:** ✅ Production Ready