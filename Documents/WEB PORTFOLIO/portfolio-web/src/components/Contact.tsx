import { useState } from "react";
import { Mail, MapPin, Phone, Send } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Card, CardContent } from "./ui/card";
import { toast } from "sonner@2.0.3";
import { Language, translations } from "../translations";
import { useRemoteContent } from "../hooks/useRemoteContent";
import emailjs from "@emailjs/browser";

interface ContactProps {
  language: Language;
}

export function Contact({ language }: ContactProps) {
  const localT = translations[language].contact;
  const { content, t } = useRemoteContent(language);

  const [formData, setFormData] = useState({ name: "", email: "", message: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Translations with fallback to local translations
  const title = t('contactTitle', localT.title);
  const subtitle = t('contactSubtitle', localT.subtitle);
  const nameLabel = t('contactNameLabel', localT.nameLabel);
  const namePlaceholder = t('contactNamePlaceholder', localT.namePlaceholder);
  const emailLabel = t('contactEmailLabel', localT.emailLabel);
  const emailPlaceholder = t('contactEmailPlaceholder', localT.emailPlaceholder);
  const messageLabel = t('contactMessageLabel', localT.messageLabel);
  const messagePlaceholder = t('contactMessagePlaceholder', localT.messagePlaceholder);
  const sendText = t('contactSend', localT.send);
  const sendingText = t('contactSending', localT.sending);

  // Contact Info Data
  const contactEmail = content?.contactEmail || "projekty@filip-eckstein.cz";
  const contactPhone = content?.contactPhone || "+420 725 633 154";
  const contactLocation = language === 'en' 
    ? (content?.contactLocation || localT.locationLabel)
    : (content?.contactLocationCs || "Praha, CZ");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await emailjs.send("service_7qj7oj1", "template_yh2lbig", {
        name: formData.name, email: formData.email, message: formData.message,
      }, "Z0gXebwHu4N3tj0ZG");

      toast.success(language === "en" 
        ? "Message sent successfully! I'll get back to you soon." 
        : "Zpráva úspěšně odeslána! Brzy se Ti ozvu.");
      setFormData({ name: "", email: "", message: "" });
    } catch {
      toast.error(language === "en" 
        ? "Failed to send message. Please email me directly." 
        : "Nepodařilo se odeslat zprávu. Napište mi prosím přímo.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const contactInfo = [
    { icon: Mail, label: localT.emailLabel, value: contactEmail, href: `mailto:${contactEmail}` },
    { icon: Phone, label: localT.phoneLabel, value: contactPhone, href: `tel:${contactPhone.replace(/\s/g, "")}` },
    { icon: MapPin, label: localT.locationLabel, value: contactLocation, href: null },
  ];

  return (
    <section id="contact" className="py-20">
      <div className="container mx-auto px-4 max-w-6xl">
        <h2 className="text-center mb-4 text-foreground reveal reveal-up">{title}</h2>
        <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto reveal reveal-up delay-150">{subtitle}</p>

        <div className="grid md:grid-cols-2 gap-12">
          <div className="reveal reveal-left delay-200">
            <h3 className="mb-6 text-foreground">{localT.contactInformation}</h3>
            <div className="space-y-4">
              {contactInfo.map((info, i) => (
                <Card key={i}>
                  <CardContent className="p-4 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <info.icon className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-muted-foreground">{info.label}</p>
                      {info.href ? (
                        <a href={info.href} className="text-foreground hover:text-primary transition-colors">{info.value}</a>
                      ) : (
                        <p className="text-foreground">{info.value}</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          <div className="reveal reveal-right delay-300">
            <Card><CardContent className="p-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                {[{id:"name", label:nameLabel, ph:namePlaceholder, type:"text"}, {id:"email", label:emailLabel, ph:emailPlaceholder, type:"email"}].map(field => (
                  <div key={field.id}>
                    <label htmlFor={field.id} className="block text-sm mb-2 text-foreground">{field.label}</label>
                    <Input id={field.id} type={field.type} placeholder={field.ph} required value={(formData as any)[field.id]} onChange={e => setFormData({...formData, [field.id]: e.target.value})} />
                  </div>
                ))}
                <div>
                  <label htmlFor="message" className="block text-sm mb-2 text-foreground">{messageLabel}</label>
                  <Textarea id="message" placeholder={messagePlaceholder} rows={5} required value={formData.message} onChange={e => setFormData({...formData, message: e.target.value})} />
                </div>
                <Button type="submit" variant="default" className="w-full dark:bg-secondary dark:text-secondary-foreground dark:hover:bg-secondary/80" disabled={isSubmitting}>
                  <Send className="h-4 w-4 mr-2" /> {isSubmitting ? sendingText : sendText}
                </Button>
              </form>
            </CardContent></Card>
          </div>
        </div>
      </div>
    </section>
  );
}