import { useState } from "react";
import { AdminLogin } from "./AdminLogin";
import { AdminDashboard } from "./AdminDashboard";
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { Button } from "./ui/button";
import { toast } from "sonner@2.0.3";

export function AdminPage() {
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
  
  const debugSessions = async () => {
    try {
      console.log('🔍 Fetching all sessions...');
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-635fd90e/debug/list-sessions`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
          },
        }
      );
      const data = await response.json();
      console.log('📋 All sessions in database:', data);
      toast.success(`Found ${data.sessions?.length || 0} sessions - check console`);
    } catch (error) {
      console.error('Error fetching sessions:', error);
      toast.error('Failed to fetch sessions');
    }
  };

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  if (!token) {
    return (
      <div>
        <AdminLogin onLoginSuccess={handleLoginSuccess} />
        <div className="fixed bottom-4 right-4">
          <Button variant="outline" onClick={debugSessions}>
            🐛 Debug Sessions
          </Button>
        </div>
      </div>
    );
  }

  return <AdminDashboard token={token} onLogout={handleLogout} />;
}