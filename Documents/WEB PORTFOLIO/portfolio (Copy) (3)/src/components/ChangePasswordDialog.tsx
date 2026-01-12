import { useState } from "react";
import { Lock } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "./ui/dialog";
import { Label } from "./ui/label";
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { toast } from "sonner@2.0.3";

interface ChangePasswordDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  token: string;
}

export function ChangePasswordDialog({ open, onOpenChange, token }: ChangePasswordDialogProps) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (newPassword !== confirmPassword) {
      setError("Nová hesla se neshodují");
      return;
    }

    if (newPassword.length < 6) {
      setError("Heslo musí mít alespoň 6 znaků");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-635fd90e/admin/change-password`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`,
            'X-Admin-Token': token,
          },
          body: JSON.stringify({ 
            currentPassword, 
            newPassword 
          }),
        }
      );

      const data = await response.json();

      if (data.success) {
        toast.success('Heslo bylo úspěšně změněno!');
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        onOpenChange(false);
      } else {
        setError(data.error || 'Chyba při změně hesla');
      }
    } catch (err) {
      console.error('Change password error:', err);
      setError('Chyba při změně hesla');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <Lock className="h-5 w-5" />
            <DialogTitle>Změnit heslo</DialogTitle>
          </div>
        </DialogHeader>

        <form onSubmit={handleChangePassword} className="space-y-4">
          <div>
            <Label>Současné heslo</Label>
            <Input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Zadejte současné heslo"
              required
            />
          </div>

          <div>
            <Label>Nové heslo</Label>
            <Input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Zadejte nové heslo (min. 6 znaků)"
              required
            />
          </div>

          <div>
            <Label>Potvrdit nové heslo</Label>
            <Input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Zadejte nové heslo znovu"
              required
            />
          </div>

          {error && (
            <div className="text-sm text-destructive bg-destructive/10 px-3 py-2 rounded-md">
              {error}
            </div>
          )}

          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => {
                onOpenChange(false);
                setCurrentPassword("");
                setNewPassword("");
                setConfirmPassword("");
                setError("");
              }}
            >
              Zrušit
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Ukládám...' : 'Změnit heslo'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
