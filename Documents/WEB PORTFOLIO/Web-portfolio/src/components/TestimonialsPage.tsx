import { useState, useEffect, useRef } from "react";
import { Quote, Star, ArrowLeft, ChevronLeft, ChevronRight, RefreshCw, User } from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { Language, translations } from "../translations";
import { useNavigate, useSearchParams } from "react-router-dom";
import { projectId, publicAnonKey } from '../utils/supabase/info';

interface Testimonial {
  id: string;
  name: string;
  role: string;
  company: string;
  content: string;
  contentCs: string;
  rating: number;
  initials: string;
  projectId?: string;
  createdAt?: number;
  updatedAt?: number;
}

interface TestimonialsPageProps {
  language: Language;
}

interface TestimonialCardProps {
  testimonial: Testimonial;
  language: Language;
  navigate: any;
  shouldExpand?: boolean;
}

function TestimonialCard({ testimonial, language, navigate, shouldExpand = false }: TestimonialCardProps) {
  const [isExpanded, setIsExpanded] = useState(shouldExpand);
  const [needsExpand, setNeedsExpand] = useState(false);
  const contentRef = useRef<HTMLParagraphElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  
  const content = language === 'cs' ? testimonial.contentCs || testimonial.content : testimonial.content;

  // Auto-expand if shouldExpand is true
  useEffect(() => {
    if (shouldExpand) {
      setIsExpanded(true);
      // Scroll to this card after a short delay
      setTimeout(() => {
        cardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 300);
    }
  }, [shouldExpand]);

  useEffect(() => {
    // Check if content exceeds 11 lines after render
    const checkHeight = () => {
      if (contentRef.current) {
        // Temporarily remove the clamp to measure full height
        const element = contentRef.current;
        const originalClamp = element.style.webkitLineClamp;
        const originalOverflow = element.style.overflow;
        
        element.style.webkitLineClamp = 'unset';
        element.style.overflow = 'visible';
        
        const lineHeight = parseFloat(getComputedStyle(element).lineHeight);
        const maxHeight = lineHeight * 11;
        const actualHeight = element.scrollHeight;
        
        // Restore clamp
        element.style.webkitLineClamp = originalClamp;
        element.style.overflow = originalOverflow;
        
        setNeedsExpand(actualHeight > maxHeight + 5); // +5px tolerance
      }
    };
    
    // Wait for DOM to render
    setTimeout(checkHeight, 100);
  }, [content]);

  return (
    <Card className="hover:shadow-lg transition-shadow" ref={cardRef}>
      <CardContent className="p-6">
        {/* Header with avatar and info */}
        <div className="flex items-start gap-4 mb-4">
          <Avatar className="h-12 w-12 bg-primary/10">
            <AvatarFallback className="text-primary">
              {testimonial.initials || testimonial.name.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <h3 className="font-semibold text-foreground">{testimonial.name}</h3>
            <p className="text-sm text-muted-foreground">{testimonial.role}</p>
            {testimonial.company && (
              <p className="text-sm text-muted-foreground">{testimonial.company}</p>
            )}
          </div>
        </div>

        {/* Rating */}
        <div className="flex gap-1 mb-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              className={`h-4 w-4 ${
                i < testimonial.rating
                  ? 'fill-primary text-primary'
                  : 'text-muted-foreground/30'
              }`}
            />
          ))}
        </div>

        {/* Content */}
        <div className="text-muted-foreground text-sm leading-relaxed">
          <p 
            ref={contentRef}
            style={{
              display: '-webkit-box',
              WebkitLineClamp: isExpanded ? 'unset' : 11,
              WebkitBoxOrient: 'vertical',
              overflow: isExpanded ? 'visible' : 'hidden',
              wordBreak: 'break-word',
              overflowWrap: 'anywhere',
              whiteSpace: 'pre-wrap',
            }}
          >
            "{content}"
          </p>
          {needsExpand && !isExpanded && (
            <button
              onClick={() => setIsExpanded(true)}
              className="text-primary hover:underline text-sm mt-1 inline-block"
            >
              {language === 'en' ? 'Show more' : 'Zobrazit více'}
            </button>
          )}
          {isExpanded && (
            <button
              onClick={() => setIsExpanded(false)}
              className="text-primary hover:underline text-sm mt-1 inline-block"
            >
              {language === 'en' ? 'Show less' : 'Zobrazit méně'}
            </button>
          )}
        </div>
        
        {/* View Project Button - only if projectId exists */}
        {testimonial.projectId && (
          <div className="mt-4 pt-4 border-t">
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full"
              onClick={() => navigate(`/projects?project=${testimonial.projectId}`)}
            >
              {language === 'cs' ? 'Zobrazit projekt' : 'View Project'}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function TestimonialsPage({ language }: TestimonialsPageProps) {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const t = translations[language].testimonials;
  
  // Get testimonial ID from URL
  const testimonialIdFromUrl = searchParams.get('testimonial');

  useEffect(() => {
    loadTestimonials();
  }, []);

  // Auto-refresh when window gains focus
  useEffect(() => {
    const handleFocus = () => {
      loadTestimonials();
    };
    
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, []);

  const loadTestimonials = async (showRefreshing = false) => {
    try {
      if (showRefreshing) setRefreshing(true);
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
    } finally {
      setLoading(false);
      if (showRefreshing) setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    loadTestimonials(true);
  };

  const handleBack = () => {
    const savedPosition = localStorage.getItem('homeScrollPosition');
    navigate('/');
    
    if (savedPosition) {
      setTimeout(() => {
        window.scrollTo({
          top: parseInt(savedPosition),
          behavior: 'smooth'
        });
        localStorage.removeItem('homeScrollPosition');
      }, 100);
    } else {
      setTimeout(() => {
        const testimonialsSection = document.querySelector('#testimonials');
        if (testimonialsSection) {
          testimonialsSection.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">{language === 'cs' ? 'Načítání referencí...' : 'Loading testimonials...'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 pb-12">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={handleBack}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            {language === 'cs' ? 'Zpět na hlavní stránku' : 'Back to homepage'}
          </Button>
          
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-4xl mb-2">{t.title}</h1>
              <p className="text-muted-foreground">
                {language === 'cs' 
                  ? `${testimonials.length} ${testimonials.length === 1 ? 'reference' : testimonials.length < 5 ? 'reference' : 'referencí'}`
                  : `${testimonials.length} ${testimonials.length === 1 ? 'testimonial' : 'testimonials'}`
                }
              </p>
            </div>
            
            <Button
              variant="outline"
              onClick={handleRefresh}
              disabled={refreshing}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              {language === 'cs' ? 'Obnovit' : 'Refresh'}
            </Button>
          </div>
        </div>

        {/* Testimonials Grid */}
        {testimonials.length === 0 ? (
          <div className="text-center py-20">
            <Quote className="h-16 w-16 mx-auto mb-4 text-muted-foreground/50" />
            <h3 className="text-xl mb-2 text-muted-foreground">
              {language === 'cs' ? 'Zatím žádn reference' : 'No testimonials yet'}
            </h3>
            <p className="text-muted-foreground">
              {language === 'cs' 
                ? 'Reference se budou zobrazovat zde.' 
                : 'Testimonials will appear here.'}
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {testimonials.map((testimonial) => (
              <TestimonialCard key={testimonial.id} testimonial={testimonial} language={language} navigate={navigate} shouldExpand={testimonialIdFromUrl === testimonial.id} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}