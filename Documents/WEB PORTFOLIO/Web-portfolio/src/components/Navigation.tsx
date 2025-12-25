import { useState, useEffect, useRef } from "react";
import { Menu, X, Languages, ArrowLeft } from "lucide-react";
import { Button } from "./ui/button";
import { Language, translations } from "../translations";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { LanguageHint } from "./LanguageHint";
import { toast } from "sonner@2.0.3";

interface NavigationProps {
  language: Language;
  onLanguageChange: (lang: Language) => void;
}

export function Navigation({ language, onLanguageChange }: NavigationProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [showHint, setShowHint] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  const t = translations[language].nav;

  // Don't render on admin page
  if (location.pathname.startsWith('/admin')) {
    return null;
  }

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Zavření menu při kliknutí mimo
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        isOpen &&
        mobileMenuRef.current &&
        !mobileMenuRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const isHomePage = location.pathname === "/";

  const navLinks = [
    { href: "#home", label: t.home, isHash: true },
    { href: "#about", label: t.about, isHash: true },
    { href: "/projects", label: t.projects, isHash: false },
    { href: "/achievements", label: t.achievements, isHash: false },
    { href: "#testimonials", label: t.testimonials, isHash: true },
    { href: "#contact", label: t.contact, isHash: true },
  ];

  const scrollToSection = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
      setIsOpen(false);
    }
  };

  const handleLanguageChange = (lang: Language) => {
    onLanguageChange(lang);
    setShowHint(false);
    // Always show notification in English
    toast.success("Language changed to " + (lang === "en" ? "English" : "Czech"));
  };

  const handleHintClose = () => {
    setShowHint(false);
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled 
          ? "bg-background/80 backdrop-blur-md shadow-md" 
          : "md:bg-transparent bg-white"
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {isHomePage ? (
            <a href="#home" className="text-foreground hover:text-primary transition-colors">
              Portfolio
            </a>
          ) : (
            <button 
              className="flex items-center gap-2 text-foreground hover:text-primary transition-colors"
              onClick={() => {
                navigate(-1);
              }}
            >
              <ArrowLeft className="h-4 w-4" />
              <span>{translations[language].nav.home === "Home" ? "Back" : "Zpět"}</span>
            </button>
          )}

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              link.isHash ? (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={(e) => {
                    if (isHomePage) {
                      scrollToSection(e, link.href);
                    } else {
                      window.location.href = "/" + link.href;
                    }
                  }}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  {link.label}
                </a>
              ) : (
                <Link
                  key={link.href}
                  to={link.href}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                  onClick={() => {
                    // Save scroll position based on current page
                    if (isHomePage) {
                      localStorage.setItem('homeScrollPosition', window.scrollY.toString());
                    } else if (location.pathname === '/projects') {
                      localStorage.setItem('projectsScrollPosition', window.scrollY.toString());
                    } else if (location.pathname === '/achievements') {
                      localStorage.setItem('achievementsScrollPosition', window.scrollY.toString());
                    }
                    setIsOpen(false);
                  }}
                >
                  {link.label}
                </Link>
              )
            ))}
            
            {/* Language Switcher */}
            <div className="flex items-center gap-2 ml-4">
              <Languages className="h-4 w-4 text-muted-foreground" />
              <button
                onClick={() => handleLanguageChange("en")}
                className={`transition-colors ${
                  language === "en" 
                    ? "text-foreground" 
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                EN
              </button>
              <span className="text-muted-foreground">/</span>
              <button
                onClick={() => handleLanguageChange("cs")}
                className={`transition-colors ${
                  language === "cs" 
                    ? "text-foreground" 
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                CZ
              </button>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden -mx-4 -mt-4 px-6 pt-8 pb-6 bg-white shadow-lg" ref={mobileMenuRef}>
            <div className="flex flex-col gap-4">
              {navLinks.map((link) => (
                link.isHash ? (
                  <a
                    key={link.href}
                    href={link.href}
                    onClick={(e) => scrollToSection(e, link.href)}
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.label}
                  </a>
                ) : (
                  <Link
                    key={link.href}
                    to={link.href}
                    className="text-muted-foreground hover:text-foreground transition-colors"
                    onClick={() => {
                      // Save scroll position based on current page
                      if (isHomePage) {
                        localStorage.setItem('homeScrollPosition', window.scrollY.toString());
                      } else if (location.pathname === '/projects') {
                        localStorage.setItem('projectsScrollPosition', window.scrollY.toString());
                      } else if (location.pathname === '/achievements') {
                        localStorage.setItem('achievementsScrollPosition', window.scrollY.toString());
                      }
                      setIsOpen(false);
                    }}
                  >
                    {link.label}
                  </Link>
                )
              ))}
              
              {/* Mobile Language Switcher */}
              <div className="flex items-center gap-2 pt-2 border-t border-border">
                <Languages className="h-4 w-4 text-muted-foreground" />
                <button
                  onClick={() => handleLanguageChange("en")}
                  className={`transition-colors ${
                    language === "en" 
                      ? "text-foreground" 
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  EN
                </button>
                <span className="text-muted-foreground">/</span>
                <button
                  onClick={() => handleLanguageChange("cs")}
                  className={`transition-colors ${
                    language === "cs" 
                      ? "text-foreground" 
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  CZ
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Language Hint - shows only on first visit */}
      {showHint && <LanguageHint language={language} onClose={handleHintClose} />}
    </nav>
  );
}