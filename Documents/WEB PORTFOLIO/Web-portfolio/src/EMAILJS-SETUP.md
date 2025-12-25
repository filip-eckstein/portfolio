# 📧 EmailJS Setup - Návod na nastavení kontaktního formuláře

## Co je EmailJS?

EmailJS je bezplatná služba, která umožňuje odesílat emaily přímo z vašeho webu bez backend serveru. Ideální pro kontaktní formuláře na statických webech.

---

## 🚀 Rychlý start (5 minut)

### **Krok 1: Vytvoření EmailJS účtu**

1. Jděte na **https://www.emailjs.com/**
2. Klikněte na **"Sign Up"** (vpravo nahoře)
3. Vytvořte účet pomocí Google, GitHub nebo emailu
4. Přihlaste se do dashboardu

---

### **Krok 2: Připojení vašeho emailu**

1. V dashboardu najděte **"Email Services"** (levé menu)
2. Klikněte **"Add New Service"**
3. Vyberte vašeho poskytovatele:

#### **Pro Gmail:**
   - Vyberte **"Gmail"**
   - Klikněte **"Connect Account"**
   - Přihlaste se svým Google účtem
   - Povolte EmailJS přístup
   - Service bude automaticky vytvořen

#### **Pro jiné poskytovatele:**
   - Vyberte např. Outlook, Yahoo, nebo "Other"
   - Vyplňte SMTP údaje
   
4. **DŮLEŽITÉ:** Zkopírujte si **Service ID** (např. `service_abc123`)

---

### **Krok 3: Vytvoření Email Template**

1. V levém menu klikněte na **"Email Templates"**
2. Klikněte **"Create New Template"**
3. Nastavte template takto:

**Template Settings:**

```
Template Name: Portfolio Contact Form
```

**Template Content:**

```
Subject: 
Nová zpráva z portfolia od {{from_name}}

Content (Body):
===================================
NOVÁ ZPRÁVA Z PORTFOLIA
===================================

Od: {{from_name}}
Email: {{from_email}}

Zpráva:
{{message}}

---
Automaticky odesláno z portfolia
filip-eckstein.cz
```

**Settings:**
- **To Email:** `{{to_email}}` ← DŮLEŽITÉ: musí být jako proměnná!
- **From Name:** `{{from_name}}`
- **Reply To:** `{{from_email}}`

4. Klikněte **"Save"**
5. Zkopírujte si **Template ID** (např. `template_xyz789`)

---

### **Krok 4: Získání Public Key**

1. V levém menu klikněte na **"Account"** → **"General"**
2. Najděte sekci **"Public Key"**
3. Zkopírujte klíč (např. `aBcDeFgHiJkLmNoPqR`)

---

### **Krok 5: Nastavení v projektu**

#### **Varianta A: Pro lokální development**

1. V root složce projektu vytvořte soubor `.env`:

```bash
# .env (neverzujte do Git!)
VITE_EMAILJS_SERVICE_ID=service_abc123
VITE_EMAILJS_TEMPLATE_ID=template_xyz789
VITE_EMAILJS_PUBLIC_KEY=aBcDeFgHiJkLmNoPqR
```

2. Přidejte `.env` do `.gitignore`:

```
# .gitignore
.env
.env.local
```

3. Zkopírujte `.env.example` a vyplňte své hodnoty

#### **Varianta B: Pro produkci na NAS**

Na vašem NAS serveru vytvořte `.env` soubor přímo ve složce webu:

```bash
cd /var/www/portfolio
nano .env
```

Vložte:

```
VITE_EMAILJS_SERVICE_ID=service_abc123
VITE_EMAILJS_TEMPLATE_ID=template_xyz789
VITE_EMAILJS_PUBLIC_KEY=aBcDeFgHiJkLmNoPqR
```

---

## 🧪 Testování

### **Lokální testování:**

```bash
# 1. Spusťte dev server
npm run dev

# 2. Otevřete http://localhost:5173
# 3. Přejděte na Contact sekci
# 4. Vyplňte formulář a odešlete
# 5. Zkontrolujte email projekty@filip-eckstein.cz
```

### **Kontrola v EmailJS dashboardu:**

1. Jděte na **"Email History"**
2. Měli byste vidět odeslaný email
3. Zkontrolujte status (Success/Failed)

---

## 🔧 Řešení problémů

### ❌ "Failed to send message"

**Příčina:** Neplatné nebo chybějící API klíče

**Řešení:**
1. Zkontrolujte, že `.env` soubor existuje
2. Zkontrolujte názvy proměnných (musí začínat `VITE_`)
3. Restartujte dev server (`Ctrl+C` a znovu `npm run dev`)
4. Zkontrolujte v konzoli prohlížeče (F12) přesnou chybu

### ❌ "Service/Template not found"

**Příčina:** Špatné Service ID nebo Template ID

**Řešení:**
1. Přihlaste se na EmailJS dashboard
2. Zkontrolujte přesné ID v **Email Services** a **Email Templates**
3. Zkopírujte je znovu do `.env`

### ❌ Email nedorazil

**Příčina:** Špatná konfigurace template

**Řešení:**
1. V EmailJS dashboardu jděte na **Email Templates**
2. Editujte template
3. V **Settings** zkontrolujte:
   - **To Email:** `{{to_email}}`
   - **Reply To:** `{{from_email}}`
4. Otestujte template tlačítkem **"Test it"**

### ❌ Email jde do spamu

**Řešení:**
1. Označte email jako "Not spam"
2. Přidejte `no-reply@emailjs.com` do kontaktů
3. V Gmail vytvořte filtr pro `from:emailjs.com`

---

## 💰 Cenové limity

**Free plan:**
- ✅ 200 emailů/měsíc
- ✅ 2 email services
- ✅ 2 email templates
- ✅ Žádná kreditní karta potřeba

**Pro běžné portfolio:** Free plan zcela postačuje!

**Pokud potřebujete více:**
- Personal plan: $8/měsíc (1000 emailů)
- Pro plan: $25/měsíc (10000 emailů)

---

## 🔒 Bezpečnost

### **Co je veřejné:**
- ✅ Service ID
- ✅ Template ID  
- ✅ Public Key

### **Co NENÍ veřejné:**
- ❌ Váš email a heslo
- ❌ SMTP přihlašovací údaje
- ❌ Private Key (nepoužívá se ve frontendech)

**EmailJS Public Key je bezpečný** - je určen pro použití ve frontendech a má rate limiting.

---

## 📝 Alternativy k EmailJS

Pokud nechcete používat EmailJS:

### **1. Formspree** (https://formspree.io/)
- Ještě jednodušší setup
- 50 submissí/měsíc zdarma

### **2. Web3Forms** (https://web3forms.com/)
- Neomezené submise zdarma
- Bez registrace

### **3. Vlastní backend**
Na vašem NAS můžete nastavit:
- Node.js + Nodemailer
- PHP + PHPMailer
- Python + smtplib

---

## 📞 Podpora

Pokud máte problémy:

1. **EmailJS dokumentace:** https://www.emailjs.com/docs/
2. **EmailJS support:** support@emailjs.com
3. **Můj email:** projekty@filip-eckstein.cz

---

## ✅ Checklist

- [ ] Vytvořen EmailJS účet
- [ ] Připojen email service (Gmail)
- [ ] Vytvořen email template
- [ ] Zkopírován Service ID
- [ ] Zkopírován Template ID
- [ ] Zkopírován Public Key
- [ ] Vytvořen `.env` soubor
- [ ] Vyplněny hodnoty do `.env`
- [ ] Restartován dev server
- [ ] Odeslán testovací email
- [ ] Email dorazil na projekty@filip-eckstein.cz

---

**Pokud jste prošli všemi kroky, kontaktní formulář by měl fungovat! 🎉**
