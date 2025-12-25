import { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import { Navigation } from "./components/Navigation";
import { Hero } from "./components/Hero";
import { About } from "./components/About";
import { Projects } from "./components/Projects";
import { Testimonials } from "./components/Testimonials";
import { Contact } from "./components/Contact";
import { Footer } from "./components/Footer";
import { ProjectsPage } from "./components/ProjectsPage";
import { AchievementsPage } from "./components/AchievementsPage";
import { TestimonialsPage } from "./components/TestimonialsPage";
import { AdminPage } from "./components/AdminPage";
import { Language } from "./translations";
import { Toaster } from "sonner@2.0.3";

function HomePage({ language }: { language: Language }) {
  const location = useLocation();

  useEffect(() => {
    // Restore scroll position when returning to home page
    const savedScrollPosition = localStorage.getItem('homeScrollPosition');
    if (savedScrollPosition) {
      const scrollY = parseInt(savedScrollPosition, 10);
      window.scrollTo(0, scrollY);
      localStorage.removeItem('homeScrollPosition');
    }
    
    // Check if we should scroll to projects section
    if (location.state?.scrollToProjects) {
      const projectsSection = document.getElementById("projects");
      if (projectsSection) {
        projectsSection.scrollIntoView({ behavior: "smooth" });
      }
      // Clear the state after scrolling
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  return (
    <main>
      <Hero language={language} />
      <About language={language} />
      <Projects language={language} />
      <Testimonials language={language} />
      <Contact language={language} />
      <Footer language={language} />
    </main>
  );
}

export default function App() {
  const [language, setLanguage] = useState<Language>(() => {
    // Load language from localStorage or default to "cs"
    const savedLanguage = localStorage.getItem("language");
    return (savedLanguage === "cs" || savedLanguage === "en") ? savedLanguage : "cs";
  });

  // Save language to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("language", language);
  }, [language]);

  useEffect(() => {
    document.title = "Filip Eckstein - CAD & 3D printing Portfolio";
  }, []);

  return (
    <Router>
      <div className="min-h-screen bg-background">
        <Routes>
          <Route
            path="/"
            element={
              <>
                <Navigation language={language} onLanguageChange={setLanguage} />
                <HomePage language={language} />
              </>
            }
          />
          <Route
            path="/projects/*"
            element={
              <>
                <Navigation language={language} onLanguageChange={setLanguage} />
                <ProjectsPage language={language} onLanguageChange={setLanguage} />
              </>
            }
          />
          <Route
            path="/achievements"
            element={
              <>
                <Navigation language={language} onLanguageChange={setLanguage} />
                <AchievementsPage language={language} onLanguageChange={setLanguage} />
              </>
            }
          />
          <Route
            path="/testimonials"
            element={
              <>
                <Navigation language={language} onLanguageChange={setLanguage} />
                <TestimonialsPage language={language} />
              </>
            }
          />
          <Route
            path="/admin"
            element={<AdminPage />}
          />
        </Routes>
        <Toaster />
      </div>
    </Router>
  );
}