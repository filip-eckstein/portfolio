import { GraduationCap, Award, Trophy } from "lucide-react";
import { Card, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { Language, translations } from "../translations";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { projectId, publicAnonKey } from '../utils/supabase/info';
import filipPresentation from "figma:asset/75de6825c48e822ea31b319f15e19c8532f96aa0.png";

interface AboutProps {
  language: Language;
}

export function About({ language }: AboutProps) {
  const t = translations[language].about;
  const [aboutText, setAboutText] = useState({
    text: translations.en.about.paragraph1 + "\n\n" + translations.en.about.paragraph2 + "\n\n" + translations.en.about.paragraph3,
    textCs: translations.cs.about.paragraph1 + "\n\n" + translations.cs.about.paragraph2 + "\n\n" + translations.cs.about.paragraph3,
  });
  const [aboutContent, setAboutContent] = useState<any>(null);

  useEffect(() => {
    fetchContent();
  }, []);

  const fetchContent = async () => {
    try {
      const [settingsResponse, contentResponse] = await Promise.all([
        fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-635fd90e/settings`,
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

      if (settingsResponse.ok) {
        const data = await settingsResponse.json();
        if (data.settings?.aboutText) {
          setAboutText(data.settings.aboutText);
        }
      }
      
      if (contentResponse.ok) {
        const data = await contentResponse.json();
        if (data.content) {
          setAboutContent(data.content);
        }
      }
    } catch (error) {
      console.error('Error loading about content:', error);
    }
  };

  const displayText = language === "cs" && aboutText.textCs 
    ? aboutText.textCs 
    : aboutText.text;

  // Use content from database if available, otherwise fallback to translations
  const title = language === 'cs'
    ? (aboutContent?.aboutTitleCs || t.title)
    : (aboutContent?.aboutTitle || t.title);
    
  const subtitle = language === 'cs'
    ? (aboutContent?.aboutSubtitleCs || t.subtitle)
    : (aboutContent?.aboutSubtitle || t.subtitle);
    
  const educationTitle = language === 'cs'
    ? (aboutContent?.educationTitleCs || t.highlights.education.title)
    : (aboutContent?.educationTitle || t.highlights.education.title);
    
  const educationDescription = language === 'cs'
    ? (aboutContent?.educationDescriptionCs || t.highlights.education.description)
    : (aboutContent?.educationDescription || t.highlights.education.description);
    
  const contestTitle = language === 'cs'
    ? (aboutContent?.contestTitleCs || t.highlights.contest.title)
    : (aboutContent?.contestTitle || t.highlights.contest.title);
    
  const contestDescription = language === 'cs'
    ? (aboutContent?.contestDescriptionCs || t.highlights.contest.description)
    : (aboutContent?.contestDescription || t.highlights.contest.description);
    
  const certificationsTitle = language === 'cs'
    ? (aboutContent?.certificationsTitleCs || t.highlights.certifications.title)
    : (aboutContent?.certificationsTitle || t.highlights.certifications.title);
    
  const certificationsDescription = language === 'cs'
    ? (aboutContent?.certificationsDescriptionCs || t.highlights.certifications.description)
    : (aboutContent?.certificationsDescription || t.highlights.certifications.description);
  
  // About image with fallback to default
  const aboutImage = aboutContent?.aboutImageUrl || filipPresentation;

  const highlights = [
    {
      icon: GraduationCap,
      title: educationTitle,
      description: educationDescription,
      hasMoreInfo: false,
    },
    {
      icon: Trophy,
      title: contestTitle,
      description: contestDescription,
      hasMoreInfo: true,
      moreInfoText: t.highlights.contest.moreInfo,
      moreInfoLink: "/achievements",
    },
    {
      icon: Award,
      title: certificationsTitle,
      description: certificationsDescription,
      hasMoreInfo: true,
      moreInfoText: t.highlights.certifications.moreInfo,
      moreInfoLink: "/achievements#certifications",
    },
  ];

  return (
    <section id="about" className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-center mb-4 text-foreground">{title}</h2>
          <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
            {subtitle}
          </p>

          <div className="grid md:grid-cols-2 gap-12 items-center mb-16">
            <div className="order-2 md:order-1">
              <p className="text-muted-foreground whitespace-pre-wrap">
                {displayText}
              </p>
            </div>
            <div className="order-1 md:order-2">
              <div className="rounded-lg overflow-hidden shadow-lg">
                <ImageWithFallback
                  src={aboutImage}
                  alt="About Me"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {highlights.map((highlight, index) => (
              <Card key={index}>
                <CardContent className="p-6">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    <highlight.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="mb-2 text-foreground">{highlight.title}</h3>
                  <p className="text-muted-foreground mb-3">{highlight.description}</p>
                  {highlight.hasMoreInfo && (
                    <Link 
                      to={highlight.moreInfoLink}
                      onClick={() => {
                        localStorage.setItem('homeScrollPosition', window.scrollY.toString());
                      }}
                    >
                      <Button
                        variant="link"
                        size="sm"
                        className="h-auto p-0 text-primary hover:underline"
                      >
                        {highlight.moreInfoText}
                      </Button>
                    </Link>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}