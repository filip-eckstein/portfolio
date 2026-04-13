import { ArrowDown, Mail, Award, Box, GraduationCap, Instagram, Linkedin, Github, Twitter, Youtube, Palette, Video, Pin, Link as LinkIcon, Music, Heart } from "lucide-react";
import { Button } from "./ui/button";
import { Language, translations } from "../translations";
import { Link } from "react-router-dom";
import { useRemoteContent } from "../hooks/useRemoteContent";
import { ModelViewer3D } from "./ModelViewer3D";

interface HeroProps {
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


export function Hero({ language }: HeroProps) {
  const localT = translations[language].hero;
  const { content, achievements, t } = useRemoteContent(language);

  // Content with fallback to local translations
  const badge = t('heroBadge', localT.badge);
  const subtitle = t('heroSubtitle', localT.subtitle);
  const name = content?.heroName || localT.name;
  const description = t('heroDescription', localT.description);
  const achievement1Text = t('heroAchievement1Text', localT.achievement1.text);
  const achievement2Text = t('heroAchievement2Text', localT.achievement2.text);
  const moreInfo = t('heroMoreInfo', localT.moreInfo);
  const viewProjects = t('heroViewProjects', localT.viewProjects);
  const getInTouch = t('heroGetInTouch', localT.getInTouch);

  // Social Links
  const socialLinks = content?.socialLinks || [];


  const getAchievementLink = (type: string, id: string) => {
    if (!type || !id) return '/achievements';
    switch (type) {
      case 'achievement':
        const ach = achievements.find(a => a.id === id);
        return (ach && ach.type === 'certification') ? '/achievements#certifications' : '/achievements';
      case 'project': return `/projects?project=${id}`;
      case 'testimonial': return `/testimonials?testimonial=${id}`;
      case 'external': return id;
      default: return '/achievements';
    }
  };

  const achievement1Link = getAchievementLink(content?.heroAchievement1Type || 'achievement', content?.heroAchievement1Id || '');
  const achievement2Link = getAchievementLink(content?.heroAchievement2Type || 'achievement', content?.heroAchievement2Id || '');

  const getIcon = (name: string) => {
    const icons: Record<string, any> = {
      linkedin: Linkedin, github: Github, twitter: Twitter, facebook: FacebookIcon,
      instagram: Instagram, youtube: Youtube, tiktok: TikTokIcon, patreon: Heart,
      palette: Palette, video: Video, pin: Pin, mail: Mail, link: LinkIcon, music: Music, heart: Heart
    };
    return icons[name.toLowerCase()] || LinkIcon;
  };

  const scrollToSection = (id: string) => document.querySelector(id)?.scrollIntoView({ behavior: "smooth" });

  return (
    <section id="home" className="min-h-screen flex items-center justify-center relative pt-16 overflow-hidden">
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-20 right-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 left-10 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          <div className="order-2 md:order-1">
            <div className="inline-flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-full mb-6 hero-animate-badge">
              <Box className="h-4 w-4 text-primary" />
              <span className="text-sm text-primary">{badge}</span>
            </div>
            
            <p className="text-lg mb-6 text-foreground hero-animate-subtitle">
              <span className="text-primary">{subtitle}</span>
            </p>
            
            <h1 className="text-4xl mb-4 text-foreground hero-animate-name flex flex-wrap items-center">
              <span className="mr-3">{name}</span>
            </h1>
            <p className="text-muted-foreground mb-8 max-w-lg hero-animate-description">{description}</p>

            <div className="flex gap-3 mb-8 hero-animate-achievements overflow-x-auto pb-1">
              {[
                { icon: Award, text: achievement1Text, link: achievement1Link, type: content?.heroAchievement1Type },
                { icon: Box, text: achievement2Text, link: achievement2Link, type: content?.heroAchievement2Type },
                { icon: GraduationCap, text: language === 'cs' ? 'Stáž Erasmus' : 'Erasmus Internship', link: "/achievements#achievement-erasmus-malaga", type: 'achievement' }
              ].map((ach, i) => (
                <div key={i} className="flex items-center gap-2 bg-muted/50 px-3 py-2 rounded-lg flex-shrink-0">
                  <ach.icon className="h-4 w-4 text-primary flex-shrink-0" />
                  <div className="flex flex-col gap-0.5">
                    <span className="text-sm whitespace-nowrap">{ach.text}</span>
                    {ach.type === 'external' ? (
                      <a href={ach.link} target="_blank" rel="noopener noreferrer" onClick={() => localStorage.setItem('homeScrollPosition', window.scrollY.toString())}>
                        <Button variant="link" size="sm" className="h-auto p-0 text-xs text-primary hover:underline justify-start">{moreInfo}</Button>
                      </a>
                    ) : (
                      <Link to={ach.link || "#"} onClick={() => localStorage.setItem('homeScrollPosition', window.scrollY.toString())}>
                        <Button variant="link" size="sm" className="h-auto p-0 text-xs text-primary hover:underline justify-start">{moreInfo}</Button>
                      </Link>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-center gap-4 mb-8 hero-animate-buttons">
              <Link to="/projects"><Button size="lg">{viewProjects}</Button></Link>
              <Button variant="outline" size="lg" onClick={() => scrollToSection("#contact")}>{getInTouch}</Button>
            </div>

            {socialLinks.length > 0 && (
              <div className="flex items-center gap-4 hero-animate-social">
                {socialLinks.map((link: any, i: number) => {
                  const Icon = getIcon(link.icon);
                  return (
                    <a key={i} href={link.url} target="_blank" rel="noopener noreferrer" className="w-10 h-10 flex items-center justify-center rounded-full bg-muted dark:bg-muted/50 hover:bg-foreground hover:text-background transition-all" title={link.label}>
                      <Icon className="h-5 w-5" />
                    </a>
                  );
                })}
              </div>
            )}
          </div>

          <div className="order-1 md:order-2 hero-animate-carousel relative w-full flex items-center justify-center">
             {/* Glow efekty tvořící auru kolem modelu ponechány */}
            <div className="absolute -top-4 -right-4 w-72 h-72 bg-primary/20 rounded-full blur-2xl" />
            <div className="absolute -bottom-4 -left-4 w-64 h-64 bg-primary/10 rounded-full blur-2xl" />
            
            <div className="relative w-full max-w-[500px] aspect-square min-h-[400px] z-10 flex items-center justify-center">
              <ModelViewer3D src="/panel.glb" />
            </div>
          </div>
        </div>
      </div>

      <button onClick={() => scrollToSection("#about")} className="absolute bottom-8 left-1/2 -translate-x-1/2 text-muted-foreground hover:text-foreground transition-colors animate-bounce">
        <ArrowDown className="h-6 w-6" />
      </button>
    </section>
  );
}