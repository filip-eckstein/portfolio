import { GraduationCap, Award, Trophy } from "lucide-react";
import { Card, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { Language, translations } from "../translations";
import { Link } from "react-router-dom";
import { useRemoteContent } from "../hooks/useRemoteContent";
import { TypewriterText } from "./ui/TypewriterText";
import aboutMeImage from "figma:asset/about-me.webp";

interface AboutProps {
  language: Language;
}

export function About({ language }: AboutProps) {
  const localT = translations[language].about;
  const { content, settings, t } = useRemoteContent(language);

  // About text logic
  const defaultText = localT.paragraph1 + "\n\n" + localT.paragraph2 + "\n\n" + localT.paragraph3;
  const aboutText = language === "cs" 
    ? (settings?.aboutText?.textCs || defaultText)
    : (settings?.aboutText?.text || defaultText);

  // Translations with fallback
  const title = t('aboutTitle', localT.title);
  const subtitle = t('aboutSubtitle', localT.subtitle);
  const educationTitle = t('educationTitle', localT.highlights.education.title);
  const educationDesc = t('educationDescription', localT.highlights.education.description);
  const contestTitle = t('contestTitle', localT.highlights.contest.title);
  const contestDesc = t('contestDescription', localT.highlights.contest.description);
  const certsTitle = t('certificationsTitle', localT.highlights.certifications.title);
  const certsDesc = t('certificationsDescription', localT.highlights.certifications.description);
  
  const aboutImage = content?.aboutImageUrl || aboutMeImage;

  const highlights = [
    { icon: GraduationCap, title: educationTitle, description: educationDesc, hasMoreInfo: false },
    { 
      icon: Trophy, 
      title: contestTitle, 
      description: contestDesc, 
      hasMoreInfo: true, 
      moreInfoText: localT.highlights.contest.moreInfo, 
      moreInfoLink: "/achievements" 
    },
    { 
      icon: Award, 
      title: certsTitle, 
      description: certsDesc, 
      hasMoreInfo: true, 
      moreInfoText: localT.highlights.certifications.moreInfo, 
      moreInfoLink: "/achievements#certifications" 
    },
  ];

  return (
    <section id="about" className="py-20 bg-muted/30">
      <div className="container mx-auto px-4 max-w-6xl">
        <h2 className="text-center mb-4 text-foreground reveal reveal-up">{title}</h2>
        <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto reveal reveal-up delay-150">
          {subtitle}
        </p>

        <div className="grid md:grid-cols-2 gap-12 items-start mb-16">
          <div className="order-2 md:order-1 pt-4">
            <TypewriterText text={aboutText} speed={10} />
          </div>
          <div className="order-1 md:order-2 reveal reveal-right delay-200">
            <div className="rounded-lg overflow-hidden shadow-lg">
              <ImageWithFallback src={aboutImage} alt="About Me" className="w-full h-full object-cover" />
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {highlights.map((h, i) => (
            <Card key={i} className={`reveal reveal-scale-up delay-${[200, 350, 500][i]}`}>
              <CardContent className="p-6">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <h.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="mb-2 text-foreground">{h.title}</h3>
                <p className="text-muted-foreground mb-3">{h.description}</p>
                {h.hasMoreInfo && (
                  <Link to={h.moreInfoLink || "#"} onClick={() => localStorage.setItem('homeScrollPosition', window.scrollY.toString())}>
                    <Button variant="link" size="sm" className="h-auto p-0 text-primary hover:underline">
                      {h.moreInfoText}
                    </Button>
                  </Link>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}