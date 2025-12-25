import { Star, Quote } from "lucide-react";
import { Card, CardContent } from "./ui/card";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { Language, translations } from "../translations";
import { Button } from "./ui/button";
import { Link } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { projectId, publicAnonKey } from '../utils/supabase/info';

interface TestimonialsProps {
  language: Language;
}

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
  published?: boolean;
  featured?: boolean;
}

interface TestimonialCardProps {
  testimonial: Testimonial;
  language: Language;
  viewProjectText: string;
}

function TestimonialCard({ testimonial, language, viewProjectText }: TestimonialCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [needsExpand, setNeedsExpand] = useState(false);
  const contentRef = useRef<HTMLParagraphElement>(null);
  
  const content = language === 'en' ? testimonial.content : testimonial.contentCs;

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
    <Card className="relative">
      <CardContent className="p-6">
        <div className="flex items-center gap-4 mb-4">
          <Avatar className="h-12 w-12">
            <AvatarFallback className="bg-primary text-primary-foreground">
              {testimonial.initials}
            </AvatarFallback>
          </Avatar>
          <div>
            <h4 className="text-foreground">{testimonial.name}</h4>
            <p className="text-sm text-muted-foreground">{testimonial.role}</p>
            <p className="text-xs text-muted-foreground">{testimonial.company}</p>
          </div>
        </div>

        <div className="flex gap-1 mb-4">
          {Array.from({ length: testimonial.rating }).map((_, i) => (
            <Star key={i} className="h-4 w-4 fill-primary text-primary" />
          ))}
        </div>

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

        <Link to={`/projects?project=${testimonial.projectId}`}>
          <Button className="mt-4">{viewProjectText}</Button>
        </Link>
      </CardContent>
    </Card>
  );
}

export function Testimonials({ language }: TestimonialsProps) {
  const t = translations[language].testimonials;
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [testimonialsContent, setTestimonialsContent] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadContent();
  }, []);

  const loadContent = async () => {
    try {
      const [testimonialsResponse, contentResponse] = await Promise.all([
        fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-635fd90e/admin/testimonials`,
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

      let allTestimonials: Testimonial[] = [];
      let contentData: any = null;

      if (testimonialsResponse.ok) {
        const data = await testimonialsResponse.json();
        allTestimonials = (data.testimonials || []).filter((t: Testimonial) => t.published !== false);
      }
      
      if (contentResponse.ok) {
        const data = await contentResponse.json();
        if (data.content) {
          contentData = data.content;
          setTestimonialsContent(data.content);
        }
      }

      // Determine which testimonials to feature using the featured field
      let featured: Testimonial[] = [];
      
      console.log('🔍 Testimonials.tsx - Featured selection logic:');
      console.log('📊 All testimonials count:', allTestimonials.length);
      
      // First, try to get testimonials marked as featured
      featured = allTestimonials.filter((t: any) => t.featured === true);
      
      console.log('⭐ Testimonials marked as featured:', featured.map(t => ({ id: t.id, name: t.name })));
      
      // If no featured testimonials, fallback to auto-select first 3
      if (featured.length === 0) {
        featured = allTestimonials.slice(0, 3);
        console.log('🔄 Auto-selected first 3 testimonials:', featured.map(t => ({ id: t.id, name: t.name })));
      }

      setTestimonials(featured);
    } catch (error) {
      console.error('Error loading testimonials content:', error);
    } finally {
      setLoading(false);
    }
  };

  // Use content from database if available, otherwise fallback to translations
  const title = language === 'cs'
    ? (testimonialsContent?.testimonialsTitleCs || t.title)
    : (testimonialsContent?.testimonialsTitle || t.title);
    
  const subtitle = language === 'cs'
    ? (testimonialsContent?.testimonialsSubtitleCs || t.subtitle)
    : (testimonialsContent?.testimonialsSubtitle || t.subtitle);

  if (loading) {
    return (
      <section id="testimonials" className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center py-12">Loading testimonials...</div>
        </div>
      </section>
    );
  }

  if (testimonials.length === 0) {
    return null; // Don't show section if no testimonials
  }

  return (
    <section id="testimonials" className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-center mb-4 text-foreground">
            {title}
          </h2>
          <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
            {subtitle}
          </p>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {testimonials.slice(0, 3).map((testimonial, index) => (
              <TestimonialCard
                key={testimonial.id || index}
                testimonial={testimonial}
                language={language}
                viewProjectText={t.viewProject}
              />
            ))}
          </div>
          
          {testimonials.length > 3 && (
            <div className="text-center">
              <Link 
                to="/testimonials"
                onClick={() => {
                  localStorage.setItem('homeScrollPosition', window.scrollY.toString());
                }}
              >
                <Button size="lg">
                  {language === 'cs' ? 'Zobrazit všechny reference' : 'View All Testimonials'}
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}