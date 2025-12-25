import electricalModel from "figma:asset/c77c3ebe496092dbfaeb7fa04f4f704709dde119.png";
import presentationImage from "figma:asset/82c29c9796a291b2ac98bc4c6cc9877368cd956d.png";
import certificateImage from "figma:asset/de31ab162e323655808e0f15de06ec93c700bbdd.png";

import { Trophy, Award, CheckCircle2, ExternalLink, FileText } from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Language, translations } from "../translations";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";

interface AchievementsPageProps {
  language: Language;
  onLanguageChange: (lang: Language) => void;
}

export function AchievementsPage({ language }: AchievementsPageProps) {
  const t = translations[language].achievements;
  const [certificateDialogOpen, setCertificateDialogOpen] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false);

  // Restore scroll position or scroll to hash section when component mounts
  useEffect(() => {
    const savedScrollPosition = localStorage.getItem('achievementsScrollPosition');
    const hash = window.location.hash;
    
    if (savedScrollPosition && !hash) {
      const scrollY = parseInt(savedScrollPosition, 10);
      window.scrollTo(0, scrollY);
      localStorage.removeItem('achievementsScrollPosition');
    } else if (hash) {
      setTimeout(() => {
        const element = document.querySelector(hash);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    } else {
      window.scrollTo(0, 0);
    }
  }, []);

  const handleViewCertificate = () => {
    setCertificateDialogOpen(true);
    setIsZoomed(false);
  };

  const handleDownloadCertificate = () => {
    const link = document.createElement("a");
    link.href = "/certificate.pdf";
    link.download = "Filip_Eckstein_Fusion360_Certificate.pdf";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen pt-20 pb-12">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="mb-4 text-foreground">{t.title}</h1>
            <p className="text-muted-foreground max-w-2xl">
              {t.subtitle}
            </p>
          </div>

          {/* Contest Winner Section */}
          <div className="mb-12">
            <Card className="overflow-hidden">
              <div className="grid md:grid-cols-2 gap-0">
                <div className="relative h-64 md:h-auto">
                  <ImageWithFallback
                    src={electricalModel}
                    alt="Contest Winner - Educational Electrical Model"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-4 left-4">
                    <Badge className="bg-yellow-500 hover:bg-yellow-600 text-white">
                      <Trophy className="h-3 w-3 mr-1" />
                      {t.contest.awardValue}
                    </Badge>
                  </div>
                </div>
                <div className="p-6 md:p-8">
                  <div className="flex items-center gap-2 mb-3">
                    <Trophy className="h-6 w-6 text-yellow-500" />
                    <h2 className="text-foreground">{t.contest.title}</h2>
                  </div>
                  <p className="text-primary mb-4">{t.contest.subtitle}</p>
                  <p className="text-muted-foreground mb-6">
                    {t.contest.description}
                  </p>

                  {/* Contest Details */}
                  <div className="space-y-3 mb-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">{t.contest.competitionName}</p>
                        <p className="text-foreground">{t.contest.competitionNameValue}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">{t.contest.year}</p>
                        <p className="text-foreground">{t.contest.yearValue}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">{t.contest.level}</p>
                        <p className="text-foreground">{t.contest.levelValue}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">{t.contest.award}</p>
                        <p className="text-foreground text-yellow-600">{t.contest.awardValue}</p>
                      </div>
                      <div className="col-span-2">
                        <p className="text-sm text-muted-foreground">{t.contest.category}</p>
                        <p className="text-foreground">{t.contest.categoryValue}</p>
                      </div>
                    </div>
                  </div>

                  <Link 
                    to="/projects?project=educational-electrical-model"
                    onClick={() => {
                      localStorage.setItem('achievementsScrollPosition', window.scrollY.toString());
                      localStorage.setItem('projectOpenedFromAchievements', 'true');
                    }}
                  >
                    <Button>
                      {t.contest.viewProject}
                      <ExternalLink className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                  <a href="https://www.fs.tul.cz/soutez" target="_blank" rel="noopener noreferrer">
                    <Button variant="outline">
                      {t.contest.visitContest}
                      <ExternalLink className="ml-2 h-4 w-4" />
                    </Button>
                  </a>
                </div>
              </div>
            </Card>
          </div>

          {/* Certifications Section */}
          <div id="certifications">
            <div className="flex items-center gap-2 mb-6">
              <Award className="h-6 w-6 text-primary" />
              <h2 className="text-foreground">{t.certifications.title}</h2>
            </div>
            <p className="text-muted-foreground mb-8 max-w-2xl">
              {t.certifications.subtitle}
            </p>

            {/* Combined Certification Card */}
            <Card className="max-w-3xl mx-auto">
              <CardHeader>
                <div className="flex items-start justify-between mb-2">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Award className="h-6 w-6 text-primary" />
                  </div>
                  <Badge variant="outline" className="text-primary border-primary">
                    {t.certifications.combined.issuer}
                  </Badge>
                </div>
                <CardTitle>{t.certifications.combined.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-6">
                  {t.certifications.combined.description}
                </p>
                <div className="space-y-2 mb-6">
                  <p className="text-sm text-muted-foreground">{t.certifications.combined.skills}</p>
                  <ul className="grid md:grid-cols-2 gap-2">
                    {t.certifications.combined.skillsList.map((skill: string, index: number) => (
                      <li key={index} className="flex items-center gap-2 text-sm">
                        <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0" />
                        <span>{skill}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <Button
                    variant="default"
                    onClick={handleViewCertificate}
                  >
                    <FileText className="mr-2 h-4 w-4" />
                    {t.certifications.combined.viewCertificate}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Additional Recognition Image */}
          <div className="mt-12">
            <Card className="overflow-hidden">
              <div className="relative h-96">
                <ImageWithFallback
                  src={presentationImage}
                  alt="Filip Eckstein - Contest Presentation"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                <div className="absolute bottom-6 left-6 text-white">
                  <h3 className="mb-2">Filip Eckstein</h3>
                  <p className="text-sm opacity-90">{t.contest.subtitle}</p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* Certificate Dialog */}
      <Dialog open={certificateDialogOpen} onOpenChange={setCertificateDialogOpen}>
        <DialogContent className="!max-w-[90vw] !w-[90vw] h-[95vh] max-h-[95vh] p-4 flex flex-col" aria-describedby={undefined}>
          <DialogHeader className="pb-2 shrink-0">
            <DialogTitle>{t.certifications.combined.title}</DialogTitle>
          </DialogHeader>
          <div className="flex-1 flex items-center justify-center overflow-hidden">
            <ImageWithFallback
              src={certificateImage}
              alt="Filip Eckstein Fusion360 Certificate"
              className="max-w-full max-h-full w-auto h-auto object-contain"
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}