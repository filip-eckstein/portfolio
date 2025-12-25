import { useState, useEffect } from "react";
import { Settings, Save, Award } from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./ui/card";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { toast } from "sonner@2.0.3";
import { ProjectsReorder } from "./ProjectsReorder";

interface SettingsManagerProps {
  token: string;
}

interface Achievement {
  id: string;
  type: "competition" | "certification";
  title: string;
  titleCs: string;
}

export function SettingsManager({ token }: SettingsManagerProps) {
  console.log('⚙️ SettingsManager: Rendering with token:', token ? token.substring(0, 20) + '...' : 'NO TOKEN');
  
  const [defaultSortOrder, setDefaultSortOrder] = useState<string>("none");
  const [contestAchievementId, setContestAchievementId] = useState<string>("none");
  const [certificationAchievementId, setCertificationAchievementId] = useState<string>("none");
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showReorder, setShowReorder] = useState(false);

  useEffect(() => {
    loadSettings();
    loadAchievements();
  }, []);

  const loadAchievements = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-635fd90e/admin/achievements`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'X-Admin-Token': token,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setAchievements(data.achievements || []);
      }
    } catch (error) {
      console.error('Error loading achievements:', error);
    }
  };

  const loadSettings = async () => {
    try {
      console.log('⚙️ SettingsManager: Loading settings from API...');
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-635fd90e/admin/settings`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'X-Admin-Token': token,
          },
        }
      );

      console.log('⚙️ SettingsManager: Response status:', response.status);

      if (response.ok) {
        const data = await response.json();
        console.log('⚙️ SettingsManager: Settings loaded:', data);
        setDefaultSortOrder(data.settings?.defaultSortOrder || "none");
        // Ensure we convert empty string or undefined to "none"
        setContestAchievementId(data.settings?.contestAchievementId && data.settings.contestAchievementId !== "" ? data.settings.contestAchievementId : "none");
        setCertificationAchievementId(data.settings?.certificationAchievementId && data.settings.certificationAchievementId !== "" ? data.settings.certificationAchievementId : "none");
      } else {
        const errorData = await response.json();
        console.error('⚙️ SettingsManager: Error response:', errorData);
        toast.error(`Chyba při načítání nastavení: ${errorData.error || response.statusText}`);
      }
    } catch (error) {
      console.error('⚙️ SettingsManager: Error loading settings:', error);
      toast.error('Chyba při načítání nastavení');
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    setSaving(true);
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-635fd90e/admin/settings`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`,
            'X-Admin-Token': token,
          },
          body: JSON.stringify({
            defaultSortOrder,
            contestAchievementId: contestAchievementId === "none" ? "" : contestAchievementId,
            certificationAchievementId: certificationAchievementId === "none" ? "" : certificationAchievementId,
          }),
        }
      );

      if (response.ok) {
        toast.success('Nastaven uloženo!');
      } else {
        const data = await response.json();
        toast.error(data.error || 'Chyba při ukládání nastavení');
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Chyba při ukládání nastavení');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p>Načítání nastavení...</p>
      </div>
    );
  }

  if (showReorder) {
    return (
      <div>
        <Button variant="outline" onClick={() => setShowReorder(false)} className="mb-6">
          ← Zpět na nastavení
        </Button>
        <ProjectsReorder token={token} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Řazení projektů
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div>
              <h4 className="mb-2">Manuální řazení</h4>
              <p className="text-sm text-muted-foreground mb-3">
                Přetáhněte projekty do požadovaného pořadí. Toto pořadí bude použito pro zobrazení na webu.
              </p>
              <Button onClick={() => setShowReorder(true)}>
                Přeuspořádat projekty (Drag & Drop)
              </Button>
            </div>

            <div className="border-t pt-4">
              <h4 className="mb-2">Automatické řazení (fallback)</h4>
              <p className="text-sm text-muted-foreground mb-3">
                Pokud projekty nemají nastaveno manuální pořadí, použije se toto automatické řazení:
              </p>
              <div className="space-y-2">
                <Label htmlFor="defaultSortOrder">Výchozí řazení</Label>
                <Select value={defaultSortOrder} onValueChange={setDefaultSortOrder}>
                  <SelectTrigger id="defaultSortOrder">
                    <SelectValue placeholder="Vyberte výchozí řazení" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Žádné (původní pořadí)</SelectItem>
                    <SelectItem value="date-newest">Datum (Nejnovější)</SelectItem>
                    <SelectItem value="date-oldest">Datum (Nejstarší)</SelectItem>
                    <SelectItem value="difficulty-easy">Obtížnost (Snadná)</SelectItem>
                    <SelectItem value="difficulty-hard">Obtížnost (Těžká)</SelectItem>
                    <SelectItem value="alphabetically-az">Abecedně (A→Z)</SelectItem>
                    <SelectItem value="alphabetically-za">Abecedně (Z→A)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Informace</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm text-muted-foreground">
            <p><strong>Priorita řazení:</strong></p>
            <ol className="list-decimal list-inside space-y-1 ml-2">
              <li>Manuální pořadí (pokud je nastaveno)</li>
              <li>Automatické řazení (podle výběru výše)</li>
              <li>Původní pořadí (pokud není nic nastaveno)</li>
            </ol>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5" />
            Výhry a certifikáty
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div>
              <h4 className="mb-2">Výhry</h4>
              <p className="text-sm text-muted-foreground mb-3">
                Vyberte výhru, která bude zobrazena na webu.
              </p>
              <div className="space-y-2">
                <Label htmlFor="contestAchievementId">Výhry</Label>
                <Select value={contestAchievementId} onValueChange={setContestAchievementId}>
                  <SelectTrigger id="contestAchievementId">
                    <SelectValue placeholder="Vyberte výhru" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Žádná</SelectItem>
                    {achievements.filter(a => a.type === "competition").map(a => (
                      <SelectItem key={a.id} value={a.id}>{a.titleCs}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="border-t pt-4">
              <h4 className="mb-2">Certifikáty</h4>
              <p className="text-sm text-muted-foreground mb-3">
                Vyberte certifikát, který bude zobrazen na webu.
              </p>
              <div className="space-y-2">
                <Label htmlFor="certificationAchievementId">Certifikáty</Label>
                <Select value={certificationAchievementId} onValueChange={setCertificationAchievementId}>
                  <SelectTrigger id="certificationAchievementId">
                    <SelectValue placeholder="Vyberte certifikát" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Žádný</SelectItem>
                    {achievements.filter(a => a.type === "certification").map(a => (
                      <SelectItem key={a.id} value={a.id}>{a.titleCs}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button onClick={saveSettings} disabled={saving} className="mt-4">
                <Save className="h-4 w-4 mr-2" />
                {saving ? 'Ukládám...' : 'Uložit nastavení'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}