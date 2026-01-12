import { useState, useEffect } from "react";
import { Mail, MapPin, Phone, Send } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Card, CardContent } from "./ui/card";
import { toast } from "sonner@2.0.3";
import { Language, translations } from "../translations";
import emailjs from "@emailjs/browser";
import { projectId, publicAnonKey } from '../utils/supabase/info';

interface ContactProps {
  language: Language;
}

export function Contact({ language }: ContactProps) {
  const t = translations[language].contact;
  const [contactData, setContactData] = useState<{
    email: string;
    phone: string;
    location: string;
    locationCs: string;
  }>({
    email: "projekty@filip-eckstein.cz",
    phone: "+420 725 633 154",
    location: "Prague, CZ",
    locationCs: "Praha, CZ",
  });
  const [contactContent, setContactContent] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadContactData();
  }, []);

  const loadContactData = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-635fd90e/content`,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        if (data.content) {
          setContactContent(data.content);
          if (data.content.contactEmail) {
            setContactData({
              email: data.content.contactEmail,
              phone: data.content.contactPhone || "+420 725 633 154",
              location: data.content.contactLocation || "Prague, CZ",
              locationCs: data.content.contactLocationCs || "Praha, CZ",
            });
          }
        }
      }
    } catch (error) {
      console.error('Failed to load contact data:', error);
    }
  };

  // Use content from database if available, otherwise fallback to translations
  const title = language === 'cs'
    ? (contactContent?.contactTitleCs || t.title)
    : (contactContent?.contactTitle || t.title);
    
  const subtitle = language === 'cs'
    ? (contactContent?.contactSubtitleCs || t.subtitle)
    : (contactContent?.contactSubtitle || t.subtitle);
    
  const nameLabel = language === 'cs'
    ? (contactContent?.contactNameLabelCs || t.nameLabel)
    : (contactContent?.contactNameLabel || t.nameLabel);
    
  const namePlaceholder = language === 'cs'
    ? (contactContent?.contactNamePlaceholderCs || t.namePlaceholder)
    : (contactContent?.contactNamePlaceholder || t.namePlaceholder);
    
  const emailLabel = language === 'cs'
    ? (contactContent?.contactEmailLabelCs || t.emailLabel)
    : (contactContent?.contactEmailLabel || t.emailLabel);
    
  const emailPlaceholder = language === 'cs'
    ? (contactContent?.contactEmailPlaceholderCs || t.emailPlaceholder)
    : (contactContent?.contactEmailPlaceholder || t.emailPlaceholder);
    
  const messageLabel = language === 'cs'
    ? (contactContent?.contactMessageLabelCs || t.messageLabel)
    : (contactContent?.contactMessageLabel || t.messageLabel);
    
  const messagePlaceholder = language === 'cs'
    ? (contactContent?.contactMessagePlaceholderCs || t.messagePlaceholder)
    : (contactContent?.contactMessagePlaceholder || t.messagePlaceholder);
    
  const sendText = language === 'cs'
    ? (contactContent?.contactSendCs || t.send)
    : (contactContent?.contactSend || t.send);
    
  const sendingText = language === 'cs'
    ? (contactContent?.contactSendingCs || t.sending)
    : (contactContent?.contactSending || t.sending);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // EmailJS odeslání
      await emailjs.send(
        "service_7qj7oj1",
        "template_yh2lbig",
        {
          name: formData.name,
          email: formData.email,
          message: formData.message,
        },
        "Z0gXebwHu4N3tj0ZG"
      );

      toast.success(
        language === "en"
          ? "Message sent successfully! I'll get back to you soon."
          : "Zpráva úspěšně odeslána! Brzy se Ti ozvu."
      );

      setFormData({ name: "", email: "", message: "" });
    } catch (error: any) {
      toast.error(
        language === "en"
          ? "Failed to send message. Please email me directly at projekty@filip-eckstein.cz"
          : "Nepodařilo se odeslat zprávu. Napište mi prosím přímo na projekty@filip-eckstein.cz"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const contactInfo = [
    {
      icon: Mail,
      label: t.emailLabel,
      value: contactData.email,
      href: `mailto:${contactData.email}`,
    },
    {
      icon: Phone,
      label: t.phoneLabel,
      value: contactData.phone,
      href: `tel:${contactData.phone.replace(/\s/g, "")}`,
    },
    {
      icon: MapPin,
      label: t.locationLabel,
      value: language === 'en' 
        ? contactData.location
        : contactData.locationCs,
      href: null,
    },
  ];

  return (
    <section id="contact" className="py-20">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-center mb-4 text-foreground">{title}</h2>
          <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
            {subtitle}
          </p>

          <div className="grid md:grid-cols-2 gap-12">
            {/* Kontaktní informace */}
            <div>
              <h3 className="mb-6 text-foreground">{t.contactInformation}</h3>
              <div className="space-y-4">
                {contactInfo.map((info, index) => (
                  <Card key={index}>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <info.icon className="h-5 w-5 text-primary" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm text-muted-foreground">{info.label}</p>
                          {info.href ? (
                            <a
                              href={info.href}
                              className="text-foreground hover:text-primary transition-colors"
                            >
                              {info.value}
                            </a>
                          ) : (
                            <p className="text-foreground">{info.value}</p>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Kontaktní formulář */}
            <div>
              <Card>
                <CardContent className="p-6">
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label htmlFor="name" className="block text-sm mb-2 text-foreground">
                        {nameLabel}
                      </label>
                      <Input
                        id="name"
                        placeholder={namePlaceholder}
                        value={formData.name}
                        onChange={(e) =>
                          setFormData({ ...formData, name: e.target.value })
                        }
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="email" className="block text-sm mb-2 text-foreground">
                        {emailLabel}
                      </label>
                      <Input
                        id="email"
                        type="email"
                        placeholder={emailPlaceholder}
                        value={formData.email}
                        onChange={(e) =>
                          setFormData({ ...formData, email: e.target.value })
                        }
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="message" className="block text-sm mb-2 text-foreground">
                        {messageLabel}
                      </label>
                      <Textarea
                        id="message"
                        placeholder={messagePlaceholder}
                        rows={5}
                        value={formData.message}
                        onChange={(e) =>
                          setFormData({ ...formData, message: e.target.value })
                        }
                        required
                      />
                    </div>
                    <Button type="submit" className="w-full" disabled={isSubmitting}>
                      <Send className="h-4 w-4 mr-2" />
                      {isSubmitting
                        ? sendingText
                        : sendText
                      }
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}