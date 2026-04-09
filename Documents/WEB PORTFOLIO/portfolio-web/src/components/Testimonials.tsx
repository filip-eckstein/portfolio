import { Star } from "lucide-react";
import { Card, CardContent } from "./ui/card";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { Language, translations } from "../translations";
import { Button } from "./ui/button";
import { Link } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { useRemoteContent } from "../hooks/useRemoteContent";

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

function TestimonialCard({ testimonial, language, viewProjectText }: { testimonial: Testimonial; language: Language; viewProjectText: string }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [needsExpand, setNeedsExpand] = useState(false);
  const contentRef = useRef<HTMLParagraphElement>(null);
  const content = language === 'en' ? testimonial.content : testimonial.contentCs;

  useEffect(() => {
    const checkHeight = () => {
      if (contentRef.current) {
        const el = contentRef.current;
        const originalClamp = el.style.webkitLineClamp;
        const originalOverflow = el.style.overflow;
        el.style.webkitLineClamp = 'unset';
        el.style.overflow = 'visible';
        const lineHeight = parseFloat(getComputedStyle(el).lineHeight);
        const maxHeight = lineHeight * 11;
        const actualHeight = el.scrollHeight;
        el.style.webkitLineClamp = originalClamp;
        el.style.overflow = originalOverflow;
        setNeedsExpand(actualHeight > maxHeight + 5);
      }
    };
    setTimeout(checkHeight, 100);
  }, [content]);

  return (
    <Card className="relative h-full flex flex-col">
      <CardContent className="p-6 flex flex-col h-full">
        <div className="flex items-center gap-4 mb-4">
          <Avatar className="h-12 w-12">
            <AvatarFallback className="bg-muted text-muted-foreground">{testimonial.initials}</AvatarFallback>
          </Avatar>
          <div>
            <h4 className="text-foreground font-semibold">{testimonial.name}</h4>
            <p className="text-sm text-muted-foreground">{testimonial.role}</p>
            <p className="text-xs text-muted-foreground">{testimonial.company}</p>
          </div>
        </div>
        <div className="flex gap-1 mb-4">
          {Array.from({ length: testimonial.rating }).map((_, i) => (
            <Star key={i} className="h-4 w-4 fill-primary text-primary" />
          ))}
        </div>
        <div className="text-muted-foreground text-sm leading-relaxed flex-grow">
          <p ref={contentRef} style={{ display: '-webkit-box', WebkitLineClamp: isExpanded ? 'unset' : 11, WebkitBoxOrient: 'vertical', overflow: isExpanded ? 'visible' : 'hidden', wordBreak: 'break-word', overflowWrap: 'anywhere', whiteSpace: 'pre-wrap' }}>
            "{content}"
          </p>
          {needsExpand && (
            <button onClick={() => setIsExpanded(!isExpanded)} className="text-primary hover:underline text-sm mt-1 inline-block">
              {isExpanded ? (language === 'en' ? 'Show less' : 'Zobrazit méně') : (language === 'en' ? 'Show more' : 'Zobrazit více')}
            </button>
          )}
        </div>
        {testimonial.projectId && (
          <Link to={`/projects?project=${testimonial.projectId}`} onClick={() => { localStorage.setItem('homeScrollPosition', window.scrollY.toString()); localStorage.setItem('projectOpenedFromMainPage', 'true'); }}>
            <Button variant="secondary" className="mt-4 w-full">{viewProjectText}</Button>
          </Link>
        )}
      </CardContent>
    </Card>
  );
}

export function Testimonials({ language }: TestimonialsProps) {
  const localT = translations[language].testimonials;
  const { testimonials, loading, t } = useRemoteContent(language);

  const title = t('testimonialsTitle', localT.title);
  const subtitle = t('testimonialsSubtitle', localT.subtitle);

  if (loading) return (
    <section id="testimonials" className="py-20 bg-muted/30">
      <div className="container mx-auto px-4 text-center py-12">Loading testimonials...</div>
    </section>
  );

  const featured = testimonials.filter((t: any) => t.published !== false && t.featured === true).slice(0, 3);
  const displayTestimonials = featured.length > 0 ? featured : testimonials.filter((t: any) => t.published !== false).slice(0, 3);

  if (displayTestimonials.length === 0) return null;

  return (
    <section id="testimonials" className="py-20 bg-muted/30">
      <div className="container mx-auto px-4 max-w-6xl">
        <h2 className="text-center mb-4 text-foreground reveal reveal-up">{title}</h2>
        <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto reveal reveal-up delay-150">{subtitle}</p>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8 items-stretch">
          {displayTestimonials.map((testimonial, i) => (
            <div key={testimonial.id || i} className={`reveal reveal-scale-up delay-${[200, 350, 500][i]}`}>
              <TestimonialCard testimonial={testimonial} language={language} viewProjectText={localT.viewProject} />
            </div>
          ))}
        </div>

        <div className="text-center">
          <Link to="/testimonials" onClick={() => localStorage.setItem('homeScrollPosition', window.scrollY.toString())}>
            <Button variant="secondary" size="lg">{language === 'cs' ? 'Zobrazit všechny reference' : 'View All Testimonials'}</Button>
          </Link>
        </div>
      </div>
    </section>
  );
}