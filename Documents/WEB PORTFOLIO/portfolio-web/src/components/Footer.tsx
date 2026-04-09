import { Mail, Heart, Instagram, Linkedin, Github, Twitter, Youtube, Palette, Video, Pin, Link as LinkIcon, Music } from "lucide-react";
import { Language, translations } from "../translations";
import { useRemoteContent } from "../hooks/useRemoteContent";

interface FooterProps {
  language: Language;
}

// TikTok Icon Component
const TikTokIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} xmlns="http://www.w3.org/2000/svg">
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
  </svg>
);

// Facebook Icon Component
const FacebookIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} xmlns="http://www.w3.org/2000/svg">
    <path d="M9.101 23.691v-7.98H6.627v-3.667h2.474v-1.58c0-4.085 1.848-5.978 5.858-5.978.401 0 .955.042 1.468.103a8.68 8.68 0 0 1 1.141.195v3.325a8.623 8.623 0 0 0-.653-.036 26.805 26.805 0 0 0-.733-.009c-.707 0-1.259.096-1.675.309a1.686 1.686 0 0 0-.679.622c-.258.42-.374.995-.374 1.752v1.297h3.919l-.386 3.667h-3.533v7.98H9.101z"/>
  </svg>
);

export function Footer({ language }: FooterProps) {
  const { content } = useRemoteContent(language);
  const socialLinks = content?.socialLinks || [];

  const getIcon = (name: string) => {
    const icons: Record<string, any> = {
      linkedin: Linkedin, github: Github, twitter: Twitter, facebook: FacebookIcon,
      instagram: Instagram, youtube: Youtube, tiktok: TikTokIcon, patreon: Heart,
      palette: Palette, video: Video, pin: Pin, mail: Mail, link: LinkIcon, music: Music, heart: Heart
    };
    return icons[name.toLowerCase()] || LinkIcon;
  };

  return (
    <footer className="bg-muted/30 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            {socialLinks.map((link: any, i: number) => {
              if (link.icon === 'custom' && link.customIconUrl) {
                return (
                  <a key={i} href={link.url} target="_blank" rel="noopener noreferrer" className="w-10 h-10 flex items-center justify-center rounded-full bg-background dark:bg-muted hover:bg-foreground hover:text-background transition-all duration-300 p-2 border border-border" title={link.label}>
                    <img src={link.customIconUrl} alt={link.label} className="w-full h-full object-contain" />
                  </a>
                );
              }
              const Icon = getIcon(link.icon);
              return (
                <a key={i} href={link.url} target="_blank" rel="noopener noreferrer" className="w-10 h-10 flex items-center justify-center rounded-full bg-background dark:bg-muted text-foreground hover:bg-foreground hover:text-background transition-all duration-300 border border-border" title={link.label}>
                  <Icon className="h-5 w-5" />
                </a>
              );
            })}
          </div>
          <p className="text-muted-foreground text-sm flex items-center gap-1">
            {language === 'cs' ? 'Vytvořil Filip Eckstein © 2025-2026 | Všechna práva vyhrazena' : 'Made by Filip Eckstein © 2025-2026 | All Rights Reserved'}
          </p>
        </div>
      </div>
    </footer>
  );
}