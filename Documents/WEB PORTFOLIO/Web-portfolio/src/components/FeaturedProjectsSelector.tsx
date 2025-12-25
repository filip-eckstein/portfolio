import { useState, useEffect } from "react";
import { Save, Star } from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./ui/card";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { toast } from "sonner@2.0.3";

interface FeaturedProjectsSelectorProps {
  token: string;
}

interface Project {
  id: string;
  title: string;
  titleCs: string;
  published: boolean;
}

export function FeaturedProjectsSelector({ token }: FeaturedProjectsSelectorProps) {
  const [featuredProjects, setFeaturedProjects] = useState<string[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadProjects();
    loadSettings();
  }, []);

  const loadProjects = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-635fd90e/admin/projects`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'X-Admin-Token': token,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        const publishedProjects = data.projects.filter((p: Project) => p.published !== false);
        setProjects(publishedProjects);
      }
    } catch (error) {
      console.error('Error loading projects:', error);
    }
  };

  const loadSettings = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-635fd90e/admin/settings`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'X-Admin-Token': token,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setFeaturedProjects(data.settings?.featuredProjects || []);
      }
    } catch (error) {
      console.error('Error loading settings:', error);
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
            featuredProjects,
          }),
        }
      );

      if (response.ok) {
        toast.success('Vybrané projekty uloženy!');
      } else {
        const data = await response.json();
        toast.error(data.error || 'Chyba při ukládání');
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Chyba při ukládání');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p>Načítání...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Star className="h-5 w-5" />
          Vybrané projekty na hlavní stránce
        </CardTitle>
        <CardDescription>
          Vyberte 3 projekty, které se budou zobrazovat na hlavní stránce
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {[0, 1, 2].map((index) => (
          <div key={index} className="space-y-2">
            <Label htmlFor={`featured-${index}`}>
              {index === 0 ? '1. projekt' : index === 1 ? '2. projekt' : '3. projekt'}
            </Label>
            <Select 
              value={featuredProjects[index] || "none"} 
              onValueChange={(value) => {
                const newFeatured = [...featuredProjects];
                if (value === "none") {
                  newFeatured[index] = "";
                } else {
                  newFeatured[index] = value;
                }
                setFeaturedProjects(newFeatured);
              }}
            >
              <SelectTrigger id={`featured-${index}`}>
                <SelectValue placeholder="Vyberte projekt..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">-- Nevybráno --</SelectItem>
                {projects.map((project) => (
                  <SelectItem 
                    key={project.id} 
                    value={project.id}
                    disabled={featuredProjects.includes(project.id) && featuredProjects[index] !== project.id}
                  >
                    {project.titleCs || project.title}
                    {featuredProjects.includes(project.id) && featuredProjects[index] !== project.id && ' (již vybrán)'}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        ))}
        
        <Button onClick={saveSettings} disabled={saving || featuredProjects.filter(p => p).length !== 3} className="mt-4">
          <Save className="h-4 w-4 mr-2" />
          {saving ? 'Ukládám...' : 'Uložit výběr'}
        </Button>
        
        {featuredProjects.filter(p => p).length < 3 && (
          <p className="text-sm text-orange-600 mt-2">
            ⚠️ Vyberte všechny 3 projekty
          </p>
        )}
      </CardContent>
    </Card>
  );
}