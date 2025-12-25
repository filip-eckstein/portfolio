import { useState, useEffect, useCallback, useRef } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Save, RotateCcw, Languages, CheckCircle, AlertCircle, RefreshCw, Plus, Trash2, Upload, X } from "lucide-react";
import { toast } from "sonner@2.0.3";
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { translations } from '../translations';

interface SocialLink {
  label: string;
  url: string;
  icon: string;
  customIconUrl?: string; // URL to custom uploaded icon
}

interface Achievement {
  id: string;
  title: string;
  titleCs: string;
}

interface Project {
  id: string;
  title: string;
  titleCs: string;
}

interface Testimonial {
  id: string;
  name: string;
  role: string;
  company: string;
}

interface ContentData {
  // Hero Section
  heroBadge: string;
  heroBadgeCs: string;
  heroSubtitle: string;
  heroSubtitleCs: string;
  heroName: string;
  heroDescription: string;
  heroDescriptionCs: string;
  
  // Hero Achievement Badges (2 badges side by side)
  heroAchievement1Text: string;
  heroAchievement1TextCs: string;
  heroAchievement1Type: 'achievement' | 'project' | 'testimonial' | 'external';
  heroAchievement1Id: string; // ID of selected item
  heroAchievement2Text: string;
  heroAchievement2TextCs: string;
  heroAchievement2Type: 'achievement' | 'project' | 'testimonial' | 'external';
  heroAchievement2Id: string; // ID of selected item
  heroMoreInfo: string;
  heroMoreInfoCs: string;
  
  // Hero Action Buttons (2 buttons side by side)
  heroViewProjects: string;
  heroViewProjectsCs: string;
  heroGetInTouch: string;
  heroGetInTouchCs: string;
  
  // Hero Images (3 images in hero section)
  heroImage1Path?: string; // Path in storage
  heroImage1Url?: string; // Signed URL for display
  heroImage2Path?: string;
  heroImage2Url?: string;
  heroImage3Path?: string;
  heroImage3Url?: string;
  
  // About Section
  aboutTitle: string;
  aboutTitleCs: string;
  aboutSubtitle: string;
  aboutSubtitleCs: string;
  aboutParagraph1: string;
  aboutParagraph1Cs: string;
  aboutParagraph2: string;
  aboutParagraph2Cs: string;
  aboutParagraph3: string;
  aboutParagraph3Cs: string;
  
  // About Image
  aboutImagePath?: string; // Path in storage
  aboutImageUrl?: string; // Signed URL for display
  
  // About Highlights
  educationTitle: string;
  educationTitleCs: string;
  educationDescription: string;
  educationDescriptionCs: string;
  educationType: 'achievement' | 'project' | 'external';
  educationId: string;
  contestTitle: string;
  contestTitleCs: string;
  contestDescription: string;
  contestDescriptionCs: string;
  contestType: 'achievement' | 'project' | 'external';
  contestId: string;
  certificationsTitle: string;
  certificationsTitleCs: string;
  certificationsDescription: string;
  certificationsDescriptionCs: string;
  certificationsType: 'achievement' | 'project' | 'external';
  certificationsId: string;
  
  // Projects Section
  projectsTitle: string;
  projectsTitleCs: string;
  projectsSubtitle: string;
  projectsSubtitleCs: string;
  projectsViewAll: string;
  projectsViewAllCs: string;
  projectsViewDetails: string;
  projectsViewDetailsCs: string;
  featuredProject1Id: string; // ID of first featured project
  featuredProject2Id: string; // ID of second featured project
  featuredProject3Id: string; // ID of third featured project
  
  // Testimonials Section
  testimonialsTitle: string;
  testimonialsTitleCs: string;
  testimonialsSubtitle: string;
  testimonialsSubtitleCs: string;
  featuredTestimonial1Id: string; // ID of first featured testimonial
  featuredTestimonial2Id: string; // ID of second featured testimonial
  featuredTestimonial3Id: string; // ID of third featured testimonial
  
  // Contact Section
  contactTitle: string;
  contactTitleCs: string;
  contactSubtitle: string;
  contactSubtitleCs: string;
  contactEmail: string; // My email address
  contactPhone: string; // My phone number
  contactLocation: string; // My location (EN)
  contactLocationCs: string; // My location (CS)
  contactNameLabel: string;
  contactNameLabelCs: string;
  contactNamePlaceholder: string;
  contactNamePlaceholderCs: string;
  contactEmailLabel: string;
  contactEmailLabelCs: string;
  contactEmailPlaceholder: string;
  contactEmailPlaceholderCs: string;
  contactMessageLabel: string;
  contactMessageLabelCs: string;
  contactMessagePlaceholder: string;
  contactMessagePlaceholderCs: string;
  contactSend: string;
  contactSendCs: string;
  contactSending: string;
  contactSendingCs: string;
  contactSuccess: string;
  contactSuccessCs: string;
  socialLinks: SocialLink[]; // Social media links
  
  // Footer
  footerTagline: string;
  footerTaglineCs: string;
  footerDescription: string;
  footerDescriptionCs: string;
}

// Default content from current translations
const getDefaultContent = (): ContentData => ({
  // Hero Section
  heroBadge: translations.en.hero.badge,
  heroBadgeCs: translations.cs.hero.badge,
  heroSubtitle: translations.en.hero.subtitle,
  heroSubtitleCs: translations.cs.hero.subtitle,
  heroName: translations.en.hero.name,
  heroDescription: translations.en.hero.description,
  heroDescriptionCs: translations.cs.hero.description,
  
  // Hero Achievement Badges (2 badges side by side)
  heroAchievement1Text: translations.en.hero.achievement1.text,
  heroAchievement1TextCs: translations.cs.hero.achievement1.text,
  heroAchievement1Type: 'achievement',
  heroAchievement1Id: '1',
  heroAchievement2Text: translations.en.hero.achievement2.text,
  heroAchievement2TextCs: translations.cs.hero.achievement2.text,
  heroAchievement2Type: 'achievement',
  heroAchievement2Id: '2',
  heroMoreInfo: translations.en.hero.moreInfo,
  heroMoreInfoCs: translations.cs.hero.moreInfo,
  
  // Hero Action Buttons (2 buttons side by side)
  heroViewProjects: translations.en.hero.viewProjects,
  heroViewProjectsCs: translations.cs.hero.viewProjects,
  heroGetInTouch: translations.en.hero.getInTouch,
  heroGetInTouchCs: translations.cs.hero.getInTouch,
  
  // About Section
  aboutTitle: translations.en.about.title,
  aboutTitleCs: translations.cs.about.title,
  aboutSubtitle: translations.en.about.subtitle,
  aboutSubtitleCs: translations.cs.about.subtitle,
  aboutParagraph1: translations.en.about.paragraph1,
  aboutParagraph1Cs: translations.cs.about.paragraph1,
  aboutParagraph2: translations.en.about.paragraph2,
  aboutParagraph2Cs: translations.cs.about.paragraph2,
  aboutParagraph3: translations.en.about.paragraph3,
  aboutParagraph3Cs: translations.cs.about.paragraph3,
  
  // About Highlights
  educationTitle: translations.en.about.highlights.education.title,
  educationTitleCs: translations.cs.about.highlights.education.title,
  educationDescription: translations.en.about.highlights.education.description,
  educationDescriptionCs: translations.cs.about.highlights.education.description,
  educationType: 'achievement',
  educationId: '',
  contestTitle: translations.en.about.highlights.contest.title,
  contestTitleCs: translations.cs.about.highlights.contest.title,
  contestDescription: translations.en.about.highlights.contest.description,
  contestDescriptionCs: translations.cs.about.highlights.contest.description,
  contestType: 'achievement',
  contestId: '',
  certificationsTitle: translations.en.about.highlights.certifications.title,
  certificationsTitleCs: translations.cs.about.highlights.certifications.title,
  certificationsDescription: translations.en.about.highlights.certifications.description,
  certificationsDescriptionCs: translations.cs.about.highlights.certifications.description,
  certificationsType: 'achievement',
  certificationsId: '',
  
  // Projects Section
  projectsTitle: translations.en.projects.title,
  projectsTitleCs: translations.cs.projects.title,
  projectsSubtitle: translations.en.projects.subtitle,
  projectsSubtitleCs: translations.cs.projects.subtitle,
  projectsViewAll: translations.en.projects.viewAll,
  projectsViewAllCs: translations.cs.projects.viewAll,
  projectsViewDetails: translations.en.projects.viewDetails,
  projectsViewDetailsCs: translations.cs.projects.viewDetails,
  featuredProject1Id: '',
  featuredProject2Id: '',
  featuredProject3Id: '',
  
  // Testimonials Section
  testimonialsTitle: translations.en.testimonials.title,
  testimonialsTitleCs: translations.cs.testimonials.title,
  testimonialsSubtitle: translations.en.testimonials.subtitle,
  testimonialsSubtitleCs: translations.cs.testimonials.subtitle,
  featuredTestimonial1Id: '',
  featuredTestimonial2Id: '',
  featuredTestimonial3Id: '',
  
  // Contact Section
  contactTitle: translations.en.contact.title,
  contactTitleCs: translations.cs.contact.title,
  contactSubtitle: translations.en.contact.subtitle,
  contactSubtitleCs: translations.cs.contact.subtitle,
  contactEmail: 'projekty@filip-eckstein.cz', // Default email
  contactPhone: '+420 725 633 154', // Default phone
  contactLocation: 'Prague, CZ', // Default location (EN)
  contactLocationCs: 'Praha, CZ', // Default location (CS)
  contactNameLabel: translations.en.contact.nameLabel,
  contactNameLabelCs: translations.cs.contact.nameLabel,
  contactNamePlaceholder: translations.en.contact.namePlaceholder,
  contactNamePlaceholderCs: translations.cs.contact.namePlaceholder,
  contactEmailLabel: translations.en.contact.emailLabel,
  contactEmailLabelCs: translations.cs.contact.emailLabel,
  contactEmailPlaceholder: translations.en.contact.emailPlaceholder,
  contactEmailPlaceholderCs: translations.cs.contact.emailPlaceholder,
  contactMessageLabel: translations.en.contact.messageLabel,
  contactMessageLabelCs: translations.cs.contact.messageLabel,
  contactMessagePlaceholder: translations.en.contact.messagePlaceholder,
  contactMessagePlaceholderCs: translations.cs.contact.messagePlaceholder,
  contactSend: translations.en.contact.send,
  contactSendCs: translations.cs.contact.send,
  contactSending: translations.en.contact.sending,
  contactSendingCs: translations.cs.contact.sending,
  contactSuccess: translations.en.contact.success,
  contactSuccessCs: translations.cs.contact.success,
  socialLinks: [], // Empty by default, user will add them
  
  // Footer
  footerTagline: translations.en.footer.tagline,
  footerTaglineCs: translations.cs.footer.tagline,
  footerDescription: translations.en.footer.description,
  footerDescriptionCs: translations.cs.footer.description,
});

interface ContentEditorProps {
  token: string;
}

export function ContentEditor({ token }: ContentEditorProps) {
  const [content, setContent] = useState<ContentData>(getDefaultContent());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeLanguage, setActiveLanguage] = useState<'en' | 'cs'>('en');
  const [uploadingImage, setUploadingImage] = useState(false);
  
  // Debug: Log token on mount and when it changes
  useEffect(() => {
    console.log('🔑 ContentEditor - Token received:', token ? token.substring(0, 20) + '...' : 'NO TOKEN');
    console.log('🔑 Token length:', token?.length || 0);
    console.log('🔑 Token is UUID:', /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(token || ''));
  }, [token]);
  
  // Data for dropdowns
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const hasLoadedRef = useRef(false);
  const [refreshingDropdowns, setRefreshingDropdowns] = useState(false);

  const loadDropdownData = useCallback(async (forceRefresh = false) => {
    if (hasLoadedRef.current && !forceRefresh) return; // Prevent multiple loads
    
    try {
      if (forceRefresh) setRefreshingDropdowns(true);
      
      // Load projects (public endpoint)
      const projectsRes = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-635fd90e/projects`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
          },
        }
      );
      
      if (projectsRes.ok) {
        const projectsData = await projectsRes.json();
        console.log('Loaded projects:', projectsData);
        if (projectsData.projects) {
          setProjects(projectsData.projects);
        }
      } else {
        console.error('Failed to load projects:', projectsRes.status);
      }

      // Load achievements (admin endpoint with auth to get all items including unpublished)
      const achievementsRes = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-635fd90e/admin/achievements`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'X-Admin-Token': token,  // Include token to get all achievements
          },
        }
      );
      
      if (achievementsRes.ok) {
        const achievementsData = await achievementsRes.json();
        console.log('Loaded achievements:', achievementsData);
        if (achievementsData.achievements) {
          setAchievements(achievementsData.achievements);
        }
      } else {
        console.error('Failed to load achievements:', achievementsRes.status);
      }

      // Load testimonials (admin endpoint with auth to get all items including unpublished)
      const testimonialsRes = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-635fd90e/admin/testimonials`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'X-Admin-Token': token,  // Include token to get all testimonials
          },
        }
      );
      
      if (testimonialsRes.ok) {
        const testimonialsData = await testimonialsRes.json();
        console.log('Loaded testimonials:', testimonialsData);
        if (testimonialsData.testimonials) {
          setTestimonials(testimonialsData.testimonials);
        }
      } else {
        console.error('Failed to load testimonials:', testimonialsRes.status);
      }
      
      hasLoadedRef.current = true;
      if (forceRefresh) {
        toast.success('Dropdowns refreshed');
      }
    } catch (error) {
      console.error('Error loading dropdown data:', error);
      if (forceRefresh) {
        toast.error('Failed to refresh dropdowns');
      }
    } finally {
      if (forceRefresh) setRefreshingDropdowns(false);
    }
  }, [token]);

  const loadContent = useCallback(async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-635fd90e/admin/content`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,  // Required by Supabase Edge Functions
            'X-Admin-Token': token,  // Our session token
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        console.log('📥 Content loaded from database:', data.content);
        console.log('🎯 Featured Project IDs loaded:', {
          featuredProject1Id: data.content?.featuredProject1Id,
          featuredProject2Id: data.content?.featuredProject2Id,
          featuredProject3Id: data.content?.featuredProject3Id,
        });
        console.log('🎯 Featured Testimonial IDs loaded:', {
          featuredTestimonial1Id: data.content?.featuredTestimonial1Id,
          featuredTestimonial2Id: data.content?.featuredTestimonial2Id,
          featuredTestimonial3Id: data.content?.featuredTestimonial3Id,
        });
        // Merge database content with defaults - this ensures all fields have values
        if (data.content && Object.keys(data.content).length > 0) {
          const defaults = getDefaultContent();
          const merged = { ...defaults, ...data.content };
          setContent(merged);
        }
      }
    } catch (error) {
      console.error('Error loading content:', error);
      toast.error('Failed to load content');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (hasLoadedRef.current) return;
    const init = async () => {
      await loadContent();
      await loadDropdownData();
    };
    init();
  }, [loadContent, loadDropdownData]);

  const handleSave = async () => {
    setSaving(true);
    
    try {
      console.log('\n=== 🔵 FRONTEND: Starting content save ===');
      console.log('1️⃣ Token present:', !!token);
      console.log('2️⃣ Token value:', token ? token.substring(0, 20) + '...' : 'MISSING');
      console.log('2️⃣b Full token being sent:', token);
      console.log('3️⃣ Content keys:', Object.keys(content).length);
      console.log('🎯 Featured Project IDs being saved:', {
        featuredProject1Id: content.featuredProject1Id,
        featuredProject2Id: content.featuredProject2Id,
        featuredProject3Id: content.featuredProject3Id,
      });
      console.log('🎯 Featured Testimonial IDs being saved:', {
        featuredTestimonial1Id: content.featuredTestimonial1Id,
        featuredTestimonial2Id: content.featuredTestimonial2Id,
        featuredTestimonial3Id: content.featuredTestimonial3Id,
      });
      
      // Validate token before sending
      if (!token) {
        console.error('❌ No token available!');
        toast.error('You are not logged in. Please refresh and login again.');
        return;
      }
      
      console.log('4️⃣ Sending request to server...');
      
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-635fd90e/admin/content`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,  // Required by Supabase Edge Functions
            'X-Admin-Token': token,  // Our session token
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ content }),
        }
      );
      
      console.log('5️⃣ Response status:', response.status);
      console.log('6️⃣ Response ok:', response.ok);
      
      // Try to parse JSON response
      let data;
      const contentType = response.headers.get('content-type');
      
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
        console.log('7️⃣ Response data:', data);
      } else {
        const text = await response.text();
        console.error('❌ Non-JSON response:', text);
        toast.error('Server returned invalid response format');
        return;
      }
      
      // Handle response
      if (response.ok && data.success) {
        console.log('✅ Content saved successfully!');
        toast.success('Content saved successfully! 🎉');
      } else {
        console.error('❌ Save failed:', data);
        const errorMsg = data.error || data.message || data.details || 'Unknown error';
        toast.error(`Failed to save: ${errorMsg}`);
        
        // If session expired, suggest re-login
        if (response.status === 401) {
          toast.error('Your session expired. Please logout and login again.');
        }
      }
      
    } catch (error) {
      console.error('❌ Exception during save:', error);
      toast.error(`Error: ${String(error)}`);
    } finally {
      setSaving(false);
      console.log('=== 🟢 FRONTEND: Content save completed ===\n');
    }
  };

  const handleReset = () => {
    loadContent();
    toast.info('Content reset to saved version');
  };

  const updateField = (field: keyof ContentData, value: string) => {
    setContent(prev => ({ ...prev, [field]: value }));
  };

  const handleUploadImage = async (e: React.ChangeEvent<HTMLInputElement>, pathField: keyof ContentData, urlField: keyof ContentData) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-635fd90e/admin/upload`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'X-Admin-Token': token,
          },
          body: formData,
        }
      );

      const data = await response.json();

      if (data.success && data.path && data.url) {
        setContent(prev => ({
          ...prev,
          [pathField]: data.path,
          [urlField]: data.url,
        }));
        toast.success('Image uploaded successfully');
      } else {
        toast.error(data.error || 'Failed to upload image');
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('Failed to upload image');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleRemoveImage = (pathField: keyof ContentData, urlField: keyof ContentData) => {
    setContent(prev => ({
      ...prev,
      [pathField]: undefined,
      [urlField]: undefined,
    }));
    toast.success('Image removed');
  };

  if (loading) {
    return <div className="text-center py-12">Loading content editor...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl">Content Editor</h2>
          <p className="text-sm text-muted-foreground">
            Edit all text content across your website
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={async () => {
              console.log('🔍 Testing session...');
              try {
                const response = await fetch(
                  `https://${projectId}.supabase.co/functions/v1/make-server-635fd90e/debug/check-token`,
                  {
                    method: 'POST',
                    headers: { 
                      'Content-Type': 'application/json',
                      'Authorization': `Bearer ${publicAnonKey}`
                    },
                    body: JSON.stringify({ token }),
                  }
                );
                const data = await response.json();
                console.log('Session check result:', data);
                if (data.valid) {
                  toast.success('✅ Session is valid!');
                } else {
                  toast.error('❌ Session invalid: ' + (data.error || 'Unknown'));
                }
              } catch (error) {
                toast.error('Test failed: ' + String(error));
              }
            }}
          >
            🔍 Test Session
          </Button>
          <Button 
            variant="outline" 
            onClick={() => loadDropdownData(true)}
            disabled={refreshingDropdowns}
            title="Refresh projects, testimonials and achievements lists"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshingDropdowns ? 'animate-spin' : ''}`} />
            {refreshingDropdowns ? 'Refreshing...' : 'Refresh Lists'}
          </Button>
          <Button variant="outline" onClick={handleReset}>
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            <Save className="h-4 w-4 mr-2" />
            {saving ? 'Saving...' : 'Save All Changes'}
          </Button>
        </div>
      </div>

      {/* Language Toggle */}
      <div className="flex items-center gap-2 bg-muted p-3 rounded-lg">
        <Languages className="h-5 w-5 text-muted-foreground" />
        <span className="text-sm font-medium">Editing:</span>
        <Button
          variant={activeLanguage === 'en' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setActiveLanguage('en')}
        >
          English
        </Button>
        <Button
          variant={activeLanguage === 'cs' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setActiveLanguage('cs')}
        >
          Čeština
        </Button>
      </div>

      {/* Content Sections */}
      <Tabs defaultValue="hero" className="space-y-4">
        <TabsList className="grid grid-cols-6 w-full">
          <TabsTrigger value="hero">Hero</TabsTrigger>
          <TabsTrigger value="about">About</TabsTrigger>
          <TabsTrigger value="projects">Projects</TabsTrigger>
          <TabsTrigger value="testimonials">Testimonials</TabsTrigger>
          <TabsTrigger value="contact">Contact</TabsTrigger>
          <TabsTrigger value="footer">Footer</TabsTrigger>
        </TabsList>

        {/* Hero Section */}
        <TabsContent value="hero" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Hero Section</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4">
                <div>
                  <Label>Badge {activeLanguage === 'en' ? '(EN)' : '(CS)'}</Label>
                  <Input
                    value={activeLanguage === 'en' ? content.heroBadge : content.heroBadgeCs}
                    onChange={(e) => updateField(activeLanguage === 'en' ? 'heroBadge' : 'heroBadgeCs', e.target.value)}
                    placeholder="Contest Winner Designer"
                  />
                </div>

                <div>
                  <Label>Subtitle {activeLanguage === 'en' ? '(EN)' : '(CS)'}</Label>
                  <Input
                    value={activeLanguage === 'en' ? content.heroSubtitle : content.heroSubtitleCs}
                    onChange={(e) => updateField(activeLanguage === 'en' ? 'heroSubtitle' : 'heroSubtitleCs', e.target.value)}
                    placeholder="CAD & 3D printing"
                  />
                </div>

                <div>
                  <Label>Name (Same for both languages)</Label>
                  <Input
                    value={content.heroName}
                    onChange={(e) => updateField('heroName', e.target.value)}
                    placeholder="Filip Eckstein"
                  />
                </div>

                <div>
                  <Label>Description {activeLanguage === 'en' ? '(EN)' : '(CS)'}</Label>
                  <Textarea
                    value={activeLanguage === 'en' ? content.heroDescription : content.heroDescriptionCs}
                    onChange={(e) => updateField(activeLanguage === 'en' ? 'heroDescription' : 'heroDescriptionCs', e.target.value)}
                    placeholder="I turn ideas into reality..."
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>View Projects Button {activeLanguage === 'en' ? '(EN)' : '(CS)'}</Label>
                    <Input
                      value={activeLanguage === 'en' ? content.heroViewProjects : content.heroViewProjectsCs}
                      onChange={(e) => updateField(activeLanguage === 'en' ? 'heroViewProjects' : 'heroViewProjectsCs', e.target.value)}
                      placeholder="View Projects"
                    />
                  </div>
                  <div>
                    <Label>Get In Touch Button {activeLanguage === 'en' ? '(EN)' : '(CS)'}</Label>
                    <Input
                      value={activeLanguage === 'en' ? content.heroGetInTouch : content.heroGetInTouchCs}
                      onChange={(e) => updateField(activeLanguage === 'en' ? 'heroGetInTouch' : 'heroGetInTouchCs', e.target.value)}
                      placeholder="Get in Touch"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Achievement 1 Text {activeLanguage === 'en' ? '(EN)' : '(CS)'}</Label>
                    <Input
                      value={activeLanguage === 'en' ? content.heroAchievement1Text : content.heroAchievement1TextCs}
                      onChange={(e) => updateField(activeLanguage === 'en' ? 'heroAchievement1Text' : 'heroAchievement1TextCs', e.target.value)}
                      placeholder="Contest Win 2025"
                    />
                  </div>
                  <div>
                    <Label>Achievement 2 Text {activeLanguage === 'en' ? '(EN)' : '(CS)'}</Label>
                    <Input
                      value={activeLanguage === 'en' ? content.heroAchievement2Text : content.heroAchievement2TextCs}
                      onChange={(e) => updateField(activeLanguage === 'en' ? 'heroAchievement2Text' : 'heroAchievement2TextCs', e.target.value)}
                      placeholder="Fusion 360 Certified"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Achievement 1 - Select Type</Label>
                    <Select
                      value={content.heroAchievement1Type}
                      onValueChange={(value) => updateField('heroAchievement1Type', value as any)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select type..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="achievement">Úspěch / Achievement</SelectItem>
                        <SelectItem value="project">Projekt / Project</SelectItem>
                        <SelectItem value="testimonial">Reference / Testimonial</SelectItem>
                        <SelectItem value="external">Externí odkaz / External Link</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Achievement 2 - Select Type</Label>
                    <Select
                      value={content.heroAchievement2Type}
                      onValueChange={(value) => updateField('heroAchievement2Type', value as any)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select type..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="achievement">Úspěch / Achievement</SelectItem>
                        <SelectItem value="project">Projekt / Project</SelectItem>
                        <SelectItem value="testimonial">Reference / Testimonial</SelectItem>
                        <SelectItem value="external">Externí odkaz / External Link</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Achievement 1 - Select Item</Label>
                    {content.heroAchievement1Type === 'achievement' && (
                      <Select
                        value={content.heroAchievement1Id}
                        onValueChange={(value) => updateField('heroAchievement1Id', value)}
                        onOpenChange={(open) => { if (open) loadDropdownData(true); }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Vyberte úspěch / Select achievement..." />
                        </SelectTrigger>
                        <SelectContent>
                          {achievements.map((achievement) => (
                            <SelectItem key={achievement.id} value={achievement.id}>
                              {activeLanguage === 'en' ? achievement.title : achievement.titleCs}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                    {content.heroAchievement1Type === 'project' && (
                      <Select
                        value={content.heroAchievement1Id}
                        onValueChange={(value) => updateField('heroAchievement1Id', value)}
                        onOpenChange={(open) => { if (open) loadDropdownData(true); }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Vyberte projekt / Select project..." />
                        </SelectTrigger>
                        <SelectContent>
                          {projects.map((project) => (
                            <SelectItem key={project.id} value={project.id}>
                              {activeLanguage === 'en' ? project.title : project.titleCs}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                    {content.heroAchievement1Type === 'testimonial' && (
                      <Select
                        value={content.heroAchievement1Id}
                        onValueChange={(value) => updateField('heroAchievement1Id', value)}
                        onOpenChange={(open) => { if (open) loadDropdownData(true); }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Vyberte referenci / Select testimonial..." />
                        </SelectTrigger>
                        <SelectContent>
                          {testimonials.map((testimonial) => (
                            <SelectItem key={testimonial.id} value={testimonial.id}>
                              {activeLanguage === 'en' ? testimonial.name : testimonial.nameCs}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                    {content.heroAchievement1Type === 'external' && (
                      <Input
                        value={content.heroAchievement1Id}
                        onChange={(e) => updateField('heroAchievement1Id', e.target.value)}
                        placeholder="https://example.com"
                      />
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Achievement 2 - Select Item</Label>
                    {content.heroAchievement2Type === 'achievement' && (
                      <Select
                        value={content.heroAchievement2Id}
                        onValueChange={(value) => updateField('heroAchievement2Id', value)}
                        onOpenChange={(open) => { if (open) loadDropdownData(true); }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Vyberte úspěch / Select achievement..." />
                        </SelectTrigger>
                        <SelectContent>
                          {achievements.map((achievement) => (
                            <SelectItem key={achievement.id} value={achievement.id}>
                              {activeLanguage === 'en' ? achievement.title : achievement.titleCs}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                    {content.heroAchievement2Type === 'project' && (
                      <Select
                        value={content.heroAchievement2Id}
                        onValueChange={(value) => updateField('heroAchievement2Id', value)}
                        onOpenChange={(open) => { if (open) loadDropdownData(true); }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Vyberte projekt / Select project..." />
                        </SelectTrigger>
                        <SelectContent>
                          {projects.map((project) => (
                            <SelectItem key={project.id} value={project.id}>
                              {activeLanguage === 'en' ? project.title : project.titleCs}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                    {content.heroAchievement2Type === 'testimonial' && (
                      <Select
                        value={content.heroAchievement2Id}
                        onValueChange={(value) => updateField('heroAchievement2Id', value)}
                        onOpenChange={(open) => { if (open) loadDropdownData(true); }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Vyberte referenci / Select testimonial..." />
                        </SelectTrigger>
                        <SelectContent>
                          {testimonials.map((testimonial) => (
                            <SelectItem key={testimonial.id} value={testimonial.id}>
                              {activeLanguage === 'en' ? testimonial.name : testimonial.nameCs}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                    {content.heroAchievement2Type === 'external' && (
                      <Input
                        value={content.heroAchievement2Id}
                        onChange={(e) => updateField('heroAchievement2Id', e.target.value)}
                        placeholder="https://example.com"
                      />
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>More Info Button {activeLanguage === 'en' ? '(EN)' : '(CS)'}</Label>
                    <Input
                      value={activeLanguage === 'en' ? content.heroMoreInfo : content.heroMoreInfoCs}
                      onChange={(e) => updateField(activeLanguage === 'en' ? 'heroMoreInfo' : 'heroMoreInfoCs', e.target.value)}
                      placeholder="More Information"
                    />
                  </div>
                </div>

                {/* Hero Images */}
                <div className="pt-4 border-t">
                  <h3 className="text-sm font-medium mb-4">Hero Section Images (3 floating images)</h3>
                  <div className="grid grid-cols-3 gap-4">
                    {/* Image 1 */}
                    <div className="space-y-2">
                      <Label>Hero Image 1</Label>
                      {content.heroImage1Url ? (
                        <div className="relative group">
                          <img src={content.heroImage1Url} alt="Hero 1" className="w-full h-32 object-cover rounded-lg border" />
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => handleRemoveImage('heroImage1Path', 'heroImage1Url')}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : (
                        <div>
                          <Input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleUploadImage(e, 'heroImage1Path', 'heroImage1Url')}
                            disabled={uploadingImage}
                            className="hidden"
                            id="hero-image-1"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => document.getElementById('hero-image-1')?.click()}
                            disabled={uploadingImage}
                            className="w-full"
                          >
                            <Upload className="h-4 w-4 mr-2" />
                            {uploadingImage ? 'Uploading...' : 'Upload Image'}
                          </Button>
                        </div>
                      )}
                    </div>

                    {/* Image 2 */}
                    <div className="space-y-2">
                      <Label>Hero Image 2</Label>
                      {content.heroImage2Url ? (
                        <div className="relative group">
                          <img src={content.heroImage2Url} alt="Hero 2" className="w-full h-32 object-cover rounded-lg border" />
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => handleRemoveImage('heroImage2Path', 'heroImage2Url')}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : (
                        <div>
                          <Input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleUploadImage(e, 'heroImage2Path', 'heroImage2Url')}
                            disabled={uploadingImage}
                            className="hidden"
                            id="hero-image-2"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => document.getElementById('hero-image-2')?.click()}
                            disabled={uploadingImage}
                            className="w-full"
                          >
                            <Upload className="h-4 w-4 mr-2" />
                            {uploadingImage ? 'Uploading...' : 'Upload Image'}
                          </Button>
                        </div>
                      )}
                    </div>

                    {/* Image 3 */}
                    <div className="space-y-2">
                      <Label>Hero Image 3</Label>
                      {content.heroImage3Url ? (
                        <div className="relative group">
                          <img src={content.heroImage3Url} alt="Hero 3" className="w-full h-32 object-cover rounded-lg border" />
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => handleRemoveImage('heroImage3Path', 'heroImage3Url')}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : (
                        <div>
                          <Input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleUploadImage(e, 'heroImage3Path', 'heroImage3Url')}
                            disabled={uploadingImage}
                            className="hidden"
                            id="hero-image-3"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => document.getElementById('hero-image-3')?.click()}
                            disabled={uploadingImage}
                            className="w-full"
                          >
                            <Upload className="h-4 w-4" />
                            {uploadingImage ? 'Uploading...' : 'Upload Image'}
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* About Section */}
        <TabsContent value="about" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>About Section</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Title {activeLanguage === 'en' ? '(EN)' : '(CS)'}</Label>
                <Input
                  value={activeLanguage === 'en' ? content.aboutTitle : content.aboutTitleCs}
                  onChange={(e) => updateField(activeLanguage === 'en' ? 'aboutTitle' : 'aboutTitleCs', e.target.value)}
                  placeholder="About Me"
                />
              </div>

              <div>
                <Label>Subtitle {activeLanguage === 'en' ? '(EN)' : '(CS)'}</Label>
                <Textarea
                  value={activeLanguage === 'en' ? content.aboutSubtitle : content.aboutSubtitleCs}
                  onChange={(e) => updateField(activeLanguage === 'en' ? 'aboutSubtitle' : 'aboutSubtitleCs', e.target.value)}
                  placeholder="Learn more about my journey..."
                  rows={2}
                />
              </div>

              <div>
                <Label>Paragraph 1 {activeLanguage === 'en' ? '(EN)' : '(CS)'}</Label>
                <Textarea
                  value={activeLanguage === 'en' ? content.aboutParagraph1 : content.aboutParagraph1Cs}
                  onChange={(e) => updateField(activeLanguage === 'en' ? 'aboutParagraph1' : 'aboutParagraph1Cs', e.target.value)}
                  placeholder="I'm a 16-year-old student..."
                  rows={4}
                />
              </div>

              <div>
                <Label>Paragraph 2 {activeLanguage === 'en' ? '(EN)' : '(CS)'}</Label>
                <Textarea
                  value={activeLanguage === 'en' ? content.aboutParagraph2 : content.aboutParagraph2Cs}
                  onChange={(e) => updateField(activeLanguage === 'en' ? 'aboutParagraph2' : 'aboutParagraph2Cs', e.target.value)}
                  placeholder="I've worked on various projects..."
                  rows={4}
                />
              </div>

              <div>
                <Label>Paragraph 3 {activeLanguage === 'en' ? '(EN)' : '(CS)'}</Label>
                <Textarea
                  value={activeLanguage === 'en' ? content.aboutParagraph3 : content.aboutParagraph3Cs}
                  onChange={(e) => updateField(activeLanguage === 'en' ? 'aboutParagraph3' : 'aboutParagraph3Cs', e.target.value)}
                  placeholder="I also combine 3D printing..."
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>About Highlights</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Education */}
              <div className="space-y-4 p-4 border rounded-lg">
                <h4 className="font-semibold">Education Highlight</h4>
                <div>
                  <Label>Title {activeLanguage === 'en' ? '(EN)' : '(CS)'}</Label>
                  <Input
                    value={activeLanguage === 'en' ? content.educationTitle : content.educationTitleCs}
                    onChange={(e) => updateField(activeLanguage === 'en' ? 'educationTitle' : 'educationTitleCs', e.target.value)}
                    placeholder="Education"
                  />
                </div>
                <div>
                  <Label>Description {activeLanguage === 'en' ? '(EN)' : '(CS)'}</Label>
                  <Textarea
                    value={activeLanguage === 'en' ? content.educationDescription : content.educationDescriptionCs}
                    onChange={(e) => updateField(activeLanguage === 'en' ? 'educationDescription' : 'educationDescriptionCs', e.target.value)}
                    placeholder="16-year-old student studying..."
                    rows={2}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Link Type</Label>
                  <Select
                    value={content.educationType}
                    onValueChange={(value) => updateField('educationType', value as any)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select type..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="achievement">Úspěch / Achievement</SelectItem>
                      <SelectItem value="project">Projekt / Project</SelectItem>
                      <SelectItem value="external">Externí odkaz / External Link</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label>Select Item or URL</Label>
                  {content.educationType === 'achievement' && (
                    <Select
                      value={content.educationId}
                      onValueChange={(value) => updateField('educationId', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Vyberte úspěch / Select achievement..." />
                      </SelectTrigger>
                      <SelectContent>
                        {achievements.map((achievement) => (
                          <SelectItem key={achievement.id} value={achievement.id}>
                            {activeLanguage === 'en' ? achievement.title : achievement.titleCs}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                  {content.educationType === 'project' && (
                    <Select
                      value={content.educationId}
                      onValueChange={(value) => updateField('educationId', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Vyberte projekt / Select project..." />
                      </SelectTrigger>
                      <SelectContent>
                        {projects.map((project) => (
                          <SelectItem key={project.id} value={project.id}>
                            {activeLanguage === 'en' ? project.title : project.titleCs}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                  {content.educationType === 'external' && (
                    <Input
                      value={content.educationId}
                      onChange={(e) => updateField('educationId', e.target.value)}
                      placeholder="https://example.com"
                    />
                  )}
                </div>
              </div>

              {/* Contest */}
              <div className="space-y-4 p-4 border rounded-lg">
                <h4 className="font-semibold">Contest Highlight</h4>
                <div>
                  <Label>Title {activeLanguage === 'en' ? '(EN)' : '(CS)'}</Label>
                  <Input
                    value={activeLanguage === 'en' ? content.contestTitle : content.contestTitleCs}
                    onChange={(e) => updateField(activeLanguage === 'en' ? 'contestTitle' : 'contestTitleCs', e.target.value)}
                    placeholder="Contest Winner"
                  />
                </div>
                <div>
                  <Label>Description {activeLanguage === 'en' ? '(EN)' : '(CS)'}</Label>
                  <Textarea
                    value={activeLanguage === 'en' ? content.contestDescription : content.contestDescriptionCs}
                    onChange={(e) => updateField(activeLanguage === 'en' ? 'contestDescription' : 'contestDescriptionCs', e.target.value)}
                    placeholder="Won a competition..."
                    rows={3}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Link Type</Label>
                  <Select
                    value={content.contestType}
                    onValueChange={(value) => updateField('contestType', value as any)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select type..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="achievement">Úspěch / Achievement</SelectItem>
                      <SelectItem value="project">Projekt / Project</SelectItem>
                      <SelectItem value="external">Externí odkaz / External Link</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label>Select Item or URL</Label>
                  {content.contestType === 'achievement' && (
                    <Select
                      value={content.contestId}
                      onValueChange={(value) => updateField('contestId', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Vyberte úspěch / Select achievement..." />
                      </SelectTrigger>
                      <SelectContent>
                        {achievements.map((achievement) => (
                          <SelectItem key={achievement.id} value={achievement.id}>
                            {activeLanguage === 'en' ? achievement.title : achievement.titleCs}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                  {content.contestType === 'project' && (
                    <Select
                      value={content.contestId}
                      onValueChange={(value) => updateField('contestId', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Vyberte projekt / Select project..." />
                      </SelectTrigger>
                      <SelectContent>
                        {projects.map((project) => (
                          <SelectItem key={project.id} value={project.id}>
                            {activeLanguage === 'en' ? project.title : project.titleCs}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                  {content.contestType === 'external' && (
                    <Input
                      value={content.contestId}
                      onChange={(e) => updateField('contestId', e.target.value)}
                      placeholder="https://example.com"
                    />
                  )}
                </div>
              </div>

              {/* Certifications */}
              <div className="space-y-4 p-4 border rounded-lg">
                <h4 className="font-semibold">Certifications Highlight</h4>
                <div>
                  <Label>Title {activeLanguage === 'en' ? '(EN)' : '(CS)'}</Label>
                  <Input
                    value={activeLanguage === 'en' ? content.certificationsTitle : content.certificationsTitleCs}
                    onChange={(e) => updateField(activeLanguage === 'en' ? 'certificationsTitle' : 'certificationsTitleCs', e.target.value)}
                    placeholder="Certifications"
                  />
                </div>
                <div>
                  <Label>Description {activeLanguage === 'en' ? '(EN)' : '(CS)'}</Label>
                  <Textarea
                    value={activeLanguage === 'en' ? content.certificationsDescription : content.certificationsDescriptionCs}
                    onChange={(e) => updateField(activeLanguage === 'en' ? 'certificationsDescription' : 'certificationsDescriptionCs', e.target.value)}
                    placeholder="Earned professional certifications..."
                    rows={2}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Link Type</Label>
                  <Select
                    value={content.certificationsType}
                    onValueChange={(value) => updateField('certificationsType', value as any)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select type..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="achievement">Úspěch / Achievement</SelectItem>
                      <SelectItem value="project">Projekt / Project</SelectItem>
                      <SelectItem value="external">Externí odkaz / External Link</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label>Select Item or URL</Label>
                  {content.certificationsType === 'achievement' && (
                    <Select
                      value={content.certificationsId}
                      onValueChange={(value) => updateField('certificationsId', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Vyberte úspěch / Select achievement..." />
                      </SelectTrigger>
                      <SelectContent>
                        {achievements.map((achievement) => (
                          <SelectItem key={achievement.id} value={achievement.id}>
                            {activeLanguage === 'en' ? achievement.title : achievement.titleCs}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                  {content.certificationsType === 'project' && (
                    <Select
                      value={content.certificationsId}
                      onValueChange={(value) => updateField('certificationsId', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Vyberte projekt / Select project..." />
                      </SelectTrigger>
                      <SelectContent>
                        {projects.map((project) => (
                          <SelectItem key={project.id} value={project.id}>
                            {activeLanguage === 'en' ? project.title : project.titleCs}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                  {content.certificationsType === 'external' && (
                    <Input
                      value={content.certificationsId}
                      onChange={(e) => updateField('certificationsId', e.target.value)}
                      placeholder="https://example.com"
                    />
                  )}
                </div>
              </div>

              {/* About Image */}
              <div className="pt-4 border-t space-y-2">
                <Label>About Me Image (Profile/Hero Image)</Label>
                {content.aboutImageUrl ? (
                  <div className="relative group">
                    <img src={content.aboutImageUrl} alt="About" className="w-full max-w-md h-64 object-cover rounded-lg border" />
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => handleRemoveImage('aboutImagePath', 'aboutImageUrl')}
                    >
                      <X className="h-4 w-4 mr-1" />
                      Remove Image
                    </Button>
                  </div>
                ) : (
                  <div>
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleUploadImage(e, 'aboutImagePath', 'aboutImageUrl')}
                      disabled={uploadingImage}
                      className="hidden"
                      id="about-image"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => document.getElementById('about-image')?.click()}
                      disabled={uploadingImage}
                      className="w-full max-w-md"
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      {uploadingImage ? 'Uploading...' : 'Upload About Image'}
                    </Button>
                    <p className="text-xs text-muted-foreground mt-1">
                      This image will be displayed in the About section
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Projects Section */}
        <TabsContent value="projects" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Projects Section</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Title {activeLanguage === 'en' ? '(EN)' : '(CS)'}</Label>
                <Input
                  value={activeLanguage === 'en' ? content.projectsTitle : content.projectsTitleCs}
                  onChange={(e) => updateField(activeLanguage === 'en' ? 'projectsTitle' : 'projectsTitleCs', e.target.value)}
                  placeholder="Featured Projects"
                />
              </div>

              <div>
                <Label>Subtitle {activeLanguage === 'en' ? '(EN)' : '(CS)'}</Label>
                <Textarea
                  value={activeLanguage === 'en' ? content.projectsSubtitle : content.projectsSubtitleCs}
                  onChange={(e) => updateField(activeLanguage === 'en' ? 'projectsSubtitle' : 'projectsSubtitleCs', e.target.value)}
                  placeholder="A selection of my best..."
                  rows={2}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>View All Button {activeLanguage === 'en' ? '(EN)' : '(CS)'}</Label>
                  <Input
                    value={activeLanguage === 'en' ? content.projectsViewAll : content.projectsViewAllCs}
                    onChange={(e) => updateField(activeLanguage === 'en' ? 'projectsViewAll' : 'projectsViewAllCs', e.target.value)}
                    placeholder="View All Projects"
                  />
                </div>
                <div>
                  <Label>View Details Button {activeLanguage === 'en' ? '(EN)' : '(CS)'}</Label>
                  <Input
                    value={activeLanguage === 'en' ? content.projectsViewDetails : content.projectsViewDetailsCs}
                    onChange={(e) => updateField(activeLanguage === 'en' ? 'projectsViewDetails' : 'projectsViewDetailsCs', e.target.value)}
                    placeholder="View Details"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Testimonials Section */}
        <TabsContent value="testimonials" className="space-y-4">\n          <Card>\n            <CardHeader>\n              <CardTitle>Testimonials Section</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Title {activeLanguage === 'en' ? '(EN)' : '(CS)'}</Label>
                <Input
                  value={activeLanguage === 'en' ? content.testimonialsTitle : content.testimonialsTitleCs}
                  onChange={(e) => updateField(activeLanguage === 'en' ? 'testimonialsTitle' : 'testimonialsTitleCs', e.target.value)}
                  placeholder="Client Testimonials"
                />
              </div>

              <div>
                <Label>Subtitle {activeLanguage === 'en' ? '(EN)' : '(CS)'}</Label>
                <Textarea
                  value={activeLanguage === 'en' ? content.testimonialsSubtitle : content.testimonialsSubtitleCs}
                  onChange={(e) => updateField(activeLanguage === 'en' ? 'testimonialsSubtitle' : 'testimonialsSubtitleCs', e.target.value)}
                  placeholder="What people say about..."
                  rows={2}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Contact Section */}
        <TabsContent value="contact" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Contact Section</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Title {activeLanguage === 'en' ? '(EN)' : '(CS)'}</Label>
                <Input
                  value={activeLanguage === 'en' ? content.contactTitle : content.contactTitleCs}
                  onChange={(e) => updateField(activeLanguage === 'en' ? 'contactTitle' : 'contactTitleCs', e.target.value)}
                  placeholder="Get In Touch"
                />
              </div>

              <div>
                <Label>Subtitle {activeLanguage === 'en' ? '(EN)' : '(CS)'}</Label>
                <Textarea
                  value={activeLanguage === 'en' ? content.contactSubtitle : content.contactSubtitleCs}
                  onChange={(e) => updateField(activeLanguage === 'en' ? 'contactSubtitle' : 'contactSubtitleCs', e.target.value)}
                  placeholder="Do you have a project..."
                  rows={2}
                />
              </div>

              {/* My Contact Information */}
              <div className="bg-muted/50 border border-dashed rounded-lg p-4 space-y-4">
                <h3 className="font-medium text-sm">Your Contact Information</h3>
                <div>
                  <Label>Your Email</Label>
                  <Input
                    type="email"
                    value={content.contactEmail}
                    onChange={(e) => updateField('contactEmail', e.target.value)}
                    placeholder="your@email.com"
                  />
                </div>
                <div>
                  <Label>Your Phone</Label>
                  <Input
                    type="tel"
                    value={content.contactPhone}
                    onChange={(e) => updateField('contactPhone', e.target.value)}
                    placeholder="+420 123 456 789"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Your Location (EN)</Label>
                    <Input
                      value={content.contactLocation}
                      onChange={(e) => updateField('contactLocation', e.target.value)}
                      placeholder="Prague, Czech Republic"
                    />
                  </div>
                  <div>
                    <Label>Your Location (CS)</Label>
                    <Input
                      value={content.contactLocationCs}
                      onChange={(e) => updateField('contactLocationCs', e.target.value)}
                      placeholder="Praha, Česká republika"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Name Label {activeLanguage === 'en' ? '(EN)' : '(CS)'}</Label>
                  <Input
                    value={activeLanguage === 'en' ? content.contactNameLabel : content.contactNameLabelCs}
                    onChange={(e) => updateField(activeLanguage === 'en' ? 'contactNameLabel' : 'contactNameLabelCs', e.target.value)}
                    placeholder="Name"
                  />
                </div>
                <div>
                  <Label>Name Placeholder {activeLanguage === 'en' ? '(EN)' : '(CS)'}</Label>
                  <Input
                    value={activeLanguage === 'en' ? content.contactNamePlaceholder : content.contactNamePlaceholderCs}
                    onChange={(e) => updateField(activeLanguage === 'en' ? 'contactNamePlaceholder' : 'contactNamePlaceholderCs', e.target.value)}
                    placeholder="Your name"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Email Label {activeLanguage === 'en' ? '(EN)' : '(CS)'}</Label>
                  <Input
                    value={activeLanguage === 'en' ? content.contactEmailLabel : content.contactEmailLabelCs}
                    onChange={(e) => updateField(activeLanguage === 'en' ? 'contactEmailLabel' : 'contactEmailLabelCs', e.target.value)}
                    placeholder="Email"
                  />
                </div>
                <div>
                  <Label>Email Placeholder {activeLanguage === 'en' ? '(EN)' : '(CS)'}</Label>
                  <Input
                    value={activeLanguage === 'en' ? content.contactEmailPlaceholder : content.contactEmailPlaceholderCs}
                    onChange={(e) => updateField(activeLanguage === 'en' ? 'contactEmailPlaceholder' : 'contactEmailPlaceholderCs', e.target.value)}
                    placeholder="your.email@example.com"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Message Label {activeLanguage === 'en' ? '(EN)' : '(CS)'}</Label>
                  <Input
                    value={activeLanguage === 'en' ? content.contactMessageLabel : content.contactMessageLabelCs}
                    onChange={(e) => updateField(activeLanguage === 'en' ? 'contactMessageLabel' : 'contactMessageLabelCs', e.target.value)}
                    placeholder="Message"
                  />
                </div>
                <div>
                  <Label>Message Placeholder {activeLanguage === 'en' ? '(EN)' : '(CS)'}</Label>
                  <Input
                    value={activeLanguage === 'en' ? content.contactMessagePlaceholder : content.contactMessagePlaceholderCs}
                    onChange={(e) => updateField(activeLanguage === 'en' ? 'contactMessagePlaceholder' : 'contactMessagePlaceholderCs', e.target.value)}
                    placeholder="Write me a message..."
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label>Send Button {activeLanguage === 'en' ? '(EN)' : '(CS)'}</Label>
                  <Input
                    value={activeLanguage === 'en' ? content.contactSend : content.contactSendCs}
                    onChange={(e) => updateField(activeLanguage === 'en' ? 'contactSend' : 'contactSendCs', e.target.value)}
                    placeholder="Send Message"
                  />
                </div>
                <div>
                  <Label>Sending... {activeLanguage === 'en' ? '(EN)' : '(CS)'}</Label>
                  <Input
                    value={activeLanguage === 'en' ? content.contactSending : content.contactSendingCs}
                    onChange={(e) => updateField(activeLanguage === 'en' ? 'contactSending' : 'contactSendingCs', e.target.value)}
                    placeholder="Sending..."
                  />
                </div>
                <div>
                  <Label>Success Message {activeLanguage === 'en' ? '(EN)' : '(CS)'}</Label>
                  <Input
                    value={activeLanguage === 'en' ? content.contactSuccess : content.contactSuccessCs}
                    onChange={(e) => updateField(activeLanguage === 'en' ? 'contactSuccess' : 'contactSuccessCs', e.target.value)}
                    placeholder="Message sent successfully!"
                  />
                </div>
              </div>

              {/* Social Media Links */}
              <div className="space-y-4 pt-4 border-t">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base font-semibold">Social Media Links</Label>
                    <p className="text-sm text-muted-foreground">Add your social media profiles to display in the footer</p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const newLinks = [...(content.socialLinks || []), {
                        label: '',
                        url: '',
                        icon: 'link',
                        customIconUrl: ''
                      }];
                      updateField('socialLinks', newLinks);
                    }}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Social Link
                  </Button>
                </div>

                <div className="space-y-3">
                  {(content.socialLinks || []).map((link, idx) => (
                    <Card key={idx}>
                      <CardContent className="pt-4 space-y-3">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium">Link {idx + 1}</span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              const newLinks = content.socialLinks?.filter((_, i) => i !== idx);
                              updateField('socialLinks', newLinks);
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <Label className="text-xs">Label (e.g., LinkedIn)</Label>
                            <Input
                              value={link.label}
                              onChange={(e) => {
                                const newLinks = [...(content.socialLinks || [])];
                                newLinks[idx] = { ...newLinks[idx], label: e.target.value };
                                updateField('socialLinks', newLinks);
                              }}
                              placeholder="LinkedIn"
                            />
                          </div>
                          <div>
                            <Label className="text-xs">URL</Label>
                            <Input
                              value={link.url}
                              onChange={(e) => {
                                const newLinks = [...(content.socialLinks || [])];
                                newLinks[idx] = { ...newLinks[idx], url: e.target.value };
                                updateField('socialLinks', newLinks);
                              }}
                              placeholder="https://linkedin.com/in/..."
                            />
                          </div>
                        </div>

                        <div>
                          <Label className="text-xs">Icon (select from library or upload custom)</Label>
                          <Select
                            value={link.icon}
                            onValueChange={(value) => {
                              const newLinks = [...(content.socialLinks || [])];
                              newLinks[idx] = { ...newLinks[idx], icon: value };
                              updateField('socialLinks', newLinks);
                            }}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select icon" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="linkedin">LinkedIn</SelectItem>
                              <SelectItem value="github">GitHub</SelectItem>
                              <SelectItem value="twitter">Twitter/X</SelectItem>
                              <SelectItem value="facebook">Facebook</SelectItem>
                              <SelectItem value="instagram">Instagram</SelectItem>
                              <SelectItem value="youtube">YouTube</SelectItem>
                              <SelectItem value="tiktok">TikTok</SelectItem>
                              <SelectItem value="patreon">Patreon</SelectItem>
                              <SelectItem value="dribbble">Dribbble</SelectItem>
                              <SelectItem value="pinterest">Pinterest</SelectItem>
                              <SelectItem value="mail">Email</SelectItem>
                              <SelectItem value="link">Generic Link</SelectItem>
                              <SelectItem value="custom">Custom Icon (upload)</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        {link.icon === 'custom' && (
                          <div>
                            <Label className="text-xs">Custom Icon URL (or upload)</Label>
                            <div className="flex gap-2">
                              <Input
                                value={link.customIconUrl || ''}
                                onChange={(e) => {
                                  const newLinks = [...(content.socialLinks || [])];
                                  newLinks[idx] = { ...newLinks[idx], customIconUrl: e.target.value };
                                  updateField('socialLinks', newLinks);
                                }}
                                placeholder="https://... or upload below"
                              />
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  // TODO: Implement icon upload
                                  toast.info('Icon upload coming soon! For now, paste an image URL.');
                                }}
                              >
                                <Upload className="h-4 w-4" />
                              </Button>
                            </div>
                            {link.customIconUrl && (
                              <div className="mt-2 p-2 border rounded flex items-center gap-2">
                                <img src={link.customIconUrl} alt="Custom icon" className="w-6 h-6 object-contain" />
                                <span className="text-xs text-muted-foreground">Preview</span>
                              </div>
                            )}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}

                  {(!content.socialLinks || content.socialLinks.length === 0) && (
                    <p className="text-sm text-muted-foreground text-center py-8 border-2 border-dashed rounded-lg">
                      No social links added yet. Click "Add Social Link" to add your social media profiles.
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Footer Section */}
        <TabsContent value="footer" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Footer Section</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Tagline {activeLanguage === 'en' ? '(EN)' : '(CS)'}</Label>
                <Input
                  value={activeLanguage === 'en' ? content.footerTagline : content.footerTaglineCs}
                  onChange={(e) => updateField(activeLanguage === 'en' ? 'footerTagline' : 'footerTaglineCs', e.target.value)}
                  placeholder="3D Modeling & CAD Design Portfolio"
                />
              </div>

              <div>
                <Label>Description {activeLanguage === 'en' ? '(EN)' : '(CS)'}</Label>
                <Textarea
                  value={activeLanguage === 'en' ? content.footerDescription : content.footerDescriptionCs}
                  onChange={(e) => updateField(activeLanguage === 'en' ? 'footerDescription' : 'footerDescriptionCs', e.target.value)}
                  placeholder="Specialized in mechanical design..."
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Sticky Save Button */}
      <div className="sticky bottom-4 flex justify-end gap-2 bg-background/80 backdrop-blur-sm p-4 rounded-lg border shadow-lg">
        <Button 
          variant="outline" 
          onClick={() => loadDropdownData(true)}
          disabled={refreshingDropdowns}
          title="Refresh projects, testimonials and achievements lists"
          size="lg"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${refreshingDropdowns ? 'animate-spin' : ''}`} />
          {refreshingDropdowns ? 'Refreshing...' : 'Refresh Lists'}
        </Button>
        <Button variant="outline" onClick={handleReset} size="lg">
          <RotateCcw className="h-4 w-4 mr-2" />
          Reset Changes
        </Button>
        <Button onClick={handleSave} disabled={saving} size="lg">
          <Save className="h-4 w-4 mr-2" />
          {saving ? 'Saving...' : 'Save All Changes'}
        </Button>
      </div>
    </div>
  );
}