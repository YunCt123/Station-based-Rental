import React, { useState } from 'react';
import { userService } from '@/services/userService';

const ProfileTest: React.FC = () => {
  const [result, setResult] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const testGetProfile = async () => {
    setLoading(true);
    try {
      console.log('🔍 [ProfileTest] Starting profile test...');
      
      const profile = await userService.getCurrentUser();
      
      console.log('✅ [ProfileTest] Success:', profile);
      setResult(`Success! Name: ${profile.name}, Email: ${profile.email}`);
      
    } catch (error) {
      console.error('❌ [ProfileTest] Error:', error);
      setResult(`Error: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setLoading(false);
    }
  };

  const checkTokens = () => {
    const accessToken = localStorage.getItem("access_token");
    const firebaseToken = localStorage.getItem("firebase_token");
    const userInfo = localStorage.getItem("userInfo");
    
    console.log('🔍 [ProfileTest] Token Status:', {
      accessToken: accessToken ? `${accessToken.substring(0, 20)}...` : 'Missing',
      firebaseToken: firebaseToken ? `${firebaseToken.substring(0, 20)}...` : 'Missing',
      userInfo: userInfo ? JSON.parse(userInfo) : 'Missing'
    });
    
    setResult(`Tokens: Access=${!!accessToken}, Firebase=${!!firebaseToken}, UserInfo=${!!userInfo}`);
  };

  if (import.meta.env.DEV !== true) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 bg-white border border-gray-300 rounded-lg shadow-lg p-4 z-50 max-w-sm">
      <h3 className="text-sm font-bold mb-2">Profile API Test</h3>
      
      <div className="space-y-2 mb-3">
        <button 
          onClick={checkTokens}
          className="block w-full text-xs bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
        >
          Check Tokens
        </button>
        
        <button 
          onClick={testGetProfile}
          disabled={loading}
          className="block w-full text-xs bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600 disabled:opacity-50"
        >
          {loading ? 'Testing...' : 'Test Get Profile'}
        </button>
      </div>
      
      {result && (
        <div className="text-xs p-2 bg-gray-100 rounded overflow-auto max-h-20">
          {result}
        </div>
      )}
    </div>
  );
};

export default ProfileTest;