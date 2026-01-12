import { useState } from "react";
import { AdminLogin } from "./AdminLogin";
import { AdminDashboard } from "./AdminDashboard";
import { Language } from "../translations";

export function AdminPage({ language }: { language: Language }) {
  const [token, setToken] = useState<string | null>(null);
  const [checking, setChecking] = useState(false); // Changed to false - no saved token to check

  // Security: No token persistence - user must login after page refresh
  // useEffect removed - we never check for saved tokens

  const handleLoginSuccess = (newToken: string) => {
    console.log('✅ AdminPage: Login successful, received token:', newToken.substring(0, 20) + '...');
    console.log('   Token length:', newToken.length);
    console.log('   Token is UUID:', /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(newToken));
    console.log('   Full token:', newToken); // DEBUG: Show full token
    setToken(newToken);
    
    // DEBUG: Verify token was set correctly
    setTimeout(() => {
      console.log('🔍 AdminPage: Token in state after 100ms:', newToken.substring(0, 20) + '...');
    }, 100);
  };

  const handleLogout = () => {
    // Security: Just clear the in-memory token (no localStorage to clear)
    setToken(null);
  };

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  if (!token) {
    return <AdminLogin onLoginSuccess={handleLoginSuccess} />;
  }

  return <AdminDashboard token={token} onLogout={handleLogout} language={language} />;
}