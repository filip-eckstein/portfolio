import { useState } from "react";
import { Lock, Eye, EyeOff, Mail } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./ui/card";
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { toast } from "sonner@2.0.3";

interface AdminLoginProps {
  onLoginSuccess: (token: string) => void;
}

export function AdminLogin({ onLoginSuccess }: AdminLoginProps) {
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  
  // Forgot Password State
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetCode, setResetCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [resetStep, setResetStep] = useState<'request' | 'verify'>('request');
  const [resetLoading, setResetLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-635fd90e/admin/login`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify({ password }),
        }
      );

      const data = await response.json();

      if (data.success && data.token) {
        // Security: Don't persist token - user must login after page refresh
        // localStorage.setItem('adminToken', data.token); // REMOVED for security
        console.log('✅ AdminLogin: Login successful, token received:', data.token.substring(0, 20) + '...');
        console.log('   Calling onLoginSuccess with token...');
        onLoginSuccess(data.token);
      } else {
        setError(data.error || 'Invalid password');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError(`Login failed: ${err instanceof Error ? err.message : 'Please try again.'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleRequestReset = async () => {
    setResetLoading(true);
    setError("");
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-635fd90e/admin/forgot-password`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`,
          },
        }
      );

      const data = await response.json();

      if (data.success && data.code) {
        // Send email with the code using EmailJS
        try {
          const emailjs = (await import("@emailjs/browser")).default;
          
          // Send to first email
          await emailjs.send(
            "service_7qj7oj1",
            "template_yh2lbig",
            {
              name: "Admin",
              email: "projekty@filip-eckstein.cz",
              message: `Váš ověřovací kód pro reset hesla je: ${data.code}\n\nKód je platný 15 minut.\n\nPokud jste o reset hesla nežádali, ignorujte tento email.`,
            },
            "Z0gXebwHu4N3tj0ZG"
          );

          // Send to second email
          await emailjs.send(
            "service_7qj7oj1",
            "template_yh2lbig",
            {
              name: "Admin",
              email: "ec.f@seznam.cz",
              message: `Váš ověřovací kód pro reset hesla je: ${data.code}\n\nKód je platný 15 minut.\n\nPokud jste o reset hesla nežádali, ignorujte tento email.`,
            },
            "Z0gXebwHu4N3tj0ZG"
          );

          toast.success('Ověřovací kód byl odeslán na email');
          setResetStep('verify');
        } catch (emailError) {
          console.error('Email send error:', emailError);
          toast.error('Chyba při odesílání emailu');
        }
      } else {
        toast.error(data.error || 'Chyba při generování kódu');
      }
    } catch (err) {
      console.error('Reset request error:', err);
      toast.error('Chyba při odesílání kódu');
    } finally {
      setResetLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetLoading(true);
    setError("");

    if (!resetCode || !newPassword) {
      setError("Zadejte ověřovací kód a nové heslo");
      setResetLoading(false);
      return;
    }

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-635fd90e/admin/reset-password`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify({ code: resetCode, newPassword }),
        }
      );

      const data = await response.json();

      if (data.success) {
        toast.success('Heslo bylo úspěšně změněno!');
        setShowForgotPassword(false);
        setResetStep('request');
        setResetCode("");
        setNewPassword("");
      } else {
        setError(data.error || 'Neplatný ověřovací kód');
      }
    } catch (err) {
      console.error('Reset password error:', err);
      setError('Chyba při resetování hesla');
    } finally {
      setResetLoading(false);
    }
  };

  if (showForgotPassword) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30 px-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Mail className="h-6 w-6 text-primary" />
            </div>
            <CardTitle>Reset Password</CardTitle>
            <CardDescription>
              {resetStep === 'request' 
                ? 'Ověřovací kód bude odeslán na registrované emaily'
                : 'Zadejte ověřovací kód a nové heslo'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {resetStep === 'request' ? (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Kliknutím na tlačítko níže odešleme ověřovací kód na emaily:
                  <br />
                  • projekty@filip-eckstein.cz
                  <br />
                  • ec.f@seznam.cz
                </p>
                
                {error && (
                  <div className="text-sm text-destructive bg-destructive/10 px-3 py-2 rounded-md">
                    {error}
                  </div>
                )}

                <Button 
                  onClick={handleRequestReset} 
                  className="w-full"
                  disabled={resetLoading}
                >
                  {resetLoading ? 'Odesílám...' : 'Odeslat ověřovací kód'}
                </Button>

                <Button 
                  variant="outline"
                  onClick={() => {
                    setShowForgotPassword(false);
                    setResetStep('request');
                    setError("");
                  }} 
                  className="w-full"
                >
                  Zpět na přihlášení
                </Button>
              </div>
            ) : (
              <form onSubmit={handleResetPassword} className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Ověřovací kód</label>
                  <Input
                    type="text"
                    placeholder="Zadejte 6místný kód"
                    value={resetCode}
                    onChange={(e) => setResetCode(e.target.value)}
                    maxLength={6}
                    required
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Nové heslo</label>
                  <Input
                    type="password"
                    placeholder="Zadejte nové heslo"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                  />
                </div>

                {error && (
                  <div className="text-sm text-destructive bg-destructive/10 px-3 py-2 rounded-md">
                    {error}
                  </div>
                )}

                <Button type="submit" className="w-full" disabled={resetLoading}>
                  {resetLoading ? 'Resetuji...' : 'Resetovat heslo'}
                </Button>

                <Button 
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowForgotPassword(false);
                    setResetStep('request');
                    setResetCode("");
                    setNewPassword("");
                    setError("");
                  }} 
                  className="w-full"
                >
                  Zpět na přihlášení
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
            <Lock className="h-6 w-6 text-primary" />
          </div>
          <CardTitle>Admin Panel</CardTitle>
          <CardDescription>
            Enter password to access the admin dashboard
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter admin password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            {error && (
              <div className="text-sm text-destructive bg-destructive/10 px-3 py-2 rounded-md">
                {error}
              </div>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Logging in...' : 'Login'}
            </Button>

            <button
              type="button"
              onClick={() => setShowForgotPassword(true)}
              className="w-full text-sm text-primary hover:underline"
            >
              Forgot Password?
            </button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}