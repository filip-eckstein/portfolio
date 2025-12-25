import { ArrowDown, Mail, Award, Box, Facebook, Instagram, Linkedin, Github, Twitter, Youtube, Palette, Video, Pin, Link as LinkIcon, Music, Heart } from "lucide-react";
import { Button } from "./ui/button";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { Language, translations } from "../translations";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { projectId, publicAnonKey } from '../utils/supabase/info';
import filipPresentation from "figma:asset/75de6825c48e822ea31b319f15e19c8532f96aa0.png";
import dodgeChallenger from "figma:asset/d260ee437c480774e21d3d6ada2358bab82117f6.png";
import electricalModel from "figma:asset/c77c3ebe496092dbfaeb7fa04f4f704709dde119.png";

interface HeroProps {
  language: Language;
}

interface SocialLink {
  label: string;
  url: string;
  icon: string;
}

// TikTok Icon Component
const TikTokIcon = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
  </svg>
);

export function Hero({ language }: HeroProps) {
  const t = translations[language].hero;
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>([]);
  const [heroContent, setHeroContent] = useState<any>(null);
  
  useEffect(() => {
    loadContent();
  }, []);

  const loadContent = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-635fd90e/content`,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        if (data.content) {
          setHeroContent(data.content);
          if (data.content.socialLinks) {
            setSocialLinks(data.content.socialLinks);
          }
        }
      } else {
        console.error('Failed to load content:', response.status);
      }
    } catch (error) {
      console.error('Error loading content:', error);
    }
  };

  // Use content from database if available, otherwise fallback to translations
  const badge = language === 'cs' 
    ? (heroContent?.heroBadgeCs || t.badge)
    : (heroContent?.heroBadge || t.badge);
    
  const subtitle = language === 'cs'
    ? (heroContent?.heroSubtitleCs || t.subtitle)
    : (heroContent?.heroSubtitle || t.subtitle);
    
  const name = heroContent?.heroName || t.name;
  
  const description = language === 'cs'
    ? (heroContent?.heroDescriptionCs || t.description)
    : (heroContent?.heroDescription || t.description);
    
  const achievement1Text = language === 'cs'
    ? (heroContent?.heroAchievement1TextCs || t.achievement1.text)
    : (heroContent?.heroAchievement1Text || t.achievement1.text);
    
  const achievement2Text = language === 'cs'
    ? (heroContent?.heroAchievement2TextCs || t.achievement2.text)
    : (heroContent?.heroAchievement2Text || t.achievement2.text);
    
  const moreInfo = language === 'cs'
    ? (heroContent?.heroMoreInfoCs || t.moreInfo)
    : (heroContent?.heroMoreInfo || t.moreInfo);
    
  const viewProjects = language === 'cs'
    ? (heroContent?.heroViewProjectsCs || t.viewProjects)
    : (heroContent?.heroViewProjects || t.viewProjects);
    
  const getInTouch = language === 'cs'
    ? (heroContent?.heroGetInTouchCs || t.getInTouch)
    : (heroContent?.heroGetInTouch || t.getInTouch);
  
  // Hero images with fallback to defaults
  const heroImage1 = heroContent?.heroImage1Url || dodgeChallenger;
  const heroImage2 = heroContent?.heroImage2Url || electricalModel;
  const heroImage3 = heroContent?.heroImage3Url || filipPresentation;
  
  // Generate links for achievements based on type and ID
  const getAchievementLink = (type: string, id: string) => {
    if (!type || !id) return '/achievements';
    
    switch (type) {
      case 'achievement':
        return '/achievements';
      case 'project':
        return `/projects?project=${id}`;
      case 'testimonial':
        return `/testimonials?testimonial=${id}`;
      case 'external':
        return id; // For external links, id is the URL
      default:
        return '/achievements';
    }
  };

  const achievement1Link = getAchievementLink(
    heroContent?.heroAchievement1Type || 'achievement',
    heroContent?.heroAchievement1Id || ''
  );

  const achievement2Link = getAchievementLink(
    heroContent?.heroAchievement2Type || 'achievement',
    heroContent?.heroAchievement2Id || ''
  );
  
  const getIconComponent = (iconName: string) => {
    const icons: Record<string, any> = {
      linkedin: Linkedin,
      github: Github,
      twitter: Twitter,
      facebook: Facebook,
      instagram: Instagram,
      youtube: Youtube,
      tiktok: TikTokIcon,
      patreon: Heart,
      palette: Palette,
      dribbble: Palette,
      video: Video,
      pin: Pin,
      mail: Mail,
      link: LinkIcon,
      music: Music,
      heart: Heart,
    };
    
    return icons[iconName.toLowerCase()] || LinkIcon;
  };
  
  const scrollToSection = (sectionId: string) => {
    const element = document.querySelector(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section id="home" className="min-h-screen flex items-center justify-center relative pt-16 overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-20 right-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 left-10 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>

      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Left side - Text content */}
            <div className="order-2 md:order-1">
              <div className="inline-flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-full mb-6">
                <Box className="h-4 w-4 text-primary" />
                <span className="text-sm text-primary">{badge}</span>
              </div>
              
              <p className="text-lg mb-6 text-foreground">
                <span className="text-primary">{subtitle}</span>
              </p>
              
              <h1 className="text-4xl mb-4 text-foreground">
                {name}
              </h1>
              
              <p className="text-muted-foreground mb-8 max-w-lg">
                {description}
              </p>

              <div className="flex flex-wrap gap-4 mb-8">
                <div className="flex items-center gap-3 bg-muted/50 px-4 py-3 rounded-lg">
                  <Award className="h-5 w-5 text-primary flex-shrink-0" />
                  <div className="flex flex-col gap-1">
                    <span className="text-sm">{achievement1Text}</span>
                    {heroContent?.heroAchievement1Type === 'external' ? (
                      <a 
                        href={achievement1Link}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => {
                          localStorage.setItem('homeScrollPosition', window.scrollY.toString());
                        }}
                      >
                        <Button 
                          variant="link" 
                          size="sm" 
                          className="h-auto p-0 text-xs text-primary hover:underline justify-start"
                        >
                          {moreInfo}
                        </Button>
                      </a>
                    ) : (
                      <Link 
                        to={achievement1Link}
                        onClick={() => {
                          localStorage.setItem('homeScrollPosition', window.scrollY.toString());
                        }}
                      >
                        <Button 
                          variant="link" 
                          size="sm" 
                          className="h-auto p-0 text-xs text-primary hover:underline justify-start"
                        >
                          {moreInfo}
                        </Button>
                      </Link>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-3 bg-muted/50 px-4 py-3 rounded-lg">
                  <Box className="h-5 w-5 text-primary flex-shrink-0" />
                  <div className="flex flex-col gap-1">
                    <span className="text-sm">{achievement2Text}</span>
                    {heroContent?.heroAchievement2Type === 'external' ? (
                      <a 
                        href={achievement2Link}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => {
                          localStorage.setItem('homeScrollPosition', window.scrollY.toString());
                        }}
                      >
                        <Button 
                          variant="link" 
                          size="sm" 
                          className="h-auto p-0 text-xs text-primary hover:underline justify-start"
                        >
                          {moreInfo}
                        </Button>
                      </a>
                    ) : (
                      <Link 
                        to={achievement2Link}
                        onClick={() => {
                          localStorage.setItem('homeScrollPosition', window.scrollY.toString());
                        }}
                      >
                        <Button 
                          variant="link" 
                          size="sm" 
                          className="h-auto p-0 text-xs text-primary hover:underline justify-start"
                        >
                          {moreInfo}
                        </Button>
                      </Link>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4 mb-8">
                <Link to="/projects">
                  <Button size="lg">
                    {viewProjects}
                  </Button>
                </Link>
                <Button variant="outline" size="lg" onClick={() => scrollToSection("#contact")}>
                  {getInTouch}
                </Button>
              </div>

              {socialLinks.length > 0 && (
                <div className="flex items-center gap-4">
                  {socialLinks.map((link, index) => {
                    const Icon = getIconComponent(link.icon);
                    return (
                      <a
                        key={index}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-10 h-10 flex items-center justify-center rounded-full bg-muted hover:bg-primary hover:text-primary-foreground transition-all"
                        title={link.label}
                      >
                        <Icon className="h-5 w-5" />
                      </a>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Right side - 3D Printer Image Grid */}
            <div className="order-1 md:order-2">
              <div className="relative">
                {/* Decorative elements */}
                <div className="absolute -top-4 -right-4 w-72 h-72 bg-primary/20 rounded-full blur-2xl"></div>
                <div className="absolute -bottom-4 -left-4 w-64 h-64 bg-primary/10 rounded-full blur-2xl"></div>
                
                {/* Main image grid */}
                <div className="relative z-10 grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <div className="relative rounded-2xl overflow-hidden shadow-2xl transform hover:scale-105 transition-transform duration-300">
                      <ImageWithFallback
                        src={heroImage1}
                        alt="Featured Project 1"
                        className="w-full h-64 object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                      <div className="absolute bottom-4 left-4 text-white">
                        <p className="text-sm">Dodge Challenger 1:46 Scale Model</p>
                      </div>
                    </div>
                  </div>
                  <div className="relative rounded-2xl overflow-hidden shadow-xl transform hover:scale-105 transition-transform duration-300">
                    <ImageWithFallback
                      src={heroImage2}
                      alt="Featured Project 2"
                      className="w-full h-48 object-cover"
                    />
                  </div>
                  <div className="relative rounded-2xl overflow-hidden shadow-xl transform hover:scale-105 transition-transform duration-300">
                    <ImageWithFallback
                      src={heroImage3}
                      alt="Featured Project 3"
                      className="w-full h-48 object-cover"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <button
        onClick={() => scrollToSection("#about")}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 text-muted-foreground hover:text-foreground transition-colors animate-bounce"
      >
        <ArrowDown className="h-6 w-6" />
      </button>
    </section>
  );
}