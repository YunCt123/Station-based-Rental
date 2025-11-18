// Test script for document upload debugging
// This helps debug the document upload issue

import { userService } from './src/services/userService';

// Test the upload process step by step
export const testDocumentUpload = async () => {
  console.log('🧪 Testing document upload process...');
  
  try {
    // Test 1: Check if we can get verification status
    console.log('📋 Step 1: Getting verification status...');
    const verificationStatus = await userService.getVerificationStatus();
    console.log('✅ Verification status:', verificationStatus);
    
    // Test 2: Test upload with dummy data
    console.log('📤 Step 2: Testing upload with dummy data...');
    const testUploadData = {
      driverLicense: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAAAAAAAD/test'
    };
    
    const uploadResult = await userService.uploadVerificationImages(testUploadData);
    console.log('✅ Upload result:', uploadResult);
    
    // Test 3: Check verification status after upload
    console.log('📋 Step 3: Getting verification status after upload...');
    const newStatus = await userService.getVerificationStatus();
    console.log('✅ New verification status:', newStatus);
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    console.error('Error details:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      url: error.response?.config?.url,
      method: error.response?.config?.method
    });
  }
};

// Test field mapping
export const testFieldMapping = () => {
  console.log('🔍 Testing field mapping...');
  
  const fieldMapping = {
    "Driver License": "driverLicense",
    "Card Front": "idCardFront", 
    "Card Back": "idCardBack",
    "Selfie Photo": "selfiePhoto"
  };
  
  const testCases = ["Driver License", "Card Front", "Card Back", "Selfie Photo"];
  
  testCases.forEach(docType => {
    const fieldName = fieldMapping[docType];
    console.log(`📝 ${docType} -> ${fieldName}`);
  });
};

// Instructions to run this test:
// 1. Open browser console on Settings page
// 2. Copy and paste the functions above
// 3. Run testFieldMapping() first to verify mapping
// 4. Run testDocumentUpload() to test actual upload
// 5. Check console logs for detailed debugging info

console.log(`
🔧 Debug Instructions:
1. Open Settings page
2. Open browser DevTools Console
3. Try uploading a document and watch the console logs
4. Look for these log messages:
   - "📁 Uploading [documentType]"
   - "✅ Base64 data URL conversion complete"
   - "🔄 Uploading to backend with field name"
   - "🚀 Starting uploadVerificationImages with payload"
   - "✅ Upload response received"
5. If any step fails, check the error details
`);