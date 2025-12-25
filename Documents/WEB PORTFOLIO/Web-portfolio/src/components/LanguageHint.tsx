import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { Language } from "../translations";

interface LanguageHintProps {
  language: Language;
  onClose?: () => void;
}

export function LanguageHint({ language, onClose }: LanguageHintProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if user has already seen the hint
    const hasSeenHint = localStorage.getItem("hasSeenLanguageHint");
    
    if (!hasSeenHint) {
      // Show hint after a short delay
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 500);

      return () => {
        clearTimeout(timer);
      };
    }
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    localStorage.setItem("hasSeenLanguageHint", "true");
    onClose?.();
  };

  if (!isVisible) return null;

  // Always show in English
  const text = "You can change language here";
  const buttonText = "OK";

  return (
    <>
      {/* Blur overlay - everything except top navigation bar */}
      <div className="fixed top-16 left-0 right-0 bottom-0 backdrop-blur-sm bg-background/10 z-40" />
      
      {/* Hint container */}
      <div className="fixed top-20 right-16 md:right-24 z-50 animate-in fade-in slide-in-from-bottom-2 duration-500">
        <div className="relative flex flex-col items-center gap-2">
          {/* Simple arrow pointing straight up */}
          <div className="animate-bounce-slow flex justify-center">
            <svg 
              width="40" 
              height="50" 
              viewBox="0 0 40 50" 
              fill="none"
              style={{
                filter: "drop-shadow(0 2px 8px rgba(0,0,0,0.3))",
              }}
            >
              {/* Arrow shaft - straight line pointing up */}
              <line 
                x1="20" 
                y1="50" 
                x2="20" 
                y2="10" 
                stroke="currentColor" 
                strokeWidth="6" 
                strokeLinecap="round"
                className="text-foreground"
              />
              {/* Arrow head - triangle pointing up */}
              <path 
                d="M 20 5 L 10 15 L 30 15 Z" 
                fill="currentColor"
                className="text-foreground"
              />
            </svg>
          </div>

          {/* Hint bubble */}
          <div className="bg-background rounded-2xl shadow-2xl p-6 min-w-[240px] relative border-2 border-foreground">
            <button
              onClick={handleClose}
              className="absolute top-3 right-3 text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Close hint"
            >
              <X className="h-5 w-5" />
            </button>
            <p className="text-sm mb-4 pr-6 text-foreground">
              {text}
            </p>
            <button
              onClick={handleClose}
              className="bg-foreground hover:bg-foreground/90 text-background px-6 py-2 rounded-lg transition-all text-sm shadow-md w-full"
            >
              {buttonText}
            </button>
          </div>
        </div>

        <style>{`
          @keyframes bounce-slow {
            0%, 100% {
              transform: translateY(0);
            }
            50% {
              transform: translateY(-10px);
            }
          }
          .animate-bounce-slow {
            animation: bounce-slow 2s ease-in-out infinite;
          }
        `}</style>
      </div>
    </>
  );
}