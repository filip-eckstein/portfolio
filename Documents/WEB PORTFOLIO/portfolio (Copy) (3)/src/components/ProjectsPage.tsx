import { useState, useEffect } from "react";
import { Award, Calendar, Package, Filter, ArrowUpDown, Star, Quote, ArrowLeft, Languages, ChevronLeft, ChevronRight, Trophy, ExternalLink, RefreshCw, Box } from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";
import { Dialog, DialogContent, DialogTitle } from "./ui/dialog";
import { VisuallyHidden } from "./ui/visually-hidden";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { Language, translations } from "../translations";
import { useNavigate, useLocation } from "react-router-dom";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { toast } from "sonner@2.0.3";
import electricalModel from "figma:asset/62d8593efd79e12a0b06122e6007ca0c4730824d.png";
import electricalModel2 from "figma:asset/6fdf721683aec5ec429e2d6bdc5651ef0787378e.png";
import electricalModel3 from "figma:asset/ea097ce0212ea99548672bdadc5ebf283fc081e6.png";
import electricalModel4 from "figma:asset/82c29c9796a291b2ac98bc4c6cc9877368cd956d.png";
import streamDeck from "figma:asset/4bbad57f64b1382cf879e6728a7572a7f2cc341d.png";
import challengerModel from "figma:asset/e1ce0d6f62fe2dacdb3fbe6f747b60956409fd42.png";
import challengerModel2 from "figma:asset/0d1bb588e5992c2c72ed3480310796d5395f1293.png";
import challengerModel3 from "figma:asset/d260ee437c480774e21d3d6ada2358bab82117f6.png";
import challengerModel4 from "figma:asset/c64afad24b6cd0e757f5880418fd6a4c683b2755.png";
import challengerModel5 from "figma:asset/a04cd99685596c45b53450e938b4403696b6c4d4.png";
import challengerModel6 from "figma:asset/add07ce6705c3086550c25cd898060e3804af0fb.png";
import challengerModel7 from "figma:asset/fa6b4478e730d77bd6701db2087b59e2f8b4f762.png";
import characterModels from "figma:asset/b2bfe5ea9f06c761db0f48d76c137fd2ecc0e5d8.png";
import characterModels2 from "figma:asset/29b5f5bebf61bd09c95fdfec8a6d71f569e49c7e.png";
import characterModels3 from "figma:asset/bc620491615b7a9f82e72dafd9e743cf98e60b95.png";
import toolOrganizer from "figma:asset/e1aac002f66c73c55758770fc2b9a28181c72ddf.png";
import planterMold from "figma:asset/8d11d5a409f9c1a7e6b2d90a1f509bed4e4182f2.png";
import batteryOrganizer from "figma:asset/c1fdfa35041a1996aeb98d1acf3b0100e2cd9383.png";
import batteryOrganizer2 from "figma:asset/543c2974b7d44cf8e9f0ecd160c51975df3af685.png";
import batteryOrganizer3 from "figma:asset/6ced74a283c77056e9ded6c7969b061b2f1d8312.png";
import paddleShifter from "figma:asset/9f9a2451964984c1d864c97ad7e7234214c5f4ae.png";
import toyFigure from "figma:asset/e6b8001612a40e8233bdcedfaa275041607cfe89.png";
import toyFigure2 from "figma:asset/8eda25fcf6f45a9c9ddc124d3d9d6803751e161d.png";
import toyFigure3 from "figma:asset/bdcb68220507a7f872007542c1fee3dec4fe5cbe.png";
import vacuumAdapter from "figma:asset/fd307fb7e5ef5c58020b85bd7a087eea59658040.png";
import vacuumAdapter2 from "figma:asset/5a9f88fc844d6db3d2efb54f8d1e045057c3f87e.png";
import vacuumAdapter3 from "figma:asset/0507df6a9d069084333ce2720237321889b59d90.png";
import kiteParts from "figma:asset/6bec7e92de6ea913ef52a4d6fb28208cecb04bf4.png";
import sporilovModel from "figma:asset/2087e6eab28d687630042f8ca41ec8a6d41e0c4d.png";
import prokopskeUdoli from "figma:asset/4364ce80ae498b0c0b47e052d61a50736082ac79.png";
import teamKeychain from "figma:asset/ee94e6501553b11fbd35a1adab0a6138b6d4f5a8.png";

interface Project {
  id: string;
  title: string;
  titleCs?: string; // Czech title
  description: string;
  descriptionCs?: string; // Czech description
  fullDescription: string;
  fullDescriptionCs?: string; // Czech full description
  category: string; // Legacy field, keeping for backward compatibility
  categoryCs?: string; // Czech category
  projectCategory: ("Education" | "Functional Part" | "Product Design" | "Electronics" | "Other")[]; // New organized category (can be multiple)
  date: string;
  dateValue: number; // Numeric value for sorting (YYYYMM format)
  difficulty: "Beginner" | "Intermediate" | "Advanced"; // Project difficulty level
  difficultyCs?: string; // Czech difficulty translation
  software: string[];
  softwareCs?: string[]; // Czech software names
  material: string; // Single material per project
  materialCs?: string; // Czech material name
  printingTechnology: "FDM" | "SLA";
  designSource: "My Design" | "Downloaded Model";
  materials: string[]; // Legacy field - now used for multi-material filtering
  printTechnology: string[]; // Legacy field
  sortOrder?: number; // Manual sort order (priority)
  technologies: string[];
  technologiesCs?: string[]; // Czech technology names
  award?: string;
  awardCs?: string; // Czech award text
  images: string[];
  thumbnailIndex?: number; // Index of the thumbnail image in images array
  model3dUrl?: string; // URL for 3D model (GLB/GLTF)
  duration?: string; // Time required to complete the project (English)
  durationCs?: string; // Time required to complete the project (Czech)
  specs: {
    label: string;
    labelCs?: string; // Czech label
    value: string;
    valueCs?: string; // Czech value
  }[];
  specsCs?: { // Alternative: separate Czech specs array
    label: string;
    value: string;
  }[];
  references?: { name: string; url: string; }[];
  filters?: string[]; // Array of filter IDs from FiltersManager
  published?: boolean;
  slug?: string; // New field for URL-friendly project identifier
}

interface ProjectsPageProps {
  language: Language;
  onLanguageChange: (lang: Language) => void;
}

export function ProjectsPage({ language, onLanguageChange }: ProjectsPageProps) {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [enlargedImage, setEnlargedImage] = useState<string | null>(null);
  const [enlargedImageIndex, setEnlargedImageIndex] = useState<number>(0);
  const [achievements, setAchievements] = useState<any[]>([]);
  const [projects, setProjects] = useState<Project[]>([]); // Changed from const to state
  const [testimonials, setTestimonials] = useState<any[]>([]); // Add testimonials state
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filterOptions, setFilterOptions] = useState<{
    id: string;
    name: string;
    nameCs: string;
    options: { value: string; label: string; labelCs: string }[];
  }[]>([]);
  const navigate = useNavigate();
  const location = useLocation();
  
  const t = translations[language].projectsPage;

  // Load projects from API
  useEffect(() => {
    loadProjects();
    loadTestimonials(); // Load testimonials on mount
    loadFilters(); // Load filters on mount
  }, []);

  // Load Google Model Viewer script
  useEffect(() => {
    // Check if script is already loaded
    if (document.querySelector('script[src*="model-viewer"]')) {
      return;
    }

    const script = document.createElement('script');
    script.type = 'module';
    script.src = 'https://ajax.googleapis.com/ajax/libs/model-viewer/3.4.0/model-viewer.min.js';
    document.head.appendChild(script);

    return () => {
      // Cleanup if needed
    };
  }, []);

  // Auto-refresh when window gains focus (e.g., returning from admin page)
  useEffect(() => {
    const handleFocus = () => {
      loadProjects();
      loadTestimonials(); // Also refresh testimonials
    };
    
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, []);

  const loadTestimonials = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-635fd90e/admin/testimonials`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
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

  const loadProjects = async (showRefreshing = false) => {
    try {
      if (showRefreshing) setRefreshing(true);
      // Add timestamp to prevent caching
      const timestamp = Date.now();
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-635fd90e/projects?t=${timestamp}`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        console.log('📊 Loaded projects from API:', data.projects?.length || 0, 'projects');
        if (data.projects && data.projects.length > 0) {
          console.log('🔍 First project sample:', {
            id: data.projects[0].id,
            title: data.projects[0].title,
            duration: data.projects[0].duration,
            durationCs: data.projects[0].durationCs,
            material: data.projects[0].material,
            printingTechnology: data.projects[0].printingTechnology,
          });
        }
        setProjects(data.projects || []);
      }
    } catch (error) {
      console.error('Error loading projects:', error);
    } finally {
      setLoading(false);
      if (showRefreshing) setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    loadProjects(true);
  };

  // Load achievements to check which projects are competition projects
  useEffect(() => {
    loadAchievements();
  }, []);

  const loadAchievements = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-635fd90e/admin/achievements`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
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

  const loadFilters = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-635fd90e/filters`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        console.log('🔍 Raw filters from API:', data);
        const validFilters = (data.filters || [])
          .filter((f: any) => f && f.id);
        setFilterOptions(validFilters);
        console.log('📊 Loaded filters:', validFilters);
        console.log('📊 Number of filter categories:', validFilters.length);
      } else {
        console.error('❌ Failed to load filters, status:', response.status);
      }
    } catch (error) {
      console.error('❌ Error loading filters:', error);
    }
  };

  // Restore scroll position when returning to projects page
  useEffect(() => {
    const savedScrollPosition = localStorage.getItem('projectsScrollPosition');
    if (savedScrollPosition) {
      const scrollY = parseInt(savedScrollPosition, 10);
      window.scrollTo(0, scrollY);
      localStorage.removeItem('projectsScrollPosition');
    } else {
      window.scrollTo(0, 0);
    }
  }, []);

  // Check for project ID in URL and auto-select project
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const projectIdParam = searchParams.get('project');
    
    // Only process if there's a valid project parameter (not null or empty) AND projects are loaded
    if (projectIdParam && projectIdParam.trim() !== '' && projects.length > 0) {
      console.log('🔍 Auto-select project check:', { 
        projectIdParam, 
        projectsLoaded: projects.length,
        projectSlugs: projects.map(p => ({ id: p.id, slug: p.slug }))
      });
      
      // Try to find by slug first, then by id
      const project = projects.find(p => p.slug === projectIdParam || p.id === projectIdParam);
      
      if (project) {
        console.log('✅ Project found, setting selectedProject:', project.title);
        setSelectedProject(project);
      }
      // Removed warning log - no need to warn if project not found, user might have invalid/old URL
    }
  }, [location.search, projects]);
  
  // Update selected project when language changes
  useEffect(() => {
    if (selectedProject) {
      const updatedProject = projects.find(p => p.id === selectedProject.id);
      if (updatedProject) {
        setSelectedProject(updatedProject);
      }
    }
  }, [language, projects]);

  // Scroll to top when project is selected
  useEffect(() => {
    if (selectedProject) {
      window.scrollTo(0, 0);
    }
  }, [selectedProject]);

  const categories = ["All", "Mechanical Design", "Product Design", "Architectural", "Educational"];
  const [activeCategory, setActiveCategory] = useState("All");
  
  // Sorting state
  type SortOption = "date-newest" | "date-oldest" | "difficulty-easy" | "difficulty-hard" | "alphabetically-az" | "alphabetically-za" | "none";
  const [sortBy, setSortBy] = useState<SortOption>("none");
  
  // Load default sort order from settings
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const response = await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-635fd90e/settings`,
          {
            headers: {
              'Authorization': `Bearer ${publicAnonKey}`,
            },
          }
        );

        if (response.ok) {
          const data = await response.json();
          // Use webDefaultSortOrder for public web
          if (data.settings?.webDefaultSortOrder) {
            setSortBy(data.settings.webDefaultSortOrder as SortOption);
            console.log('Web default sort order:', data.settings.webDefaultSortOrder);
          }
        }
      } catch (error) {
        console.error('Error loading settings:', error);
      }
    };
    
    loadSettings();
  }, []);
  
  // Filter states - NEW dynamic system based on FiltersManager
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);

  // Filtered and sorted projects
  
  // Clear all filters
  const clearAllFilters = () => {
    setSelectedFilters([]);
  };
  
  // Apply all filters - NEW dynamic system based on project.filters array
  const filteredProjects = projects.filter(project => {
    // If no filters are selected, show all projects
    if (selectedFilters.length === 0) {
      return true;
    }
    
    // Check if project has any of the selected filters
    const projectFilters = project.filters || [];
    
    // Group selected filters by category
    const selectedByCategory: { [categoryId: string]: string[] } = {};
    selectedFilters.forEach(filterId => {
      // Find which category this filter belongs to
      const category = filterOptions.find(cat => 
        cat.options.some(opt => opt.value === filterId)
      );
      if (category) {
        if (!selectedByCategory[category.id]) {
          selectedByCategory[category.id] = [];
        }
        selectedByCategory[category.id].push(filterId);
      }
    });
    
    // For each category, check if project has at least one of the selected options
    for (const categoryId in selectedByCategory) {
      const selectedInCategory = selectedByCategory[categoryId];
      const hasMatch = selectedInCategory.some(filterId => 
        projectFilters.includes(filterId)
      );
      if (!hasMatch) {
        return false; // Project doesn't match this category
      }
    }
    
    return true; // Project matches all categories
  });
  
  // Sort options
  const sortOptions = [
    { value: "featured", label: language === "en" ? "Featured" : "Zvýrazněné" },
    { value: "date-newest", label: language === "en" ? "Newest First" : "Nejnovější" },
    { value: "date-oldest", label: language === "en" ? "Oldest First" : "Nejstarší" },
    { value: "difficulty-easy", label: language === "en" ? "Easy First" : "Nejjednodušší" },
    { value: "difficulty-hard", label: language === "en" ? "Hard First" : "Nejtěžší" },
  ];
  
  // Apply sorting
  const sortedProjects = [...filteredProjects].sort((a, b) => {
    // Priority 1: User-selected sorting (if active)
    if (sortBy === "date-newest") {
      // Sort by date (newest first)
      return b.dateValue - a.dateValue;
    } else if (sortBy === "date-oldest") {
      // Sort by date (oldest first)
      return a.dateValue - b.dateValue;
    } else if (sortBy === "difficulty-easy") {
      // Sort by difficulty (Beginner -> Intermediate -> Advanced)
      const difficultyOrder = { "Beginner": 1, "Intermediate": 2, "Advanced": 3 };
      return difficultyOrder[a.difficulty] - difficultyOrder[b.difficulty];
    } else if (sortBy === "difficulty-hard") {
      // Sort by difficulty (Advanced -> Intermediate -> Beginner)
      const difficultyOrder = { "Beginner": 3, "Intermediate": 2, "Advanced": 1 };
      return difficultyOrder[a.difficulty] - difficultyOrder[b.difficulty];
    } else if (sortBy === "alphabetically-az") {
      // Sort alphabetically A-Z
      return a.title.localeCompare(b.title, 'cs');
    } else if (sortBy === "alphabetically-za") {
      // Sort alphabetically Z-A
      return b.title.localeCompare(a.title, 'cs');
    }
    
    // Priority 2: Featured projects (when no other sorting is active)
    if (!sortBy || sortBy === "featured") {
      // Check if project has featured flag
      if (a.sortOrder !== undefined && b.sortOrder === undefined) return -1;
      if (a.sortOrder === undefined && b.sortOrder !== undefined) return 1;
      
      // If both have sortOrder, sort by it
      if (a.sortOrder !== undefined && b.sortOrder !== undefined) {
        return a.sortOrder - b.sortOrder;
      }
    }
    
    // Priority 3: If no featured flag, maintain date order (newest first)
    if (a.sortOrder === undefined && b.sortOrder === undefined) {
      return b.dateValue - a.dateValue;
    }
    
    // Sort by sortOrder if both have it
    if (a.sortOrder !== undefined && b.sortOrder !== undefined) {
      return a.sortOrder - b.sortOrder;
    }
    
    // Put projects with sortOrder first
    if (a.sortOrder !== undefined) return -1;
    if (b.sortOrder !== undefined) return 1;
    
    // No sorting - maintain original order
    return 0;
  });
  
  const activeFiltersCount = selectedFilters.length;
  
  // Handle modal
  const goBack = () => {
    navigate("/");
  };

  const handleBackFromProject = () => {
    // Check if user came from main page or achievements page
    const fromMainPage = localStorage.getItem('projectOpenedFromMainPage') === 'true';
    const fromAchievements = localStorage.getItem('projectOpenedFromAchievements') === 'true';
    
    if (fromMainPage) {
      // Clear the flag and return to main page
      localStorage.removeItem('projectOpenedFromMainPage');
      setSelectedProject(null);
      navigate("/");
    } else if (fromAchievements) {
      // Clear the flag and return to achievements page
      localStorage.removeItem('projectOpenedFromAchievements');
      setSelectedProject(null);
      navigate("/achievements");
    } else {
      // Opened from projects page - just clear selected project
      setSelectedProject(null);
      // Restore scroll position if available
      const savedScrollPosition = localStorage.getItem('projectsScrollPosition');
      if (savedScrollPosition) {
        setTimeout(() => {
          const scrollY = parseInt(savedScrollPosition, 10);
          window.scrollTo(0, scrollY);
          localStorage.removeItem('projectsScrollPosition');
        }, 0);
      }
    }
  };

  // Function to get testimonial for a project
  const getTestimonialForProject = (projectId: string) => {
    return testimonials.find(t => t.projectId === projectId);
  };

  if (selectedProject) {
    return (
      <div className="min-h-screen bg-background">
        <div className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md shadow-md">
          <div className="container mx-auto px-4 py-3 flex items-center justify-between">
            <Button variant="ghost" onClick={handleBackFromProject}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              {t.backToProjects}
            </Button>
            
            <div className="flex items-center gap-2">
              <Languages className="h-4 w-4 text-muted-foreground" />
              <button
                onClick={() => onLanguageChange("en")}
                className={`transition-colors ${
                  language === "en" 
                    ? "text-foreground" 
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                EN
              </button>
              <span className="text-muted-foreground">/</span>
              <button
                onClick={() => onLanguageChange("cs")}
                className={`transition-colors ${
                  language === "cs" 
                    ? "text-foreground" 
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                CZ
              </button>
            </div>
          </div>
        </div>
        
        <div className="container mx-auto px-4 py-8 pt-24">
          <div className="max-w-6xl mx-auto">
            <div className="mb-8">
              {selectedProject.award && (
                <div className="inline-flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-full mb-4">
                  <Award className="h-4 w-4 text-primary" />
                  <span className="text-sm text-primary">
                    {language === 'cs' ? (selectedProject.awardCs || '') : selectedProject.award}
                  </span>
                </div>
              )}
              <h1 className="mb-4 text-foreground">
                {language === 'cs' ? (selectedProject.titleCs || '') : selectedProject.title}
              </h1>
              <div className="flex flex-wrap gap-2 mb-4">
                <Badge variant="outline">
                  <Calendar className="h-3 w-3 mr-1" />
                  {selectedProject.date}
                </Badge>
                <Badge variant="outline">
                  <Package className="h-3 w-3 mr-1" />
                  {language === 'cs' ? (selectedProject.categoryCs || '') : selectedProject.category}
                </Badge>
              </div>
              <p className="text-muted-foreground text-lg">
                {language === 'cs' ? (selectedProject.descriptionCs || '') : selectedProject.description}
              </p>
            </div>

            <div className="space-y-6">{/* Main content section */}
                <Card>
                  <CardContent className="p-6">
                    <h3 className="mb-4 text-foreground">{t.projectDescription}</h3>
                    <p className="text-muted-foreground leading-relaxed">
                      {language === 'cs' ? (selectedProject.fullDescriptionCs || '') : selectedProject.fullDescription}
                    </p>
                  </CardContent>
                </Card>

                {(() => {
                  const testimonial = getTestimonialForProject(selectedProject.id);
                  if (testimonial) {
                    return (
                      <Card className="relative">
                        <CardContent className="p-6">
                          <div className="absolute top-6 right-6 text-primary/10">
                            <Quote className="h-12 w-12" fill="currentColor" />
                          </div>
                          
                          <h3 className="mb-6 text-foreground">
                            {language === "en" ? "Client Reference" : "Reference klienta"}
                          </h3>
                          
                          <div className="flex items-center gap-4 mb-4">
                            <Avatar className="h-12 w-12">
                              <AvatarFallback className="bg-primary text-primary-foreground">
                                {testimonial.initials}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <h4 className="text-foreground">{testimonial.name}</h4>
                              <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                              <p className="text-xs text-muted-foreground">{testimonial.company}</p>
                            </div>
                          </div>

                          <div className="flex gap-1 mb-4">
                            {Array.from({ length: testimonial.rating }).map((_, i) => (
                              <Star key={i} className="h-4 w-4 fill-primary text-primary" />
                            ))}
                          </div>

                          <p className="text-muted-foreground leading-relaxed">
                            "{language === 'en' ? testimonial.content : testimonial.contentCs}"
                          </p>
                        </CardContent>
                      </Card>
                    );
                  }
                  return null;
                })()}

                <div className="grid md:grid-cols-2 gap-6">
                  <Card>
                    <CardContent className="p-6">
                      <h3 className="mb-4 text-foreground">{t.softwareUsed}</h3>
                      <div className="flex flex-wrap gap-2">
                        {(language === 'cs' ? (selectedProject.softwareCs || []) : selectedProject.software).map((soft, idx) => (
                          <Badge key={idx} variant="secondary">{soft}</Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-6">
                      <h3 className="mb-4 text-foreground">{t.specifications}</h3>
                      <div className="space-y-2">
                        {selectedProject.specs.map((spec, idx) => {
                          // Prefer specsCs array if available, otherwise use inline labelCs/valueCs
                          const specCs = selectedProject.specsCs && selectedProject.specsCs[idx];
                          const label = language === 'cs' 
                            ? (specCs?.label || spec.labelCs || '')
                            : spec.label;
                          const value = language === 'cs'
                            ? (specCs?.value || spec.valueCs || '')
                            : spec.value;
                          
                          return (
                            <div key={idx} className="flex justify-between">
                              <span className="text-muted-foreground">{label}:</span>
                              <span>{value}</span>
                            </div>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* References & Publications */}
                {selectedProject.references && selectedProject.references.length > 0 && (
                  <>
                    <h3 className="text-foreground mt-8 mb-4">{language === "en" ? "References & Publications" : "Reference a publikace"}</h3>
                    <Card>
                      <CardContent className="p-6">
                        <div className="space-y-3">
                          {selectedProject.references.map((ref, idx) => (
                            <a
                              key={idx}
                              href={ref.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors group"
                            >
                              <ExternalLink className="h-4 w-4 text-muted-foreground group-hover:text-primary" />
                              <span className="flex-1 group-hover:text-primary">{ref.name}</span>
                            </a>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </>
                )}

                {/* 3D Model Viewer */}
                {selectedProject.model3dUrl && (
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center gap-2 mb-4">
                        <Box className="h-5 w-5 text-primary" />
                        <h3 className="text-foreground">
                          {language === "en" ? "3D Model" : "3D Model"}
                        </h3>
                      </div>
                      <div className="relative w-full h-[500px] bg-muted rounded-lg overflow-hidden">
                        <model-viewer
                          src={selectedProject.model3dUrl}
                          alt={selectedProject.title}
                          auto-rotate
                          camera-controls
                          shadow-intensity="1"
                          exposure="0.8"
                          style={{
                            width: '100%',
                            height: '100%',
                            backgroundColor: '#d1d5db', // Medium gray background - not too dark, not too bright
                            '--poster-color': '#d1d5db',
                          } as any}
                        ></model-viewer>
                      </div>
                      <p className="text-xs text-muted-foreground mt-2 text-center">
                        {language === "en" 
                          ? "Drag to rotate • Scroll to zoom • Touch to interact" 
                          : "Přetáhněte pro otočení • Rolujte pro přiblížení • Dotyk pro interakci"}
                      </p>
                    </CardContent>
                  </Card>
                )}

                {/* Image Gallery */}
                <h3 className="text-foreground mt-8 mb-4">{language === "en" ? "Project Gallery" : "Galerie projektu"}</h3>
                <div className="grid md:grid-cols-2 gap-6">
                  {selectedProject.images.map((image, idx) => {
                    const useObjectCover = selectedProject.id === "dodge-challenger-model" || selectedProject.id === "educational-electrical-model";
                    return (
                      <Card 
                        key={idx} 
                        className={`${useObjectCover ? "overflow-hidden" : "overflow-hidden bg-muted"} cursor-pointer transition-transform hover:scale-[1.02]`}
                        onClick={() => {
                          setEnlargedImage(image);
                          setEnlargedImageIndex(idx);
                        }}
                      >
                        <ImageWithFallback
                          src={image}
                          alt={`${selectedProject.title} - View ${idx + 1}`}
                          className={useObjectCover ? "w-full h-80 object-cover" : "w-full h-80 object-contain"}
                        />
                      </Card>
                    );
                  })}
                </div>
            </div>{/* End of main content section */}
          </div>
        </div>

        {/* Image Enlargement Dialog */}
        <Dialog open={!!enlargedImage} onOpenChange={() => setEnlargedImage(null)}>
          <DialogContent 
            className="!max-w-[95vw] !w-[95vw] h-[95vh] max-h-[95vh] p-4 flex flex-col" 
            aria-describedby={undefined}
            onKeyDown={(e) => {
              if (!selectedProject) return;
              if (e.key === "ArrowLeft") {
                e.preventDefault();
                const newIndex = enlargedImageIndex === 0 ? selectedProject.images.length - 1 : enlargedImageIndex - 1;
                setEnlargedImageIndex(newIndex);
                setEnlargedImage(selectedProject.images[newIndex]);
              } else if (e.key === "ArrowRight") {
                e.preventDefault();
                const newIndex = enlargedImageIndex === selectedProject.images.length - 1 ? 0 : enlargedImageIndex + 1;
                setEnlargedImageIndex(newIndex);
                setEnlargedImage(selectedProject.images[newIndex]);
              }
            }}
          >
            <VisuallyHidden>
              <DialogTitle>
                {language === "en" ? "Image Gallery" : "Galerie obrázků"}
              </DialogTitle>
            </VisuallyHidden>
            <div className="flex-1 flex items-center justify-center overflow-hidden relative">
              {enlargedImage && selectedProject && (
                <>
                  {/* Previous Button */}
                  {selectedProject.images.length > 1 && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute left-2 top-1/2 -translate-y-1/2 h-12 w-12 rounded-full bg-background/80 hover:bg-background/90 z-10"
                      onClick={() => {
                        const newIndex = enlargedImageIndex === 0 ? selectedProject.images.length - 1 : enlargedImageIndex - 1;
                        setEnlargedImageIndex(newIndex);
                        setEnlargedImage(selectedProject.images[newIndex]);
                      }}
                    >
                      <ChevronLeft className="h-6 w-6" />
                    </Button>
                  )}
                  
                  {/* Image */}
                  <ImageWithFallback
                    src={enlargedImage}
                    alt="Enlarged view"
                    className="max-w-full max-h-full w-auto h-auto object-contain"
                  />
                  
                  {/* Next Button */}
                  {selectedProject.images.length > 1 && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute right-2 top-1/2 -translate-y-1/2 h-12 w-12 rounded-full bg-background/80 hover:bg-background/90 z-10"
                      onClick={() => {
                        const newIndex = enlargedImageIndex === selectedProject.images.length - 1 ? 0 : enlargedImageIndex + 1;
                        setEnlargedImageIndex(newIndex);
                        setEnlargedImage(selectedProject.images[newIndex]);
                      }}
                    >
                      <ChevronRight className="h-6 w-6" />
                    </Button>
                  )}
                  
                  {/* Image Counter */}
                  {selectedProject.images.length > 1 && (
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-background/80 px-3 py-1 rounded-full text-sm">
                      {enlargedImageIndex + 1} / {selectedProject.images.length}
                    </div>
                  )}
                </>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background pt-20">
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-center items-center py-20">
            <div className="text-muted-foreground">{language === "en" ? "Loading projects..." : "Načítání projektů..."}</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pt-20">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-center mb-4 text-foreground">{t.title}</h1>
          <p className="text-center text-muted-foreground mb-8 max-w-2xl mx-auto">
            {t.subtitle}
          </p>
          
          <div className="mb-8">
            <div className="flex flex-col gap-4 mb-4">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <Button 
                    variant="outline" 
                    onClick={() => setShowFilters(!showFilters)}
                    className="gap-2"
                  >
                    <Filter className="h-4 w-4" />
                    {language === "en" ? "Advanced Filters" : "Pokročilé filtry"}
                    {activeFiltersCount > 0 && (
                      <Badge variant="secondary" className="ml-1">
                        {activeFiltersCount}
                      </Badge>
                    )}
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    onClick={handleRefresh}
                    disabled={refreshing}
                    className="gap-2"
                    title={language === "en" ? "Refresh projects" : "Obnovit projekty"}
                  >
                    <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
                    {language === "en" ? "Refresh" : "Obnovit"}
                  </Button>
                </div>
                
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={clearAllFilters}
                  disabled={activeFiltersCount === 0}
                  className="gap-2"
                >
                  {language === "en" ? "Clear All Filters" : "Vymazat všechny filtry"}
                  {activeFiltersCount > 0 && (
                    <Badge variant="secondary" className="ml-1">
                      {activeFiltersCount}
                    </Badge>
                  )}
                </Button>
              </div>
              
              {/* Sorting buttons */}
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm text-muted-foreground">
                  <ArrowUpDown className="h-4 w-4 inline mr-1" />
                  {language === "en" ? "Sort:" : "Seřadit:"}
                </span>
                <Button 
                  variant={sortBy === "date-newest" ? "default" : "outline"} 
                  size="sm"
                  onClick={() => setSortBy(sortBy === "date-newest" ? "none" : "date-newest")}
                >
                  {language === "en" ? "Date (Latest)" : "Datum (Nejnovější)"}
                </Button>
                <Button 
                  variant={sortBy === "date-oldest" ? "default" : "outline"} 
                  size="sm"
                  onClick={() => setSortBy(sortBy === "date-oldest" ? "none" : "date-oldest")}
                >
                  {language === "en" ? "Date (Oldest)" : "Datum (Nejstarší)"}
                </Button>
                <Button 
                  variant={sortBy === "difficulty-easy" ? "default" : "outline"} 
                  size="sm"
                  onClick={() => setSortBy(sortBy === "difficulty-easy" ? "none" : "difficulty-easy")}
                >
                  {language === "en" ? "Difficulty (Easy)" : "Obtížnost (Snadná)"}
                </Button>
                <Button 
                  variant={sortBy === "difficulty-hard" ? "default" : "outline"} 
                  size="sm"
                  onClick={() => setSortBy(sortBy === "difficulty-hard" ? "none" : "difficulty-hard")}
                >
                  {language === "en" ? "Difficulty (Hard)" : "Obtížnost (Těžká)"}
                </Button>
                <Button 
                  variant={sortBy === "alphabetically-az" ? "default" : "outline"} 
                  size="sm"
                  onClick={() => setSortBy(sortBy === "alphabetically-az" ? "none" : "alphabetically-az")}
                >
                  {language === "en" ? "A→Z" : "A→Z"}
                </Button>
                <Button 
                  variant={sortBy === "alphabetically-za" ? "default" : "outline"} 
                  size="sm"
                  onClick={() => setSortBy(sortBy === "alphabetically-za" ? "none" : "alphabetically-za")}
                >
                  {language === "en" ? "Z→A" : "Z→A"}
                </Button>
              </div>
            </div>
            
            {showFilters && (
              <Card className="p-6">
                {filterOptions.length > 0 ? (
                  <div className="grid md:grid-cols-3 gap-6">
                    {filterOptions.map((filter) => (
                      <div key={filter.id}>
                        <h4 className="mb-3 text-foreground">
                          {language === "en" ? filter.name : filter.nameCs}
                        </h4>
                        <div className="space-y-2">
                          {filter.options.map((option) => {
                            const isSelected = selectedFilters.includes(option.value);
                            return (
                              <label key={option.value} className="flex items-center gap-2 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={isSelected}
                                  onChange={() => {
                                    if (isSelected) {
                                      setSelectedFilters(selectedFilters.filter(f => f !== option.value));
                                    } else {
                                      setSelectedFilters([...selectedFilters, option.value]);
                                    }
                                  }}
                                  className="rounded border-gray-300"
                                />
                                <span className="text-sm">
                                  {language === "en" ? option.label : option.labelCs}
                                </span>
                              </label>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground py-8">
                    {language === "en" 
                      ? "No filters configured yet." 
                      : "Zatím nejsou nakonfigurovány žádné filtry."}
                  </p>
                )}
                
                {/* Clear All Filters Button inside panel */}
                {activeFiltersCount > 0 && (
                  <div className="mt-6 pt-6 border-t flex justify-center">
                    <Button 
                      variant="outline" 
                      onClick={clearAllFilters}
                      className="gap-2"
                    >
                      {language === "en" ? "Clear All Filters" : "Vymazat všechny filtry"}
                      <Badge variant="secondary" className="ml-1">
                        {activeFiltersCount}
                      </Badge>
                    </Button>
                  </div>
                )}
              </Card>
            )}
          </div>

          <div className="mb-4 text-center text-muted-foreground">
            {language === "en" 
              ? `Showing ${filteredProjects.length} of ${projects.length} projects`
              : `Zobrazeno ${filteredProjects.length} z ${projects.length} projektů`
            }
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedProjects.map((project) => {
              const projectAchievement = achievements.find(ach => ach.projectId === project.id);
              const placement = projectAchievement?.placement;
              
              // Determine medal/badge based on placement
              let placementBadge = null;
              if (placement === '1st') {
                placementBadge = (
                  <div className="absolute top-3 left-3 z-10 bg-gradient-to-br from-yellow-400 to-yellow-600 text-yellow-900 px-3 py-1 rounded-full flex items-center gap-1 shadow-lg">
                    <span className="text-base">🥇</span>
                    <span className="text-xs font-semibold">{language === 'en' ? '1st Place' : '1. místo'}</span>
                  </div>
                );
              } else if (placement === '2nd') {
                placementBadge = (
                  <div className="absolute top-3 left-3 z-10 bg-gradient-to-br from-gray-300 to-gray-500 text-gray-900 px-3 py-1 rounded-full flex items-center gap-1 shadow-lg">
                    <span className="text-base">🥈</span>
                    <span className="text-xs font-semibold">{language === 'en' ? '2nd Place' : '2. místo'}</span>
                  </div>
                );
              } else if (placement === '3rd') {
                placementBadge = (
                  <div className="absolute top-3 left-3 z-10 bg-gradient-to-br from-amber-600 to-amber-800 text-amber-100 px-3 py-1 rounded-full flex items-center gap-1 shadow-lg">
                    <span className="text-base">🥉</span>
                    <span className="text-xs font-semibold">{language === 'en' ? '3rd Place' : '3. místo'}</span>
                  </div>
                );
              } else if (placement) {
                // Custom placement text
                placementBadge = (
                  <div className="absolute top-3 left-3 z-10 bg-purple-500 text-white px-3 py-1 rounded-full flex items-center gap-1 shadow-lg">
                    <Trophy className="h-3 w-3" />
                    <span className="text-xs">{placement}</span>
                  </div>
                );
              }
              
              return (
              <Card 
                key={project.id} 
                className="overflow-hidden flex flex-col cursor-pointer hover:shadow-lg transition-shadow" 
                onClick={() => {
                  localStorage.setItem('projectsScrollPosition', window.scrollY.toString());
                  // Clear flags when opening from project list
                  localStorage.removeItem('projectOpenedFromMainPage');
                  localStorage.removeItem('projectOpenedFromAchievements');
                  setSelectedProject(project);
                }}
              >
                <div className="h-48 overflow-hidden relative">
                  {placementBadge}
                  {project.award && (
                    <div className="absolute top-3 right-3 z-10 bg-primary text-primary-foreground px-3 py-1 rounded-full flex items-center gap-1 shadow-lg">
                      <Award className="h-3 w-3" />
                      <span className="text-xs">{t.award}</span>
                    </div>
                  )}
                  {project.images && project.images.length > 0 ? (
                    <ImageWithFallback
                      src={project.images[project.thumbnailIndex !== undefined && project.thumbnailIndex < project.images.length ? project.thumbnailIndex : 0]}
                      alt={language === 'cs' ? (project.titleCs || '') : project.title}
                      className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
                    />
                  ) : (
                    <div className="w-full h-full bg-muted flex items-center justify-center">
                      <Box className="h-16 w-16 text-muted-foreground" />
                    </div>
                  )}
                </div>
                <CardContent className="p-6 flex-1">
                  <div className="mb-2">
                    <Badge variant="outline">
                      {language === 'cs' ? (project.categoryCs || '') : project.category}
                    </Badge>
                  </div>
                  <h3 className="mb-2 text-foreground">
                    {language === 'cs' ? (project.titleCs || '') : project.title}
                  </h3>
                  <p className="text-muted-foreground text-sm line-clamp-3">
                    {language === 'cs' ? (project.descriptionCs || '') : project.description}
                  </p>
                </CardContent>
              </Card>
            );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}