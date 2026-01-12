import { useState, useEffect } from "react";
import { Plus, Edit, Trash2, Upload, LogOut, Save, X, Image as ImageIcon, FileText, FolderOpen, Trophy, MessageSquare, Lock, Link as LinkIcon, Eye, EyeOff, Rocket, Tag, Settings, GripVertical, Download, SaveAll, UploadCloud, Bug, Star, Languages } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "./ui/dialog";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Badge } from "./ui/badge";
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { toast } from "sonner@2.0.3";
import { translateText } from '../utils/translation';
import { Language } from "../translations";
import { ContentEditor } from "./ContentEditor";
import { AchievementsManager } from "./AchievementsManager";
import { TestimonialsManager } from "./TestimonialsManager";
import { ChangePasswordDialog } from "./ChangePasswordDialog";
import { PublishManager } from "./PublishManager";
import { FiltersManager } from "./FiltersManager";
import { SettingsManager } from "./SettingsManager";

interface Project {
  id: string;
  title: string;
  titleCs?: string;
  description: string;
  descriptionCs?: string;
  fullDescription: string;
  fullDescriptionCs?: string;
  category: string;
  categoryCs?: string;
  projectCategory: string[];
  date: string;
  dateValue: number;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  software: string[];
  material: string;
  printingTechnology: "FDM" | "SLA";
  designSource: "My Design" | "Downloaded Model";
  materials: string[];
  printTechnology: string[];
  technologies: string[];
  award?: string;
  imagePaths?: string[]; // Paths stored in database
  images: string[]; // URLs for preview
  thumbnailImage?: string; // Main thumbnail image for project card preview (deprecated, use thumbnailIndex)
  thumbnailIndex?: number; // Index of the thumbnail image in images array
  model3dPath?: string; // Path to 3D model file (GLB/GLTF) in storage
  model3dUrl?: string; // URL for 3D model preview
  duration?: string; // Time required to complete the project (e.g., "5 hours", "2 weeks")
  durationCs?: string; // Czech version of duration
  specs: { label: string; value: string; }[];
  specsCs?: { label: string; value: string; }[];
  references?: { name: string; url: string; }[];
  filters?: string[]; // Array of filter IDs
  published?: boolean;
  featured?: boolean; // Featured on homepage
  createdAt?: number;
  updatedAt?: number;
}

interface Achievement {
  id: string;
  type: "competition" | "certification";
  title: string;
  titleCs: string;
  subtitle: string;
  subtitleCs: string;
  description: string;
  descriptionCs: string;
  // Competition specific
  competitionName?: string;
  competitionNameCs?: string;
  year?: string;
  level?: string;
  levelCs?: string;
  award?: string;
  awardCs?: string;
  category?: string;
  categoryCs?: string;
  projectId?: string;
  contestUrl?: string;
  image?: string;
  presentationImage?: string;
  // Certification specific
  issuer?: string;
  issuerCs?: string;
  skills?: string[];
  skillsCs?: string[];
  certificateImage?: string;
  certificatePdf?: string;
  published?: boolean;
  order?: number; // Display order
  createdAt?: number;
  updatedAt?: number;
}

interface Testimonial {
  id: string;
  name: string;
  role: string;
  company: string;
  content: string;
  contentCs: string;
  rating: number;
  initials: string;
  projectId?: string;
  createdAt?: number;
  updatedAt?: number;
}

interface AdminDashboardProps {
  token: string;
  onLogout: () => void;
  language: Language;
}

export function AdminDashboard({ token, onLogout, language }: AdminDashboardProps) {
  // DEBUG: Log token when received
  console.log('📊 AdminDashboard: Token received:', token ? token.substring(0, 20) + '...' : 'NO TOKEN');
  console.log('📊 AdminDashboard: Full token:', token);
  
  const [activeTab, setActiveTab] = useState<'projects' | 'achievements' | 'testimonials' | 'filters' | 'content' | 'publish' | 'settings'>('projects');
  const [projects, setProjects] = useState<Project[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [editingAchievement, setEditingAchievement] = useState<Achievement | null>(null);
  const [editingTestimonial, setEditingTestimonial] = useState<Testimonial | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isAchievementDialogOpen, setIsAchievementDialogOpen] = useState(false);
  const [isTestimonialDialogOpen, setIsTestimonialDialogOpen] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploading3DModel, setUploading3DModel] = useState(false);
  const [changePasswordOpen, setChangePasswordOpen] = useState(false);
  const [availableFilters, setAvailableFilters] = useState<{id: string, name: string, nameCs: string, color: string}[]>([]);
  const [filterOptions, setFilterOptions] = useState<{
    id: string;
    name: string;
    nameCs: string;
    options: { value: string; label: string; labelCs: string }[];
  }[]>([]);
  const [translating, setTranslating] = useState(false);

  // Auto-translate function
  // Auto-translate function - supports both CS→EN and EN→CS
  const handleAutoTranslate = async (
    sourceField: 'title' | 'titleCs' | 'description' | 'descriptionCs' | 'fullDescription' | 'fullDescriptionCs',
    targetField: 'title' | 'titleCs' | 'description' | 'descriptionCs' | 'fullDescription' | 'fullDescriptionCs',
    direction: 'cs-en' | 'en-cs'
  ) => {
    if (!editingProject) return;
    
    const sourceText = editingProject[sourceField];
    if (!sourceText || sourceText.trim() === '') {
      toast.error('Žádný text k překladu');
      return;
    }

    setTranslating(true);
    try {
      const [sourceLang, targetLang] = direction === 'cs-en' ? ['cs', 'en'] : ['en', 'cs'];
      console.log(`Translating from ${sourceLang} to ${targetLang}:`, sourceText);
      const translated = await translateText(sourceText, token, sourceLang, targetLang);
      console.log('Translation result:', translated);
      if (translated) {
        console.log(`Updating field "${targetField}" with:`, translated);
        setEditingProject({ 
          ...editingProject, 
          [targetField]: translated 
        });
        toast.success('✅ Přeloženo!');
      } else {
        toast.error('Překlad selhal');
      }
    } catch (error: any) {
      console.error('Translation error:', error);
      toast.error(`Chyba při překladu: ${error?.message || 'Neznámá chyba'}`);
    } finally {
      setTranslating(false);
    }
  };

  // Auto-fill all Czech fields from English
  const handleAutoFillCzechFromEnglish = async () => {
    if (!editingProject) return;

    // Check if there are English texts to translate
    if (!editingProject.title && !editingProject.description && !editingProject.fullDescription) {
      toast.error('Žádné anglické texty k překladu');
      return;
    }

    setTranslating(true);
    try {
      const updates: Partial<Project> = {};
      
      // Translate title EN → CS
      if (editingProject.title && !editingProject.titleCs) {
        const translatedTitle = await translateText(editingProject.title, token, 'en', 'cs');
        if (translatedTitle) updates.titleCs = translatedTitle;
      }

      // Translate description EN → CS
      if (editingProject.description && !editingProject.descriptionCs) {
        const translatedDesc = await translateText(editingProject.description, token, 'en', 'cs');
        if (translatedDesc) updates.descriptionCs = translatedDesc;
      }

      // Translate full description EN → CS
      if (editingProject.fullDescription && !editingProject.fullDescriptionCs) {
        const translatedFull = await translateText(editingProject.fullDescription, token, 'en', 'cs');
        if (translatedFull) updates.fullDescriptionCs = translatedFull;
      }

      if (Object.keys(updates).length > 0) {
        setEditingProject({ ...editingProject, ...updates });
        toast.success(`✅ Přeloženo ${Object.keys(updates).length} polí!`);
      } else {
        toast.info('Všechna česká pole už jsou vyplněná');
      }
    } catch (error) {
      console.error('Auto-fill translation error:', error);
      toast.error('Chyba při automatickém překladu');
    } finally {
      setTranslating(false);
    }
  };

  const emptyProject: Project = {
    id: '',
    title: 'My 3D Printed Project',
    titleCs: 'Můj 3D tiskový projekt',
    description: 'A functional 3D printed part designed for practical use. This project showcases advanced CAD modeling and precision printing techniques.',
    descriptionCs: 'Funkční 3D tištěná součástka navržená pro praktické použití. Tento projekt předvádí pokročilé CAD modelování a precizní tiskové techniky.',
    fullDescription: 'This project demonstrates my skills in CAD design and 3D printing. I designed this model from scratch using professional CAD software, paying attention to functionality and printability.\n\nThe design process involved multiple iterations to optimize the part for both strength and print quality. I carefully selected materials and print settings to achieve the best results.\n\nKey features:\n- Optimized for FDM printing\n- Functional design with practical applications\n- Precise measurements and tolerances\n- Successfully printed and tested',
    fullDescriptionCs: 'Tento projekt demonstruje mé dovednosti v CAD designu a 3D tisku. Navrhl jsem tento model od nuly pomocí profesionálního CAD softwaru, s důrazem na funkčnost a tiskovatelnost.\n\nProces designu zahrnoval několik iterací pro optimalizaci součástky jak pro pevnost, tak pro kvalitu tisku. Pečlivě jsem vybíral materiály a nastavení tisku pro dosažení nejlepších výsledků.\n\nKlíčové vlastnosti:\n- Optimalizováno pro FDM tisk\n- Funkční design s praktickými aplikacemi\n- Přesné rozměry a tolerance\n- Úspěšně vytištěno a otestováno',
    category: '',
    projectCategory: [],
    date: new Date().toISOString().slice(0, 7), // YYYY-MM format
    dateValue: parseInt(new Date().toISOString().slice(0, 7).replace('-', '')), // YYYYMM format for sorting
    difficulty: 'Intermediate',
    software: ['Fusion 360'],
    material: 'PLA',
    printingTechnology: 'FDM',
    designSource: 'My Design',
    materials: [],
    printTechnology: [],
    technologies: [],
    images: [],
    specs: [],
    published: true,
    references: [],
  };

  useEffect(() => {
    loadProjects();
    loadFilters();
    loadAchievements();
    loadTestimonials();
  }, []);

  const loadProjects = async () => {
    try {
      // Add timestamp to prevent caching
      const timestamp = Date.now();
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-635fd90e/admin/projects?t=${timestamp}`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'X-Admin-Token': token,
          },
        }
      );

      if (response.status === 401) {
        // Don't show toast on initial load, just logout
        onLogout();
        return;
      }

      if (!response.ok) {
        throw new Error('Failed to load projects');
      }

      const data = await response.json();
      console.log('📊 AdminDashboard: Loaded projects:', data.projects?.length || 0);
      if (data.projects && data.projects.length > 0) {
        console.log('🔍 AdminDashboard: First project sample:', {
          id: data.projects[0].id,
          title: data.projects[0].title,
          duration: data.projects[0].duration,
          durationCs: data.projects[0].durationCs,
          material: data.projects[0].material,
          printingTechnology: data.projects[0].printingTechnology,
        });
        // Log ALL projects to find the one we edited
        console.log('📋 All projects loaded:', data.projects.map((p: any) => ({
          id: p.id,
          title: p.title,
          duration: p.duration,
          material: p.material,
          printingTechnology: p.printingTechnology,
        })));
      }
      // Filter out null/undefined projects and sort by date
      const validProjects = (data.projects || [])
        .filter((p: Project) => p && p.id)
        .sort((a: Project, b: Project) => (b.dateValue || 0) - (a.dateValue || 0));
      setProjects(validProjects);
    } catch (error) {
      console.error('Error loading projects:', error);
      toast.error('Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProject = async () => {
    if (!editingProject) return;

    try {
      const url = editingProject.id && projects.find(p => p.id === editingProject.id)
        ? `https://${projectId}.supabase.co/functions/v1/make-server-635fd90e/admin/projects/${editingProject.id}`
        : `https://${projectId}.supabase.co/functions/v1/make-server-635fd90e/admin/projects`;

      const method = editingProject.id && projects.find(p => p.id === editingProject.id) ? 'PUT' : 'POST';

      console.log('💾 Saving project:', editingProject.id);
      console.log('📝 Project title:', editingProject.title);
      console.log('📦 Project data being saved:', {
        id: editingProject.id,
        title: editingProject.title,
        duration: editingProject.duration,
        durationCs: editingProject.durationCs,
        material: editingProject.material,
        printingTechnology: editingProject.printingTechnology,
        specs: editingProject.specs,
        specsCs: editingProject.specsCs,
      });

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`,
          'X-Admin-Token': token,
        },
        body: JSON.stringify(editingProject),
      });

      if (response.ok) {
        const result = await response.json();
        console.log('✅ Project saved, server response:', result);
        toast.success('Project saved successfully');
        setIsDialogOpen(false);
        setEditingProject(null);
        // Add small delay to ensure data is written
        setTimeout(() => loadProjects(), 500);
      } else {
        toast.error('Failed to save project');
      }
    } catch (error) {
      console.error('Error saving project:', error);
      toast.error('Failed to save project');
    }
  };

  const handleDeleteProject = async (id: string) => {
    if (!confirm('Are you sure you want to delete this project?')) return;

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-635fd90e/admin/projects/${id}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'X-Admin-Token': token,
          },
        }
      );

      if (response.ok) {
        toast.success('Project deleted successfully');
        loadProjects();
      } else {
        toast.error('Failed to delete project');
      }
    } catch (error) {
      console.error('Error deleting project:', error);
      toast.error('Failed to delete project');
    }
  };

  const handleToggleFeatured = async (projectIdToToggle: string) => {
    try {
      const project = projects.find(p => p.id === projectIdToToggle);
      if (!project) return;

      const newFeaturedStatus = !project.featured;

      // Check if we're trying to feature a 4th project
      if (newFeaturedStatus) {
        const featuredCount = projects.filter(p => p.featured).length;
        if (featuredCount >= 3) {
          toast.error('You can only feature up to 3 projects on the homepage. Unfeature another project first.');
          return;
        }
      }

      // Update project
      const updatedProject = { ...project, featured: newFeaturedStatus };

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-635fd90e/admin/projects/${projectIdToToggle}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`,
            'X-Admin-Token': token,
          },
          body: JSON.stringify(updatedProject),
        }
      );

      if (response.ok) {
        toast.success(newFeaturedStatus ? '⭐ Project featured on homepage!' : 'Project unfeatured');
        loadProjects();
      } else {
        toast.error('Failed to update featured status');
      }
    } catch (error) {
      console.error('Error toggling featured status:', error);
      toast.error('Failed to update featured status');
    }
  };

  const handleImportDefaultProjects = async () => {
    if (!confirm('This will import all default projects. Continue?')) return;

    try {
      // Import default projects data
      const defaultProjects = await import('../data/defaultProjects');
      
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-635fd90e/admin/projects/import`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`,
            'X-Admin-Token': token,
          },
          body: JSON.stringify({ projects: defaultProjects.default }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        toast.success(`Successfully imported ${data.imported} projects`);
        loadProjects();
      } else {
        toast.error('Failed to import projects');
      }
    } catch (error) {
      console.error('Error importing projects:', error);
      toast.error('Failed to import projects');
    }
  };

  const handleUploadImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      console.log('Uploading file:', file.name, file.size, 'bytes');

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-635fd90e/admin/upload`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'X-Admin-Token': token,
          },
          body: formData,
        }
      );

      console.log('Upload response status:', response.status);
      const data = await response.json();
      console.log('Upload response data:', data);

      if (data.success && data.path && data.url && editingProject) {
        // Store both the path (for database) and URL (for preview)
        const newImagePaths = [...(editingProject.imagePaths || []), data.path];
        const newImages = [...(editingProject.images || []), data.url];
        
        setEditingProject({
          ...editingProject,
          imagePaths: newImagePaths,  // Store paths in database
          images: newImages,           // Use URLs for preview
        });
        toast.success('Image uploaded successfully');
      } else {
        const errorMsg = data.error || 'Failed to upload image';
        const errorDetails = data.details ? ` - ${data.details}` : '';
        console.error('Upload failed:', errorMsg + errorDetails);
        toast.error(errorMsg + errorDetails);
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error(`Failed to upload image: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setUploadingImage(false);
    }
  };

  const handleUpload3DModel = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading3DModel(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      console.log('Uploading file:', file.name, file.size, 'bytes');

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-635fd90e/admin/upload`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'X-Admin-Token': token,
          },
          body: formData,
        }
      );

      console.log('Upload response status:', response.status);
      const data = await response.json();
      console.log('Upload response data:', data);

      if (data.success && data.path && data.url && editingProject) {
        // Store both the path (for database) and URL (for preview)
        setEditingProject({
          ...editingProject,
          model3dPath: data.path,  // Store path in database
          model3dUrl: data.url,     // Use URL for preview
        });
        toast.success('3D Model uploaded successfully');
      } else {
        const errorMsg = data.error || 'Failed to upload 3D model';
        const errorDetails = data.details ? ` - ${data.details}` : '';
        console.error('Upload failed:', errorMsg + errorDetails);
        toast.error(errorMsg + errorDetails);
      }
    } catch (error) {
      console.error('Error uploading 3D model:', error);
      toast.error(`Failed to upload 3D model: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setUploading3DModel(false);
    }
  };

  const handleRemoveImage = (index: number) => {
    if (!editingProject) return;
    setEditingProject({
      ...editingProject,
      imagePaths: (editingProject.imagePaths || []).filter((_, i) => i !== index),
      images: editingProject.images.filter((_, i) => i !== index),
    });
  };

  const loadFilters = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-635fd90e/admin/filters`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'X-Admin-Token': token,
          },
        }
      );

      if (response.status === 401) {
        // Don't show toast on initial load, just logout
        onLogout();
        return;
      }

      if (!response.ok) {
        throw new Error('Failed to load filters');
      }

      const data = await response.json();
      // Store filter options for use in dropdowns
      const validFilters = (data.filters || [])
        .filter((f: any) => f && f.id);
      setFilterOptions(validFilters);
      
      // Keep availableFilters empty for now (old tag system - will be deprecated)
      setAvailableFilters([]);
    } catch (error) {
      console.error('Error loading filters:', error);
      // Don't show error toast on initial load
    }
  };

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

  const loadTestimonials = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-635fd90e/admin/testimonials`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'X-Admin-Token': token,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setTestimonials(data.testimonials || []);
      }
    } catch (error) {
      console.error('Error loading testimonials:', error);
    }
  };

  const handleExportBackup = async () => {
    try {
      toast.info('Creating backup...');
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-635fd90e/admin/backup/export`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'X-Admin-Token': token,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to create backup');
      }

      const backup = await response.json();
      
      // Download as JSON file
      const dataStr = JSON.stringify(backup, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `website-backup-${new Date().toISOString().split('T')[0]}.json`;
      link.click();
      URL.revokeObjectURL(url);
      
      toast.success('Backup exported successfully!');
    } catch (error) {
      console.error('Error exporting backup:', error);
      toast.error('Failed to export backup');
    }
  };

  const handleSaveAll = async () => {
    try {
      toast.info('Saving all data...');
      // Since projects are auto-saved, we just need to reload to confirm
      await loadProjects();
      await loadFilters();
      toast.success('All data saved successfully!');
    } catch (error) {
      console.error('Error saving all:', error);
      toast.error('Failed to save all data');
    }
  };

  const handleImportBackup = async () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      
      try {
        toast.info('Reading backup file...');
        
        const text = await file.text();
        const backup = JSON.parse(text);
        
        // Validate backup
        if (!backup.type || backup.type !== 'complete-backup') {
          toast.error('Invalid backup file format');
          return;
        }
        
        if (!confirm(`Are you sure you want to import this backup from ${new Date(backup.exportDate).toLocaleString()}? This will OVERWRITE all current data!`)) {
          return;
        }
        
        toast.info('Importing backup... This may take a while.');
        
        const response = await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-635fd90e/admin/backup/import`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${publicAnonKey}`,
              'X-Admin-Token': token,
            },
            body: JSON.stringify(backup),
          }
        );
        
        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Failed to import backup');
        }
        
        const result = await response.json();
        toast.success(`Backup imported! ${result.stats.projects} projects, ${result.stats.achievements} achievements, ${result.stats.testimonials} testimonials, ${result.stats.images} images restored.`);
        
        // Reload all data
        await loadProjects();
        await loadFilters();
      } catch (error) {
        console.error('Error importing backup:', error);
        toast.error(`Failed to import backup: ${error instanceof Error ? error.message : String(error)}`);
      }
    };
    
    input.click();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <header className="bg-background border-b sticky top-0 z-[60]">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl">Admin Dashboard</h1>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={handleSaveAll}>
              <SaveAll className="h-4 w-4 mr-2" />
              Save All
            </Button>
            <Button variant="outline" onClick={handleExportBackup}>
              <Download className="h-4 w-4 mr-2" />
              Export Backup
            </Button>
            <Button variant="outline" onClick={handleImportBackup}>
              <UploadCloud className="h-4 w-4 mr-2" />
              Import Backup
            </Button>
            <Button variant="outline" onClick={() => setChangePasswordOpen(true)}>
              <Lock className="h-4 w-4 mr-2" />
              Change Password
            </Button>
            <Button 
              variant="outline" 
              onClick={async () => {
                try {
                  toast.info('🔍 Checking sessions...');
                  const response = await fetch(
                    `https://${projectId}.supabase.co/functions/v1/make-server-635fd90e/debug/list-sessions`,
                    {
                      headers: {
                        'Authorization': `Bearer ${publicAnonKey}`,
                        'X-Admin-Token': token,
                      },
                    }
                  );
                  const data = await response.json();
                  
                  console.log('📋 SESSIONS DEBUG:', data);
                  
                  if (data.totalSessions === 0) {
                    toast.error(`❌ NO SESSIONS FOUND! Login is not saving sessions to database.`);
                  } else {
                    toast.success(`✅ Found ${data.totalSessions} session(s) in database`);
                    console.log('Session details:', data.sessions);
                  }
                } catch (error) {
                  toast.error('Debug error: ' + String(error));
                  console.error('Debug error:', error);
                }
              }}
            >
              <Bug className="h-4 w-4 mr-2" />
              Debug Sessions
            </Button>
            <Button variant="outline" onClick={onLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="bg-background border-b">
        <div className="container mx-auto px-4">
          <div className="flex gap-1">
            <button
              onClick={() => setActiveTab('projects')}
              className={`px-6 py-3 border-b-2 transition-colors ${
                activeTab === 'projects'
                  ? 'border-primary text-foreground'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              <div className="flex items-center gap-2">
                <FolderOpen className="h-4 w-4" />
                <span>Projects</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('achievements')}
              className={`px-6 py-3 border-b-2 transition-colors ${
                activeTab === 'achievements'
                  ? 'border-primary text-foreground'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              <div className="flex items-center gap-2">
                <Trophy className="h-4 w-4" />
                <span>Achievements</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('testimonials')}
              className={`px-6 py-3 border-b-2 transition-colors ${
                activeTab === 'testimonials'
                  ? 'border-primary text-foreground'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              <div className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                <span>Testimonials</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('filters')}
              className={`px-6 py-3 border-b-2 transition-colors ${
                activeTab === 'filters'
                  ? 'border-primary text-foreground'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              <div className="flex items-center gap-2">
                <Tag className="h-4 w-4" />
                <span>Filters</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('content')}
              className={`px-6 py-3 border-b-2 transition-colors ${
                activeTab === 'content'
                  ? 'border-primary text-foreground'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                <span>Content Editor</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('publish')}
              className={`px-6 py-3 border-b-2 transition-colors ${
                activeTab === 'publish'
                  ? 'border-primary text-foreground'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              <div className="flex items-center gap-2">
                <Rocket className="h-4 w-4" />
                <span>Publish Manager</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`px-6 py-3 border-b-2 transition-colors ${
                activeTab === 'settings'
                  ? 'border-primary text-foreground'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              <div className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                <span>Settings</span>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'projects' ? (
        // Projects Tab
        <div className="container mx-auto px-4 py-8">
          <div className="mb-6 flex items-center justify-between flex-wrap gap-4">
            <h2>Projects ({projects.length})</h2>
            <div className="flex gap-2">
              <Button onClick={() => {
                setEditingProject({ ...emptyProject, id: crypto.randomUUID() });
                loadAchievements(); // Reload achievements to show latest list
                setIsDialogOpen(true);
              }}>
                <Plus className="h-4 w-4 mr-2" />
                Add New Project
              </Button>
              <Button onClick={handleImportDefaultProjects}>
                <Plus className="h-4 w-4 mr-2" />
                Import Default Projects
              </Button>
            </div>
          </div>

          {/* Projects Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <Card key={project.id} className={project.published === false ? "opacity-60" : ""}>
                <CardHeader>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <CardTitle className="text-lg">{project.title}</CardTitle>
                        {project.featured && (
                          <Badge variant="default" className="text-xs bg-yellow-500 hover:bg-yellow-600">
                            <Star className="h-3 w-3 mr-1 fill-current" />
                            Featured
                          </Badge>
                        )}
                        {project.published === false && (
                          <Badge variant="secondary" className="text-xs">
                            <EyeOff className="h-3 w-3 mr-1" />
                            Draft
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleToggleFeatured(project.id)}
                        title={project.featured ? 'Remove from featured' : 'Feature on homepage (max 3)'}
                        className={project.featured ? 'text-yellow-500 hover:text-yellow-600' : ''}
                      >
                        <Star className={`h-4 w-4 ${project.featured ? 'fill-current' : ''}`} />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          setEditingProject(project);
                          loadAchievements(); // Reload achievements to show latest list
                          setIsDialogOpen(true);
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDeleteProject(project.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                    {project.description}
                  </p>
                  <div className="flex flex-wrap gap-1 mb-2">
                    {project.projectCategory.map((cat, idx) => (
                      <Badge key={idx} variant="outline" className="text-xs">
                        {cat}
                      </Badge>
                    ))}
                  </div>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{project.images.length} image(s) • {project.date}</span>
                    {project.references && project.references.length > 0 && (
                      <Badge variant="outline" className="text-xs">
                        <LinkIcon className="h-3 w-3 mr-1" />
                        {project.references.length} ref{project.references.length !== 1 ? 's' : ''}
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {projects.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <p>{language === 'cs' ? 'Zatím žádné projekty. Klikněte na "Přidat nový projekt" a začněte.' : 'No projects yet. Click "Add New Project" to get started.'}</p>
            </div>
          )}
        </div>
      ) : activeTab === 'achievements' ? (
        // Achievements Tab
        <div className="container mx-auto px-4 py-8">
          <AchievementsManager token={token} />
        </div>
      ) : activeTab === 'testimonials' ? (
        // Testimonials Tab
        <div className="container mx-auto px-4 py-8">
          <TestimonialsManager token={token} />
        </div>
      ) : activeTab === 'filters' ? (
        // Filters Tab
        <div className="container mx-auto px-4 py-8">
          <FiltersManager token={token} onFiltersUpdated={loadFilters} />
        </div>
      ) : activeTab === 'content' ? (
        // Content Editor Tab
        <div className="container mx-auto px-4 py-8 space-y-6">
          {(() => {
            console.log('🎨 AdminDashboard: About to render ContentEditor with token:', token?.substring(0, 20) + '...');
            console.log('🎨 AdminDashboard: Full token being passed:', token);
            return null;
          })()}
          <ContentEditor token={token} />
        </div>
      ) : activeTab === 'publish' ? (
        // Publish Manager Tab
        <div className="container mx-auto px-4 py-8">
          <PublishManager token={token} />
        </div>
      ) : (
        // Settings Tab
        <div className="container mx-auto px-4 py-8 space-y-6">
          <SettingsManager token={token} />
        </div>
      )}

      {/* Edit/Create Project Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle>
                {editingProject?.id && projects.find(p => p.id === editingProject.id)
                  ? 'Edit Project'
                  : 'Create New Project'}
              </DialogTitle>
              {editingProject && editingProject.title && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAutoFillCzechFromEnglish}
                  disabled={translating}
                  className="ml-4"
                >
                  <Languages className="h-4 w-4 mr-2" />
                  {translating ? 'Překládám...' : '🪄 Auto-fill Czech from English'}
                </Button>
              )}
            </div>
          </DialogHeader>

          {editingProject && (
            <div className="space-y-4">
              {/* Title - EN & CS */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="flex items-center justify-between">
                    <span>Title (English)</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-6 px-2 text-xs"
                      onClick={() => handleAutoTranslate('title', 'titleCs', 'en-cs')}
                      disabled={translating || !editingProject.title}
                    >
                      <Languages className="h-3 w-3 mr-1" />
                      {translating ? 'Překládám...' : 'Auto-translate EN→CS'}
                    </Button>
                  </Label>
                  <Input
                    value={editingProject.title}
                    onChange={(e) => setEditingProject({ ...editingProject, title: e.target.value })}
                    placeholder="Project title in English"
                  />
                </div>
                <div>
                  <Label className="flex items-center justify-between">
                    <span>Title (Czech)</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-6 px-2 text-xs"
                      onClick={() => handleAutoTranslate('titleCs', 'title', 'cs-en')}
                      disabled={translating || !editingProject.titleCs}
                    >
                      <Languages className="h-3 w-3 mr-1" />
                      {translating ? 'Překládám...' : 'Auto-translate CS→EN'}
                    </Button>
                  </Label>
                  <Input
                    value={editingProject.titleCs || ''}
                    onChange={(e) => setEditingProject({ ...editingProject, titleCs: e.target.value })}
                    placeholder="Název projektu v češtině"
                  />
                </div>
              </div>

              {/* Description - EN & CS */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="flex items-center justify-between">
                    <span>Short Description (English)</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-6 px-2 text-xs"
                      onClick={() => handleAutoTranslate('description', 'descriptionCs', 'en-cs')}
                      disabled={translating || !editingProject.description}
                    >
                      <Languages className="h-3 w-3 mr-1" />
                      {translating ? 'Překládám...' : 'Auto-translate EN→CS'}
                    </Button>
                  </Label>
                  <Textarea
                    value={editingProject.description}
                    onChange={(e) => setEditingProject({ ...editingProject, description: e.target.value })}
                    placeholder="Brief description in English"
                    rows={2}
                  />
                </div>
                <div>
                  <Label className="flex items-center justify-between">
                    <span>Short Description (Czech)</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-6 px-2 text-xs"
                      onClick={() => handleAutoTranslate('descriptionCs', 'description', 'cs-en')}
                      disabled={translating || !editingProject.descriptionCs}
                    >
                      <Languages className="h-3 w-3 mr-1" />
                      {translating ? 'Překládám...' : 'Auto-translate CS→EN'}
                    </Button>
                  </Label>
                  <Textarea
                    value={editingProject.descriptionCs || ''}
                    onChange={(e) => setEditingProject({ ...editingProject, descriptionCs: e.target.value })}
                    placeholder="Stručný popis v češtině"
                    rows={2}
                  />
                </div>
              </div>

              {/* Full Description - EN & CS */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="flex items-center justify-between">
                    <span>Full Description (English)</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-6 px-2 text-xs"
                      onClick={() => handleAutoTranslate('fullDescription', 'fullDescriptionCs', 'en-cs')}
                      disabled={translating || !editingProject.fullDescription}
                    >
                      <Languages className="h-3 w-3 mr-1" />
                      {translating ? 'Překládám...' : 'Auto-translate EN→CS'}
                    </Button>
                  </Label>
                  <Textarea
                    value={editingProject.fullDescription}
                    onChange={(e) => setEditingProject({ ...editingProject, fullDescription: e.target.value })}
                    placeholder="Detailed description in English"
                    rows={4}
                  />
                </div>
                <div>
                  <Label className="flex items-center justify-between">
                    <span>Full Description (Czech)</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-6 px-2 text-xs"
                      onClick={() => handleAutoTranslate('fullDescriptionCs', 'fullDescription', 'cs-en')}
                      disabled={translating || !editingProject.fullDescriptionCs}
                    >
                      <Languages className="h-3 w-3 mr-1" />
                      {translating ? 'Překládám...' : 'Auto-translate CS→EN'}
                    </Button>
                  </Label>
                  <Textarea
                    value={editingProject.fullDescriptionCs || ''}
                    onChange={(e) => setEditingProject({ ...editingProject, fullDescriptionCs: e.target.value })}
                    placeholder="Podrobný popis v češtině"
                    rows={4}
                  />
                </div>
              </div>

              {/* Images */}
              <div>
                <Label>Images</Label>
                <div className="mt-2 space-y-2">
                  <div className="flex items-center gap-2">
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={handleUploadImage}
                      disabled={uploadingImage}
                      className="hidden"
                      id="image-upload"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => document.getElementById('image-upload')?.click()}
                      disabled={uploadingImage}
                    >
                      <UploadCloud className="h-4 w-4 mr-2" />
                      {uploadingImage ? 'Uploading...' : 'Upload Image'}
                    </Button>
                    <span className="text-xs text-muted-foreground">
                      {editingProject.thumbnailImage ? '✓ Thumbnail selected' : 'Click star to set thumbnail'}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-2">
                    {editingProject.images.map((url, idx) => (
                      <div key={idx} className="relative group aspect-square">
                        <img
                          src={url}
                          alt={`Project ${idx + 1}`}
                          className={`w-full h-full object-cover rounded-md ${
                            editingProject.thumbnailIndex === idx ? 'ring-2 ring-primary ring-offset-2' : ''
                          }`}
                        />
                        {editingProject.thumbnailIndex === idx && (
                          <div className="absolute top-2 left-2 bg-primary text-primary-foreground rounded-full px-2 py-1 text-xs font-medium">
                            ⭐ Thumbnail
                          </div>
                        )}
                        <button
                          type="button"
                          onClick={() => setEditingProject({ ...editingProject, thumbnailIndex: idx, thumbnailImage: url })}
                          className="absolute bottom-1 left-1 bg-background/90 hover:bg-primary text-foreground hover:text-primary-foreground rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity"
                          title="Set as thumbnail"
                        >
                          ⭐
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(idx)}
                          className="absolute top-1 right-1 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                  
                  {editingProject.images.length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-4 border-2 border-dashed rounded-lg">
                      No images yet. Upload images to get started.
                    </p>
                  )}
                </div>
              </div>

              {/* 3D Model */}
              <div>
                <Label>3D Model (GLB/GLTF)</Label>
                <div className="mt-2 space-y-2">
                  <div className="flex items-center gap-2">
                    <Input
                      type="file"
                      accept=".glb,.gltf"
                      onChange={handleUpload3DModel}
                      disabled={uploading3DModel}
                      className="hidden"
                      id="3d-model-upload"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => document.getElementById('3d-model-upload')?.click()}
                      disabled={uploading3DModel}
                    >
                      <UploadCloud className="h-4 w-4 mr-2" />
                      {uploading3DModel ? 'Uploading...' : 'Upload 3D Model'}
                    </Button>
                    <span className="text-xs text-muted-foreground">
                      {editingProject.model3dUrl ? '✓ Model uploaded' : 'Upload a 3D model file'}
                    </span>
                    {editingProject.model3dUrl && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setEditingProject({ ...editingProject, model3dPath: undefined, model3dUrl: undefined })}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  
                  {editingProject.model3dUrl && (
                    <div className="flex items-center gap-2 p-3 border rounded-lg">
                      <div className="h-12 w-12 bg-primary/10 rounded flex items-center justify-center">
                        <span className="text-2xl">📦</span>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">3D Model uploaded</p>
                        <p className="text-xs text-muted-foreground">{editingProject.model3dPath?.split('/').pop()}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Category - EN & CS (Legacy field for display) */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Category (English) - Display only</Label>
                  <Input
                    value={editingProject.category || ''}
                    onChange={(e) => setEditingProject({ ...editingProject, category: e.target.value })}
                    placeholder="e.g., Mechanical Design"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Legacy field - shown as badge on project card
                  </p>
                </div>
                <div>
                  <Label>Category (Czech) - Display only</Label>
                  <Input
                    value={editingProject.categoryCs || ''}
                    onChange={(e) => setEditingProject({ ...editingProject, categoryCs: e.target.value })}
                    placeholder="např., Mechanický design"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Česká verze kategorie
                  </p>
                </div>
              </div>

              {/* Project Date - When was this project created/completed */}
              <div>
                <Label>Project Date (Month & Year)</Label>
                <Input
                  type="month"
                  value={editingProject.date || ''}
                  onChange={(e) => {
                    const dateStr = e.target.value; // Format: YYYY-MM
                    // Parse date to get YYYYMM format for dateValue (for sorting)
                    const dateValue = parseInt(dateStr.replace('-', '')); // Remove dash: "2024-03" -> 202403
                    setEditingProject({ 
                      ...editingProject, 
                      date: dateStr,
                      dateValue: dateValue
                    });
                  }}
                  placeholder="YYYY-MM"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Nastavte měsíc a rok, kdy byl projekt vytvořen nebo dokončen. Používá se pro automatické řazení projektů podle data.
                </p>
              </div>

              {/* Specifications Table - EN & CS */}
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-2">
                  <Label>Specifications Table</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const currentSpecs = editingProject.specs || [];
                      const currentSpecsCs = editingProject.specsCs || [];
                      setEditingProject({
                        ...editingProject,
                        specs: [...currentSpecs, { label: '', value: '' }],
                        specsCs: [...currentSpecsCs, { label: '', value: '' }]
                      });
                    }}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Specification Row
                  </Button>
                </div>
                
                <div className="space-y-3">
                  {(editingProject.specs || []).map((spec, idx) => {
                    const specCs = (editingProject.specsCs || [])[idx] || { label: '', value: '' };
                    return (
                      <div key={idx} className="p-3 border rounded-lg space-y-2">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium">Row {idx + 1}</span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              const newSpecs = editingProject.specs?.filter((_, i) => i !== idx);
                              const newSpecsCs = editingProject.specsCs?.filter((_, i) => i !== idx);
                              setEditingProject({ 
                                ...editingProject, 
                                specs: newSpecs,
                                specsCs: newSpecsCs
                              });
                            }}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                        
                        {/* English */}
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <Label className="text-xs">Label (EN)</Label>
                            <Input
                              value={spec.label}
                              onChange={(e) => {
                                const newSpecs = [...(editingProject.specs || [])];
                                newSpecs[idx] = { ...newSpecs[idx], label: e.target.value };
                                setEditingProject({ ...editingProject, specs: newSpecs });
                              }}
                              placeholder="e.g., Materials"
                            />
                          </div>
                          <div>
                            <Label className="text-xs">Value (EN)</Label>
                            <Input
                              value={spec.value}
                              onChange={(e) => {
                                const newSpecs = [...(editingProject.specs || [])];
                                newSpecs[idx] = { ...newSpecs[idx], value: e.target.value };
                                setEditingProject({ ...editingProject, specs: newSpecs });
                              }}
                              placeholder="e.g., PETG"
                            />
                          </div>
                        </div>
                        
                        {/* Czech */}
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <Label className="text-xs">Label (CS)</Label>
                            <Input
                              value={specCs.label}
                              onChange={(e) => {
                                const newSpecsCs = [...(editingProject.specsCs || [])];
                                while (newSpecsCs.length <= idx) {
                                  newSpecsCs.push({ label: '', value: '' });
                                }
                                newSpecsCs[idx] = { ...newSpecsCs[idx], label: e.target.value };
                                setEditingProject({ ...editingProject, specsCs: newSpecsCs });
                              }}
                              placeholder="např., Materiály"
                            />
                          </div>
                          <div>
                            <Label className="text-xs">Value (CS)</Label>
                            <Input
                              value={specCs.value}
                              onChange={(e) => {
                                const newSpecsCs = [...(editingProject.specsCs || [])];
                                while (newSpecsCs.length <= idx) {
                                  newSpecsCs.push({ label: '', value: '' });
                                }
                                newSpecsCs[idx] = { ...newSpecsCs[idx], value: e.target.value };
                                setEditingProject({ ...editingProject, specsCs: newSpecsCs });
                              }}
                              placeholder="např., PETG"
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  {(!editingProject.specs || editingProject.specs.length === 0) && (
                    <p className="text-sm text-muted-foreground text-center py-4 border-2 border-dashed rounded-lg">
                      No specifications added yet. Click "Add Specification Row" to add details like Materials, Type of print, Time, etc.
                    </p>
                  )}
                </div>
              </div>

              {/* Link to Achievement */}
              <div>
                <Label>Link to Achievement (optional)</Label>
                <Select
                  value={editingProject.award || 'none'}
                  onValueChange={(value) => setEditingProject({ ...editingProject, award: value === 'none' ? undefined : value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="No achievement linked" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No achievement</SelectItem>
                    {achievements.map((achievement) => (
                      <SelectItem key={achievement.id} value={achievement.id}>
                        {achievement.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {editingProject.award && editingProject.award !== 'none' && (
                  <p className="text-xs text-muted-foreground mt-1">
                    This project will show the achievement badge
                  </p>
                )}
              </div>

              {/* Filter Selection */}
              <div className="space-y-4">
                <Label>Filter Categories (for filtering on website)</Label>
                <p className="text-xs text-muted-foreground">
                  Select which filter options apply to this project. These will be used to filter projects on the public website.
                </p>
                
                {filterOptions.length > 0 ? (
                  <div className="space-y-4">
                    {filterOptions.map((filter) => (
                      <div key={filter.id} className="p-4 border rounded-lg space-y-2">
                        <Label className="text-sm font-medium">{filter.name} / {filter.nameCs}</Label>
                        <div className="flex flex-wrap gap-2">
                          {filter.options.map((option) => {
                            const isSelected = (editingProject.filters || []).includes(option.value);
                            return (
                              <button
                                key={option.value}
                                type="button"
                                onClick={() => {
                                  const currentFilters = editingProject.filters || [];
                                  const newFilters = isSelected
                                    ? currentFilters.filter(f => f !== option.value)
                                    : [...currentFilters, option.value];
                                  setEditingProject({ ...editingProject, filters: newFilters });
                                }}
                                className={`px-3 py-1.5 rounded-md text-sm transition-colors ${
                                  isSelected
                                    ? 'bg-primary text-primary-foreground'
                                    : 'bg-muted hover:bg-muted/80'
                                }`}
                              >
                                {option.label} / {option.labelCs}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4 border-2 border-dashed rounded-lg">
                    No filters configured yet. Go to the Filters tab to create filter categories.
                  </p>
                )}
                
                {editingProject.filters && editingProject.filters.length > 0 && (
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="text-xs font-medium mb-2">Selected filters ({editingProject.filters.length}):</p>
                    <div className="flex flex-wrap gap-1">
                      {editingProject.filters.map((filterId, idx) => (
                        <Badge key={idx} variant="secondary" className="text-xs">
                          {filterId}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Published Status */}
              <div className="flex items-center gap-2 p-4 border rounded-lg">
                <input
                  type="checkbox"
                  id="published"
                  checked={editingProject.published ?? true}
                  onChange={(e) => setEditingProject({ ...editingProject, published: e.target.checked })}
                  className="h-4 w-4 rounded border-gray-300"
                />
                <Label htmlFor="published" className="flex items-center gap-2 cursor-pointer">
                  {editingProject.published ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                  Published (visible on website)
                </Label>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveProject}>
              <Save className="h-4 w-4 mr-2" />
              Save Project
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Change Password Dialog */}
      <ChangePasswordDialog open={changePasswordOpen} onOpenChange={setChangePasswordOpen} token={token} />
    </div>
  );
}