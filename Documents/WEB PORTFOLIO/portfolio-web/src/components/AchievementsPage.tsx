import { Trophy, Award, CheckCircle2, ExternalLink, FileText } from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Language, translations } from "../translations";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { projectId, publicAnonKey } from '../utils/supabase/info';

interface AchievementsPageProps {
  language: Language;
  onLanguageChange: (lang: Language) => void;
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
  placement?: string;
  placementCs?: string;
  image?: string;
  presentationImage?: string;
  projectId?: string;
  contestUrl?: string;
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

export function AchievementsPage({ language }: AchievementsPageProps) {
  const t = translations[language].achievements;
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCertificate, setSelectedCertificate] = useState<Achievement | null>(null);
  const [presentationImageUrl, setPresentationImageUrl] = useState<string | null>(null);

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

  useEffect(() => {
    loadAchievements();
    loadPresentationImage();
  }, []);

  useEffect(() => {
    // Scroll to section based on hash
    const hash = window.location.hash;
    if (hash === '#certifications') {
      // Wait for content to load, then scroll
      setTimeout(() => {
        const element = document.getElementById('certifications');
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 300);
    }
  }, [achievements]); // Run when achievements load

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
        // Sort achievements by order (ascending), then by createdAt (descending) as fallback
        const sortedAchievements = (data.achievements || []).sort((a: Achievement, b: Achievement) => {
          if (a.order !== undefined && b.order !== undefined) {
            return a.order - b.order;
          }
          if (a.order !== undefined) return -1;
          if (b.order !== undefined) return 1;
          return (b.createdAt || 0) - (a.createdAt || 0);
        });
        setAchievements(sortedAchievements);
      }
    } catch (error) {
      console.error('Error loading achievements:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadPresentationImage = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-635fd90e/admin/content`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        if (data.content?.achievementsPresentationImageUrl) {
          setPresentationImageUrl(data.content.achievementsPresentationImageUrl);
        }
      }
    } catch (error) {
      console.error('Error loading presentation image:', error);
    }
  };

  const competitions = achievements.filter(a => a.type === 'competition');
  const certifications = achievements.filter(a => a.type === 'certification');

  const handleViewCertificate = (cert: Achievement) => {
    setSelectedCertificate(cert);
  };

  const handleDownloadCertificate = (cert: Achievement) => {
    if (cert.certificatePdf) {
      const link = document.createElement("a");
      link.href = cert.certificatePdf;
      link.download = `${cert.title.replace(/\s+/g, '_')}_Certificate.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-20 pb-12 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading achievements...</p>
        </div>
      </div>
    );
  }

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

          {/* Competitions Section */}
          {competitions.length > 0 && (
            <div className="mb-12">
              <div className="flex items-center gap-2 mb-6">
                <Trophy className="h-6 w-6 text-yellow-500" />
                <h2 className="text-foreground">
                  {language === 'cs' ? 'Soutěže a Ocenění' : 'Competitions & Awards'}
                </h2>
              </div>
              
              <div className="space-y-6">
                {competitions.map((competition) => (
                  <Card key={competition.id} className="overflow-hidden">
                    <div className="grid md:grid-cols-2 gap-0">
                      {competition.image && (
                        <div className="relative h-64 md:h-auto">
                          <img
                            src={competition.image}
                            alt={language === 'cs' ? competition.titleCs : competition.title}
                            className="w-full h-full object-cover"
                          />
                          {competition.award && (
                            <div className="absolute top-4 left-4">
                              <Badge className="bg-yellow-500 hover:bg-yellow-600 text-white">
                                <Trophy className="h-3 w-3 mr-1" />
                                {language === 'cs' ? competition.awardCs : competition.award}
                              </Badge>
                            </div>
                          )}
                        </div>
                      )}
                      <div className="p-6 md:p-8">
                        <div className="flex items-center gap-2 mb-3">
                          <Trophy className="h-6 w-6 text-yellow-500" />
                          <h2 className="text-foreground">
                            {language === 'cs' ? competition.titleCs : competition.title}
                          </h2>
                        </div>
                        <p className="text-primary mb-4">
                          {language === 'cs' ? competition.subtitleCs : competition.subtitle}
                        </p>
                        <p className="text-muted-foreground mb-6">
                          {language === 'cs' ? competition.descriptionCs : competition.description}
                        </p>

                        {/* Competition Details */}
                        <div className="space-y-3 mb-6">
                          <div className="grid grid-cols-2 gap-4">
                            {competition.competitionName && (
                              <div>
                                <p className="text-sm text-muted-foreground">
                                  {language === 'cs' ? 'Název soutěže' : 'Competition Name'}
                                </p>
                                <p className="text-foreground">
                                  {language === 'cs' ? competition.competitionNameCs : competition.competitionName}
                                </p>
                              </div>
                            )}
                            {competition.year && (
                              <div>
                                <p className="text-sm text-muted-foreground">
                                  {language === 'cs' ? 'Rok' : 'Year'}
                                </p>
                                <p className="text-foreground">{competition.year}</p>
                              </div>
                            )}
                            {competition.level && (
                              <div>
                                <p className="text-sm text-muted-foreground">
                                  {language === 'cs' ? 'Úroveň' : 'Level'}
                                </p>
                                <p className="text-foreground">
                                  {language === 'cs' ? competition.levelCs : competition.level}
                                </p>
                              </div>
                            )}
                            {competition.award && (
                              <div>
                                <p className="text-sm text-muted-foreground">
                                  {language === 'cs' ? 'Ocenění' : 'Award'}
                                </p>
                                <p className="text-foreground text-yellow-600">
                                  {language === 'cs' ? competition.awardCs : competition.award}
                                </p>
                              </div>
                            )}
                            {competition.placement && (
                              <div>
                                <p className="text-sm text-muted-foreground">
                                  {language === 'cs' ? 'Místo' : 'Placement'}
                                </p>
                                <p className="text-foreground">
                                  {language === 'cs' ? competition.placementCs : competition.placement}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          {competition.projectId && (
                            <Link 
                              to={`/projects?project=${competition.projectId}`}
                              onClick={() => {
                                localStorage.setItem('achievementsScrollPosition', window.scrollY.toString());
                                localStorage.setItem('projectOpenedFromAchievements', 'true');
                              }}
                            >
                              <Button>
                                {language === 'cs' ? 'Zobrazit projekt' : 'View Project'}
                                <ExternalLink className="ml-2 h-4 w-4" />
                              </Button>
                            </Link>
                          )}
                          {competition.contestUrl && (
                            <a href={competition.contestUrl} target="_blank" rel="noopener noreferrer">
                              <Button variant="outline">
                                {language === 'cs' ? 'Navštívit soutěž' : 'Visit Contest'}
                                <ExternalLink className="ml-2 h-4 w-4" />
                              </Button>
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Certifications Section */}
          {certifications.length > 0 && (
            <div id="certifications" className="mb-12">
              <div className="flex items-center gap-2 mb-6">
                <Award className="h-6 w-6 text-primary" />
                <h2 className="text-foreground">
                  {language === 'cs' ? 'Certifikace' : 'Certifications'}
                </h2>
              </div>
              <p className="text-muted-foreground mb-8 max-w-2xl">
                {language === 'cs' 
                  ? 'Profesionální certifikace a školení v oblasti CAD a 3D designu.'
                  : 'Professional certifications and training in CAD and 3D design.'}
              </p>

              <div className="space-y-6 max-w-3xl mx-auto">
                {certifications.map((cert) => (
                  <Card key={cert.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between mb-2">
                        <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                          <Award className="h-6 w-6 text-primary" />
                        </div>
                        {cert.issuer && (
                          <Badge variant="outline" className="text-primary border-primary">
                            {language === 'cs' ? cert.issuerCs : cert.issuer}
                          </Badge>
                        )}
                      </div>
                      <CardTitle>
                        {language === 'cs' ? cert.titleCs : cert.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground mb-6">
                        {language === 'cs' ? cert.descriptionCs : cert.description}
                      </p>
                      {cert.skills && cert.skills.length > 0 && (
                        <div className="space-y-2 mb-6">
                          <p className="text-sm text-muted-foreground">
                            {language === 'cs' ? 'Dovednosti' : 'Skills'}:
                          </p>
                          <ul className="grid md:grid-cols-2 gap-2">
                            {(language === 'cs' ? cert.skillsCs : cert.skills)?.map((skill: string, index: number) => (
                              <li key={index} className="flex items-center gap-2 text-sm">
                                <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0" />
                                <span>{skill}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      <div className="flex flex-wrap items-center gap-3">
                        {cert.certificateImage && (
                          <Button
                            variant="default"
                            onClick={() => handleViewCertificate(cert)}
                          >
                            <FileText className="mr-2 h-4 w-4" />
                            {language === 'cs' ? 'Zobrazit certifikát' : 'View Certificate'}
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Presentation Image - at the bottom after certifications */}
          {presentationImageUrl && (
            <div className="mt-6">
              <Card className="overflow-hidden">
                <div className="relative h-96">
                  <img
                    src={presentationImageUrl}
                    alt="Competition Presentation"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                  <div className="absolute bottom-6 left-6 text-white">
                    <h3 className="mb-2">Filip Eckstein</h3>
                    <p className="text-sm opacity-90">
                      {language === 'cs' 
                        ? competitions.find(c => c.presentationImage)?.subtitleCs 
                        : competitions.find(c => c.presentationImage)?.subtitle}
                    </p>
                  </div>
                </div>
              </Card>
            </div>
          )}

          {/* Empty State */}
          {competitions.length === 0 && certifications.length === 0 && (
            <div className="text-center py-12">
              <Trophy className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
              <p className="text-muted-foreground">
                {language === 'cs' ? 'Zatím žádné úspěchy' : 'No achievements yet'}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Certificate Dialog */}
      <Dialog open={!!selectedCertificate} onOpenChange={() => setSelectedCertificate(null)}>
        <DialogContent className="!max-w-[90vw] !w-[90vw] h-[95vh] max-h-[95vh] p-4 flex flex-col" aria-describedby={undefined}>
          <DialogHeader className="pb-2 shrink-0">
            <DialogTitle>
              {selectedCertificate && (language === 'cs' ? selectedCertificate.titleCs : selectedCertificate.title)}
            </DialogTitle>
          </DialogHeader>
          <div className="flex-1 flex items-center justify-center overflow-hidden">
            {selectedCertificate?.certificateImage && (
              <img
                src={selectedCertificate.certificateImage}
                alt={language === 'cs' ? selectedCertificate.titleCs : selectedCertificate.title}
                className="max-w-full max-h-full w-auto h-auto object-contain"
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}