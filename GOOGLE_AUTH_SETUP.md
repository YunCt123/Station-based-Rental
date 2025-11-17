# 🔐 Google Authentication Setup Guide

## 📋 Overview
Hệ thống đã được thiết lập để hỗ trợ cả đăng nhập/đăng ký bằng email/password truyền thống và Google Authentication thông qua Firebase.

## 🚀 Features Implemented

### ✅ Frontend Components
- **Firebase Config** (`src/config/firebase.ts`) - Cấu hình Firebase SDK
- **GoogleAuthButton** (`src/components/auth/GoogleAuthButton.tsx`) - Component Google auth có thể tái sử dụng
- **Updated Login/Register** - Tích hợp Google auth vào trang đăng nhập và đăng ký
- **Enhanced Auth Utils** - Cập nhật utilities để hỗ trợ cả local và Firebase auth

### ✅ Authentication Service
- **Enhanced authService** (`src/services/authService.ts`) - Thêm các function Google auth:
  - `loginWithGoogle()` - Đăng nhập với Google
  - `logoutGoogle()` - Đăng xuất Google
  - `getCurrentFirebaseUser()` - Lấy thông tin user từ Firebase

### ✅ Multi-Auth Support
- Hỗ trợ cả hai phương thức: Local (email/password) và Google
- Auto-detect auth provider
- Unified user interface cho cả hai loại auth

## 🔧 Setup Instructions

### 1. Cài đặt Dependencies
```bash
npm install firebase
```
✅ **COMPLETED** - Firebase SDK đã được cài đặt

### 2. Firebase Project Setup
1. Tạo Firebase project tại [Firebase Console](https://console.firebase.google.com/)
2. Enable Authentication → Google provider
3. Add web app và lấy config object
4. Tạo service account key cho backend (xem `FIREBASE_GOOGLE_AUTH_SETUP.md`)

### 3. Environment Variables
Tạo file `.env` từ `.env.example`:
```bash
cp .env.example .env
```

Cập nhật các giá trị Firebase trong `.env`:
```env
VITE_FIREBASE_API_KEY=your-api-key-here
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id
```

### 4. Backend Setup
Backend cần implement các endpoint sau (xem `FIREBASE_GOOGLE_AUTH_SETUP.md`):
```
POST /api/v1/auth/firebase/google - Google login/register
GET /api/v1/auth/firebase/me - Get current Firebase user
PUT /api/v1/auth/firebase/profile - Update profile
```

## 🎯 How It Works

### Login Flow
1. **Local Auth**: Email + Password → Backend validation → JWT tokens
2. **Google Auth**: Google popup → Firebase ID token → Backend verification → User creation/login

### Registration Flow  
1. **Local Auth**: Form data → Backend validation → Account creation
2. **Google Auth**: Google popup → Firebase ID token → Auto account creation

### Authentication Check
```typescript
// Kiểm tra auth status
isAuthenticated() // true nếu có local token HOẶC firebase token

// Lấy auth provider
getAuthProvider() // "local" | "firebase_google" | null

// Lấy current user (unified interface)
getCurrentUser() // User object với auth_provider field
```

## 🔒 Security Features

### Token Management
- **Local Auth**: Access token + Refresh token trong localStorage
- **Google Auth**: Firebase ID token trong localStorage
- Auto token refresh cho Firebase (handled by Firebase SDK)

### Data Protection
- Firebase tokens tự động expire sau 1 giờ
- Backend verify Firebase tokens trước khi cho phép API access
- Consistent user interface cho cả hai auth methods

## 📱 Usage Examples

### Google Login Button
```tsx
<GoogleAuthButton 
  onSuccess={(userData) => {
    // Handle successful login
    onLogin(userData);
    navigate('/dashboard');
  }}
/>
```

### Google Register Button
```tsx
<GoogleAuthButton 
  isRegistration={true}
  additionalInfo={{
    phoneNumber: "0123456789",
    dateOfBirth: "1990-01-01"
  }}
  onSuccess={(userData) => {
    // Handle successful registration
    navigate('/dashboard');
  }}
/>
```

### Check Auth Status
```typescript
// Check if user is logged in
if (isAuthenticated()) {
  const user = getCurrentUser();
  console.log(`Logged in as ${user.name} via ${user.auth_provider}`);
}
```

## 🧪 Testing

### Frontend Testing
1. Start development server: `npm run dev`
2. Go to `/login` or `/register`
3. Click "Tiếp tục với Google" button
4. Complete Google OAuth flow
5. Verify user is logged in and redirected correctly

### Backend Testing
Backend endpoints cần được implement theo documentation trong `FIREBASE_GOOGLE_AUTH_SETUP.md`.

## 🚨 Important Notes

### Environment Variables
- **NEVER** commit real Firebase config to git
- Use environment variables cho production
- Firebase config trong code chỉ cho development

### CORS Configuration
- Backend phải configure CORS để accept requests từ frontend domain
- Firebase console phải có authorized domains

### Error Handling
- Google auth có thể fail do popup blockers
- Network issues có thể affect Firebase connection
- Backend Firebase verification có thể fail

## 🔄 Migration Notes

### Existing Users
- Local auth users có thể continue sử dụng email/password
- Google auth tạo separate users với `auth_provider: "firebase_google"`
- Same email không thể có cả hai auth methods (unique constraint)

### Data Consistency
- User data structure giống nhau cho cả hai auth methods
- Additional Firebase fields: `firebase_uid`, `avatar`, `auth_provider`

## 📋 Next Steps

1. ✅ **Setup Firebase project** và lấy config keys
2. ✅ **Update .env file** với Firebase config
3. 🔄 **Implement backend endpoints** (xem FIREBASE_GOOGLE_AUTH_SETUP.md)
4. 🔄 **Test end-to-end authentication flow**
5. 🔄 **Deploy và test production environment**

## 🛠️ Troubleshooting

### Common Issues
1. **"Firebase config undefined"**: Check .env file có đúng variables
2. **"Popup blocked"**: User cần allow popups cho domain
3. **"Network error"**: Check internet connection và Firebase config
4. **"Backend 404"**: Backend chưa implement Firebase endpoints

### Debug Steps
1. Check browser console cho Firebase errors
2. Verify .env variables đã load correctly
3. Test Firebase config với simple Firebase call
4. Check network tab cho failed API calls