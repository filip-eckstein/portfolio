import { useState, useEffect } from "react";
import { GripVertical, Save, ArrowUpDown, Calendar, Zap } from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { toast } from "sonner@2.0.3";

interface Project {
  id: string;
  title: string;
  description: string;
  sortOrder?: number;
  projectCategory: string[];
  published?: boolean;
  dateValue: number;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
}

interface ProjectsReorderProps {
  token: string;
}

export function ProjectsReorder({ token }: ProjectsReorderProps) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [activeSort, setActiveSort] = useState<string | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  useEffect(() => {
    loadProjects();
    loadSettings();
  }, []);
  
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
        const adminSort = data.settings?.adminDefaultSortOrder || 'none';
        setActiveSort(adminSort);
        console.log('Admin default sort order:', adminSort);
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

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
        console.log('Loaded projects from API:', data.projects?.length);
        console.log('First project sample:', data.projects?.[0]);
        
        // Sort by sortOrder if exists, otherwise by dateValue
        const sortedProjects = (data.projects || [])
          .filter((p: Project) => p && p.id)
          .sort((a: Project, b: Project) => {
            const aOrder = a.sortOrder ?? 9999;
            const bOrder = b.sortOrder ?? 9999;
            return aOrder - bOrder;
          });
        
        console.log('After filtering, project count:', sortedProjects.length);
        console.log('Sample project IDs:', sortedProjects.slice(0, 3).map((p: Project) => ({ id: p.id, title: p.title })));
        
        setProjects(sortedProjects);
      }
    } catch (error) {
      console.error('Error loading projects:', error);
      toast.error('Chyba při načítání projektů');
    } finally {
      setLoading(false);
    }
  };

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    const newProjects = [...projects];
    const draggedProject = newProjects[draggedIndex];
    
    // Remove from old position
    newProjects.splice(draggedIndex, 1);
    // Insert at new position
    newProjects.splice(index, 0, draggedProject);
    
    setProjects(newProjects);
    setDraggedIndex(index);
    setHasUnsavedChanges(true);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  // Auto-sort functions
  const sortByDateNewest = () => {
    const sorted = [...projects].sort((a, b) => b.dateValue - a.dateValue);
    setProjects(sorted);
    toast.success('Projekty seřazeny podle data (nejnovější)');
    setActiveSort('dateNewest');
    setHasUnsavedChanges(true);
  };

  const sortByDateOldest = () => {
    const sorted = [...projects].sort((a, b) => a.dateValue - b.dateValue);
    setProjects(sorted);
    toast.success('Projekty seřazeny podle data (nejstarší)');
    setActiveSort('dateOldest');
    setHasUnsavedChanges(true);
  };

  const sortByDifficultyEasy = () => {
    const difficultyOrder = { "Beginner": 1, "Intermediate": 2, "Advanced": 3 };
    const sorted = [...projects].sort((a, b) => difficultyOrder[a.difficulty] - difficultyOrder[b.difficulty]);
    setProjects(sorted);
    toast.success('Projekty seřazeny podle obtížnosti (nejlehčí)');
    setActiveSort('difficultyEasy');
    setHasUnsavedChanges(true);
  };

  const sortByDifficultyHard = () => {
    const difficultyOrder = { "Beginner": 3, "Intermediate": 2, "Advanced": 1 };
    const sorted = [...projects].sort((a, b) => difficultyOrder[a.difficulty] - difficultyOrder[b.difficulty]);
    setProjects(sorted);
    toast.success('Projekty seřazeny podle obtížnosti (nejtěžší)');
    setActiveSort('difficultyHard');
    setHasUnsavedChanges(true);
  };

  const sortAlphabeticallyAZ = () => {
    const sorted = [...projects].sort((a, b) => a.title.localeCompare(b.title, 'cs'));
    setProjects(sorted);
    toast.success('Projekty seřazeny abecedně (A-Z)');
    setActiveSort('alphabeticallyAZ');
    setHasUnsavedChanges(true);
  };

  const sortAlphabeticallyZA = () => {
    const sorted = [...projects].sort((a, b) => b.title.localeCompare(a.title, 'cs'));
    setProjects(sorted);
    toast.success('Projekty seřazeny abecedně (Z-A)');
    setActiveSort('alphabeticallyZA');
    setHasUnsavedChanges(true);
  };

  const handleSaveOrder = async () => {
    setSaving(true);
    try {
      // 1. Save sort order to projects
      const projectsWithOrder = projects.map((project, index) => ({
        id: project.id,
        sortOrder: index,
      }));

      console.log('Saving reorder for', projectsWithOrder.length, 'projects');

      const reorderResponse = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-635fd90e/admin/projects/reorder`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`,
            'X-Admin-Token': token,
          },
          body: JSON.stringify({ projects: projectsWithOrder }),
        }
      );

      const reorderData = await reorderResponse.json();

      if (!reorderResponse.ok) {
        console.error('Reorder error:', reorderData);
        toast.error(reorderData.error || 'Chyba při ukládání pořadí');
        return;
      }

      // 2. Load current settings to preserve web default sort
      const settingsGetResponse = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-635fd90e/admin/settings`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'X-Admin-Token': token,
          },
        }
      );
      
      const currentSettings = await settingsGetResponse.json();
      const currentWebSort = currentSettings.settings?.webDefaultSortOrder || 'none';

      // 3. Save admin default sort order setting (keep web setting unchanged)
      // IMPORTANT: Save BEFORE resetting activeSort to 'none'
      const settingsResponse = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-635fd90e/admin/settings`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`,
            'X-Admin-Token': token,
          },
          body: JSON.stringify({ 
            adminDefaultSortOrder: 'none', // Always save as 'none' after manual save
            webDefaultSortOrder: currentWebSort
          }),
        }
      );

      // 4. Show success message
      if (reorderData.notFound > 0) {
        toast.warning(`Varování: ${reorderData.notFound} projektů nebylo nalezeno. Aktualizováno: ${reorderData.updated} projektů.`);
      } else {
        toast.success(`Pořadí projektů uloženo! (${reorderData.updated} projektů)`);
      }
      
      // Reset activeSort to 'none' after saving - it's now custom manual order
      setActiveSort('none');
      loadProjects();
      setHasUnsavedChanges(false);
    } catch (error) {
      console.error('Error saving order:', error);
      toast.error('Chyba při ukládání pořadí');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p>Načítání projektů...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="mb-2">Řazení projektů</h2>
          <p className="text-sm text-muted-foreground">
            Přetáhněte projekty pro změnu pořadí. Toto pořadí se použije na webu.
          </p>
          {hasUnsavedChanges && (
            <p className="text-sm text-orange-600 mt-2 flex items-center gap-1.5">
              <span className="inline-block w-2 h-2 bg-orange-600 rounded-full animate-pulse"></span>
              Máte neuložené změny! Klikněte na "Uložit pořadí".
            </p>
          )}
        </div>
        <Button 
          onClick={handleSaveOrder} 
          disabled={saving}
          variant={hasUnsavedChanges ? "default" : "outline"}
          className={hasUnsavedChanges ? "animate-pulse" : ""}
        >
          <Save className="h-4 w-4 mr-2" />
          {saving ? 'Ukládám...' : hasUnsavedChanges ? 'Uložit pořadí ⚠️' : 'Uložit pořadí'}
        </Button>
      </div>

      {/* Quick Sort Buttons */}
      <Card>
        <CardContent className="p-4">
          <div className="space-y-3">
            <div className="flex items-center gap-2 mb-3">
              <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
              <h4 className="text-sm">Rychlé řazení:</h4>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={sortByDateNewest}
                className={activeSort === 'dateNewest' ? 'bg-gray-100' : ''}
              >
                <Calendar className="h-3 w-3 mr-1.5" />
                Datum ↓ (Nejnovější)
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={sortByDateOldest}
                className={activeSort === 'dateOldest' ? 'bg-gray-100' : ''}
              >
                <Calendar className="h-3 w-3 mr-1.5" />
                Datum ↑ (Nejstarší)
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={sortByDifficultyEasy}
                className={activeSort === 'difficultyEasy' ? 'bg-gray-100' : ''}
              >
                <Zap className="h-3 w-3 mr-1.5" />
                Obtížnost ↑ (Nejlehčí)
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={sortByDifficultyHard}
                className={activeSort === 'difficultyHard' ? 'bg-gray-100' : ''}
              >
                <Zap className="h-3 w-3 mr-1.5" />
                Obtížnost ↓ (Nejtěžší)
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={sortAlphabeticallyAZ}
                className={activeSort === 'alphabeticallyAZ' ? 'bg-gray-100' : ''}
              >
                A→Z
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={sortAlphabeticallyZA}
                className={activeSort === 'alphabeticallyZA' ? 'bg-gray-100' : ''}
              >
                Z→A
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              💡 Tip: Použijte rychlé řazení jako výchozí bod a pak manuálně dolaďte pořadí pomocí drag & drop.
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-2">
        {projects.map((project, index) => (
          <Card
            key={project.id}
            draggable
            onDragStart={() => handleDragStart(index)}
            onDragOver={(e) => handleDragOver(e, index)}
            onDragEnd={handleDragEnd}
            className={`cursor-move transition-all ${
              draggedIndex === index ? 'opacity-50' : ''
            } ${project.published === false ? 'opacity-60' : ''}`}
          >
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <GripVertical className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                
                <div className="flex items-center gap-2 text-muted-foreground font-mono text-sm flex-shrink-0">
                  #{index + 1}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="truncate">{project.title}</h4>
                    {project.published === false && (
                      <Badge variant="secondary" className="text-xs">
                        Draft
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground truncate">
                    {project.description}
                  </p>
                  <div className="flex gap-1 mt-2">
                    {project.projectCategory.slice(0, 3).map((cat, idx) => (
                      <Badge key={idx} variant="outline" className="text-xs">
                        {cat}
                      </Badge>
                    ))}
                    {project.projectCategory.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{project.projectCategory.length - 3}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {projects.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <p>Žádné projekty k seřazení.</p>
        </div>
      )}
    </div>
  );
}