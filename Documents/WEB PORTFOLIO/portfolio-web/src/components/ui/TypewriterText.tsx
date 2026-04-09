import { useState, useEffect, useRef } from "react";

interface TypewriterTextProps {
  text: string;
  speed?: number;
  className?: string;
}

/**
 * A reusable typewriter animation component that triggers when scrolled into view.
 */
export function TypewriterText({ text, speed = 18, className = "" }: TypewriterTextProps) {
  const [displayed, setDisplayed] = useState("");
  const [started, setStarted] = useState(false);
  const [done, setDone] = useState(false);
  const containerRef = useRef<HTMLParagraphElement>(null);
  const indexRef = useRef(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Trigger when scrolled into view
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started) {
          setStarted(true);
          observer.disconnect();
        }
      },
      { threshold: 0.2 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [started]);

  // Run typing
  useEffect(() => {
    if (!started) return;
    indexRef.current = 0;
    setDisplayed("");
    setDone(false);

    const type = () => {
      if (indexRef.current < text.length) {
        setDisplayed(text.slice(0, indexRef.current + 1));
        indexRef.current++;
        timerRef.current = setTimeout(type, speed);
      } else {
        setDone(true);
      }
    };
    
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(type, speed);
    
    return () => { 
      if (timerRef.current) clearTimeout(timerRef.current); 
    };
  }, [started, text, speed]);

  return (
    <p
      ref={containerRef}
      className={`text-muted-foreground whitespace-pre-wrap leading-relaxed ${className}`}
    >
      {displayed}
      {!done && (
        <span
          className="inline-block w-[2px] h-[1.1em] bg-current ml-1 align-bottom animate-typewriter-cursor"
          style={{ opacity: 1 }}
        />
      )}
      <style>{`
        @keyframes typewriter-cursor {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0; }
        }
        .animate-typewriter-cursor {
          animation: typewriter-cursor 0.7s step-end infinite;
        }
      `}</style>
    </p>
  );
}
