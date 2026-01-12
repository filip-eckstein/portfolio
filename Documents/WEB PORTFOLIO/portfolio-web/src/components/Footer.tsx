import { Mail, Heart, Instagram, Linkedin, Github, Twitter, Youtube, Palette, Video, Pin, Link as LinkIcon, Music } from "lucide-react";
import { Language, translations } from "../translations";
import { useState, useEffect } from "react";
import { projectId, publicAnonKey } from '../utils/supabase/info';

interface FooterProps {
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

// Facebook Icon Component (official logo)
const FacebookIcon = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M9.101 23.691v-7.98H6.627v-3.667h2.474v-1.58c0-4.085 1.848-5.978 5.858-5.978.401 0 .955.042 1.468.103a8.68 8.68 0 0 1 1.141.195v3.325a8.623 8.623 0 0 0-.653-.036 26.805 26.805 0 0 0-.733-.009c-.707 0-1.259.096-1.675.309a1.686 1.686 0 0 0-.679.622c-.258.42-.374.995-.374 1.752v1.297h3.919l-.386 3.667h-3.533v7.98H9.101z"/>
  </svg>
);

export function Footer({ language }: FooterProps) {
  const t = translations[language].footer;
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>([]);
  const [footerContent, setFooterContent] = useState<any>(null);
  
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
          setFooterContent(data.content);
          if (data.content.socialLinks) {
            setSocialLinks(data.content.socialLinks);
          }
        }
      } else {
        console.warn('Footer content response not ok:', response.status);
      }
    } catch (error) {
      // Silently fail - footer will use fallback translations
      console.warn('Footer content not available, using fallback translations:', error);
    }
  };

  // Use content from database if available, otherwise fallback to translations
  const tagline = language === 'cs'
    ? (footerContent?.footerTaglineCs || t.tagline)
    : (footerContent?.footerTagline || t.tagline);
    
  const description = language === 'cs'
    ? (footerContent?.footerDescriptionCs || t.description)
    : (footerContent?.footerDescription || t.description);
  
  const getIconComponent = (iconName: string) => {
    const icons: Record<string, any> = {
      linkedin: Linkedin,
      github: Github,
      twitter: Twitter,
      facebook: FacebookIcon,
      instagram: Instagram,
      youtube: Youtube,
      tiktok: TikTokIcon,
      patreon: Heart,
      palette: Palette,
      dribbble: Palette,
      video: Video,
      pin: Pin,
      pinterest: Pin,
      mail: Mail,
      link: LinkIcon,
      music: Music,
      heart: Heart,
    };
    
    return icons[iconName.toLowerCase()] || LinkIcon;
  };
  
  return (
    <footer className="bg-muted/30 py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              {socialLinks.map((link, index) => {
                // If custom icon with URL, use image
                if (link.icon === 'custom' && link.customIconUrl) {
                  return (
                    <a
                      key={index}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-10 h-10 flex items-center justify-center rounded-full bg-white hover:bg-foreground transition-all duration-300 p-2"
                      title={link.label}
                    >
                      <img 
                        src={link.customIconUrl} 
                        alt={link.label}
                        className="w-full h-full object-contain"
                      />
                    </a>
                  );
                }
                
                // Otherwise use icon component
                const IconComponent = getIconComponent(link.icon);
                return (
                  <a
                    key={index}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 flex items-center justify-center rounded-full bg-white text-foreground hover:bg-foreground hover:text-white transition-all duration-300"
                    title={link.label}
                  >
                    <IconComponent className="h-5 w-5" />
                  </a>
                );
              })}
            </div>
            
            <p className="text-muted-foreground text-sm flex items-center gap-1">
              {language === 'cs' 
                ? 'Vytvořil Filip Eckstein © 2025 | Všechna práva vyhrazena'
                : 'Made by Filip Eckstein © 2025 | All Rights Reserved'}
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}