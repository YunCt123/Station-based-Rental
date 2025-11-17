import React from 'react';

const AuthDebugger: React.FC = () => {
  const handleCheckTokens = () => {
    const accessToken = localStorage.getItem("access_token");
    const firebaseToken = localStorage.getItem("firebase_token");
    const userInfo = localStorage.getItem("userInfo");
    const user = localStorage.getItem("user");
    
    console.log("🔍 Auth Debug Info:", {
      accessToken: accessToken ? `${accessToken.substring(0, 20)}...` : "Missing",
      firebaseToken: firebaseToken ? `${firebaseToken.substring(0, 20)}...` : "Missing", 
      userInfo: userInfo ? JSON.parse(userInfo) : "Missing",
      user: user ? JSON.parse(user) : "Missing",
    });
    
    alert(`Token status:
Access Token: ${accessToken ? "Available" : "Missing"}
Firebase Token: ${firebaseToken ? "Available" : "Missing"}
UserInfo: ${userInfo ? "Available" : "Missing"}
User: ${user ? "Available" : "Missing"}

Check console for details.`);
  };

  const handleTestAPI = async () => {
    try {
      const response = await fetch('/api/v1/users/me', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem("access_token") || localStorage.getItem("firebase_token")}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log("🔍 API Test Response:", {
        status: response.status,
        ok: response.ok,
        headers: Object.fromEntries(response.headers.entries())
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log("✅ API Success:", data);
        alert("API call successful! Check console for details.");
      } else {
        const error = await response.text();
        console.error("❌ API Error:", error);
        alert(`API call failed: ${response.status} ${response.statusText}`);
      }
    } catch (error) {
      console.error("💥 Network Error:", error);
      alert(`Network error: ${error}`);
    }
  };

  return (
    <div className="fixed top-4 right-4 bg-white border border-gray-300 rounded-lg shadow-lg p-4 z-50">
      <h3 className="text-sm font-bold mb-2">Auth Debugger</h3>
      <div className="space-y-2">
        <button 
          onClick={handleCheckTokens}
          className="block w-full text-xs bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
        >
          Check Tokens
        </button>
        <button 
          onClick={handleTestAPI}
          className="block w-full text-xs bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
        >
          Test API Call
        </button>
      </div>
    </div>
  );
};

export default AuthDebugger;