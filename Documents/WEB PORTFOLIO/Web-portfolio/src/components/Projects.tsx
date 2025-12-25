import { ExternalLink, Award, FileText, ArrowRight } from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "./ui/card";
import { Badge } from "./ui/badge";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { Language, translations } from "../translations";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { projectId, publicAnonKey } from '../utils/supabase/info';
import electricalModel from "figma:asset/62d8593efd79e12a0b06122e6007ca0c4730824d.png";
import streamDeck from "figma:asset/4bbad57f64b1382cf879e6728a7572a7f2cc341d.png";
import challengerModel from "figma:asset/e1ce0d6f62fe2dacdb3fbe6f747b60956409fd42.png";

interface ProjectsProps {
  language: Language;
}

interface Project {
  id: string;
  title: string;
  titleCs: string;
  description: string;
  descriptionCs: string;
  images: string[];
  tags: string[];
  tagsCs?: string[];
  slug: string;
  published: boolean;
  featured?: boolean;
  hasAward?: boolean;
  sortOrder?: number;
}

export function Projects({ language }: ProjectsProps) {
  const t = translations[language].projects;
  const [featuredProjects, setFeaturedProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [projectsContent, setProjectsContent] = useState<any>(null);
  const navigateToProjects = useNavigate();

  useEffect(() => {
    loadContent();
  }, []);

  const loadContent = async () => {
    console.log('🔄 Projects.tsx - Loading content at:', new Date().toISOString());
    try {
      const [projectsResponse, contentResponse] = await Promise.all([
        fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-635fd90e/projects`,
          {
            headers: {
              'Authorization': `Bearer ${publicAnonKey}`,
            },
          }
        ),
        fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-635fd90e/content`,
          {
            headers: {
              'Authorization': `Bearer ${publicAnonKey}`,
            },
          }
        )
      ]);

      let allProjects: Project[] = [];
      let contentData: any = null;

      if (projectsResponse.ok) {
        const data = await projectsResponse.json();
        allProjects = (data.projects || []).filter((p: Project) => p.published !== false);
      }
      
      if (contentResponse.ok) {
        const data = await contentResponse.json();
        console.log('📥 Projects.tsx - Content response:', data);
        if (data.content) {
          contentData = data.content;
          console.log('📦 Projects.tsx - Content data:', {
            featuredProject1Id: contentData.featuredProject1Id,
            featuredProject2Id: contentData.featuredProject2Id,
            featuredProject3Id: contentData.featuredProject3Id,
          });
          setProjectsContent(data.content);
        } else {
          console.log('⚠️ Projects.tsx - No content in response');
        }
      } else {
        console.log('❌ Projects.tsx - Content response not ok:', contentResponse.status);
      }

      // Determine which projects to feature using the featured field
      let featured: Project[] = [];
      
      console.log('🔍 Projects.tsx - Featured selection logic:');
      console.log('📊 All projects count:', allProjects.length);
      
      // First, try to get projects marked as featured
      featured = allProjects.filter((p: any) => p.featured === true);
      
      console.log('⭐ Projects marked as featured:', featured.map(p => ({ id: p.id, title: p.title })));
      
      // If no featured projects, fallback to auto-select first 3 by sortOrder
      if (featured.length === 0) {
        featured = allProjects
          .sort((a: Project, b: Project) => {
            const orderA = a.sortOrder ?? 999;
            const orderB = b.sortOrder ?? 999;
            return orderA - orderB;
          })
          .slice(0, 3);
        
        console.log('🔄 Auto-selected projects by sortOrder:', featured.map(p => ({ id: p.id, title: p.title, sortOrder: p.sortOrder })));
      }

      setFeaturedProjects(featured);
    } catch (error) {
      console.error('Error loading projects content:', error);
      setFeaturedProjects(fallbackProjects);
    } finally {
      setLoading(false);
    }
  };

  // Use content from database if available, otherwise fallback to translations
  const title = language === 'cs'
    ? (projectsContent?.projectsTitleCs || t.title)
    : (projectsContent?.projectsTitle || t.title);
    
  const subtitle = language === 'cs'
    ? (projectsContent?.projectsSubtitleCs || t.subtitle)
    : (projectsContent?.projectsSubtitle || t.subtitle);
    
  const viewAll = language === 'cs'
    ? (projectsContent?.projectsViewAllCs || t.viewAll)
    : (projectsContent?.projectsViewAll || t.viewAll);
    
  const viewDetails = language === 'cs'
    ? (projectsContent?.projectsViewDetailsCs || t.viewDetails)
    : (projectsContent?.projectsViewDetails || t.viewDetails);

  // Fallback projects (původní)
  const fallbackProjects = [
    {
      id: 'fallback-1',
      title: language === "en" ? "Educational Electrical Model" : "Výukový elektrotechnický model",
      titleCs: "Výukový elektrotechnický model",
      description: language === "en" 
        ? "Model showing basic wiring connections for light switches in electrical installations."
        : "Model ukazující základní zapojení vypínačů světel v elektroinstalaci.",
      descriptionCs: "Model ukazující základní zapojení vypínačů světel v elektroinstalaci.",
      images: [electricalModel],
      tags: ["FDM Printing", "PLA & PETG", "Electronics", "Fusion 360"],
      tagsCs: ["FDM tisk", "PLA & PETG", "Elektronika", "Fusion 360"],
      hasAward: true,
      slug: "educational-electrical-model",
      published: true,
    },
    {
      id: 'fallback-2',
      title: "DIY Stream Deck",
      titleCs: "DIY Stream Deck",
      description: language === "en"
        ? "DIY Stream deck that works with Arduino Pro Micro on custom code."
        : "DIY Stream deck, který funguje s arduino pro micro na vlastním kódu.",
      descriptionCs: "DIY Stream deck, který funguje s arduino pro micro na vlastním kódu.",
      images: [streamDeck],
      tags: ["FDM Printing", "Arduino", "Electronics", "Custom Code"],
      tagsCs: ["FDM tisk", "Arduino", "Elektronika", "Vlastní kód"],
      hasAward: false,
      slug: "diy-stream-deck",
      published: true,
    },
    {
      id: 'fallback-3',
      title: language === "en" ? "Dodge Challenger Scale Model 1:46" : "Model Dodge Challenger v měřítku 1:46",
      titleCs: "Model Dodge Challenger v měřítku 1:46",
      description: language === "en"
        ? "Dodge Challenger model with LED lighting."
        : "Model Dodge Challenger s LED osvětlením.",
      descriptionCs: "Model Dodge Challenger s LED osvětlením.",
      images: [challengerModel],
      tags: ["FDM Printing", "Scale Model", "LED Lights", "Model Making"],
      tagsCs: ["FDM tisk", "Model", "LED osvětlení", "Modelářství"],
      hasAward: false,
      slug: "dodge-challenger-model",
      published: true,
    },
  ];

  if (loading) {
    return (
      <section id="projects" className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto text-center">
            <p className="text-muted-foreground">Načítání projektů...</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="projects" className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-center mb-4 text-foreground">{title}</h2>
          <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
            {subtitle}
          </p>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {featuredProjects.map((project) => {
              const displayTitle = language === "cs" ? (project.titleCs || project.title) : project.title;
              const displayDescription = language === "cs" ? (project.descriptionCs || project.description) : project.description;
              const displayTags = language === "cs" ? (project.tagsCs || project.tags || []) : (project.tags || []);
              const firstImage = project.images && project.images.length > 0 ? project.images[0] : null;
              
              return (
                <Card key={project.id} className="overflow-hidden flex flex-col">
                  <div className="h-48 overflow-hidden relative">
                    {project.hasAward && (
                      <div className="absolute top-3 right-3 z-10 bg-primary text-primary-foreground px-3 py-1 rounded-full flex items-center gap-1 shadow-lg">
                        <Award className="h-3 w-3" />
                        <span className="text-xs">Award Winner</span>
                      </div>
                    )}
                    <ImageWithFallback
                      src={firstImage || electricalModel}
                      alt={displayTitle}
                      className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
                    />
                  </div>
                  <CardHeader>
                    <h3 className="text-foreground">{displayTitle}</h3>
                  </CardHeader>
                  <CardContent className="flex-1">
                    <p className="text-muted-foreground mb-4">{displayDescription}</p>
                    <div className="flex flex-wrap gap-2">
                      {displayTags && displayTags.length > 0 && displayTags.map((tag, tagIndex) => (
                        <Badge key={tagIndex} variant="outline">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                  <CardFooter className="gap-2">
                    <Button 
                      size="sm" 
                      className="flex-1"
                      onClick={() => {
                        localStorage.setItem('homeScrollPosition', window.scrollY.toString());
                        localStorage.setItem('projectOpenedFromMainPage', 'true');
                        navigateToProjects(`/projects?project=${project.slug}`);
                      }}
                    >
                      <FileText className="h-4 w-4" />
                      {viewDetails}
                    </Button>
                  </CardFooter>
                </Card>
              );
            })}
          </div>

          <div className="text-center">
            <Button 
              size="lg" 
              onClick={() => {
                localStorage.setItem('homeScrollPosition', window.scrollY.toString());
                navigateToProjects("/projects");
              }} 
              className="group"
            >
              {viewAll}
              <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}