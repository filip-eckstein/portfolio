# 🚀 Filip Eckstein - Portfolio Website

Profesionální portfolio webová stránka pro 3D modelování, CAD design a 3D tisk s moderním designem a kompletním česko-anglickým překladem.

---

## 📋 **Obsah:**

- [Funkce](#-funkce)
- [Technologie](#-technologie)
- [Jak stáhnout build](#-jak-stáhnout-build)
- [Deployment](#-deployment)
- [Admin systém](#-admin-systém)
- [Dokumentace](#-dokumentace)

---

## ✨ **Funkce:**

### **Frontend:**
- ✅ Responzivní design (desktop + mobile)
- ✅ Česko-anglický překlad (kompletní i18n)
- ✅ 3D model viewer (Google Model Viewer)
- ✅ Dynamické portfolio projekty s filtrováním
- ✅ Achievements page (soutěže + certifikace)
- ✅ Testimonials systém
- ✅ Kontaktní formulář (EmailJS)
- ✅ Smooth scroll a animace

### **Admin Dashboard:**
- ✅ Secure login s Supabase Auth
- ✅ Správa projektů (CRUD)
- ✅ Upload obrázků na Supabase Storage
- ✅ 3D model upload s preview
- ✅ Správa filtrů a kategorií
- ✅ Featured system (hvězdičky)
- ✅ Auto-translate tlačítka (DeepL API)
- ✅ Drag & drop řazení projektů
- ✅ Content editor (Hero, About Me)
- ✅ Achievements manager
- ✅ Testimonials manager

### **Backend:**
- ✅ Supabase Edge Functions
- ✅ Hono web server
- ✅ Key-value storage
- ✅ Image storage (Supabase Storage)
- ✅ DeepL API integrace
- ✅ Secure authentication

---

## 🛠️ **Technologie:**

| Kategorie | Technologie |
|-----------|-------------|
| **Frontend** | React 18, TypeScript, Tailwind CSS v4 |
| **Routing** | React Router v6 |
| **Backend** | Supabase (Edge Functions, Auth, Storage) |
| **Server** | Hono (Deno) |
| **3D Viewer** | Google Model Viewer |
| **Překladač** | DeepL API |
| **Email** | EmailJS |
| **Icons** | Lucide React |
| **Build** | Vite |
| **Deployment** | GitHub Pages, NAS server |

---

## 📥 **Jak stáhnout build:**

### **Varianta A: Figma Make (nejjednodušší)** ⭐

1. V Figma Make klikni na **"Download"** nebo **"Export"**
2. Stáhne se ZIP s kompletním buildem
3. Rozbal a nahraj na server

**✅ Hotovo!**

---

### **Varianta B: Lokální build**

**Krok 1: Stáhni projekt**
```bash
git clone https://github.com/tvuj-username/filip-eckstein-portfolio.git
cd filip-eckstein-portfolio
```

**Krok 2: Nainstaluj dependencies**
```bash
npm install
```

**Krok 3: Build projektu**

**Windows:**
```bash
# Dvojklik na soubor nebo:
build-and-download.bat
```

**macOS/Linux:**
```bash
chmod +x build-and-download.sh
./build-and-download.sh
```

**Vytvoří se:**
- ✅ `filip-eckstein-portfolio-[timestamp].zip`
- ✅ Obsahuje kompletní build ready k nahrání

---

## 🚀 **Deployment:**

### **GitHub Pages (doporučeno)**

```bash
# Automatický deploy (1 příkaz)
npm run deploy

# Nebo manuálně
npm run build
cp 404.html dist/404.html
echo "filip-eckstein.cz" > dist/CNAME
npx gh-pages -d dist
```

**GitHub Pages nastavení:**
1. Repo → Settings → Pages
2. Source: **gh-pages branch**
3. Custom domain: **filip-eckstein.cz**
4. Enforce HTTPS: ☑️

**✅ Web bude na: `https://filip-eckstein.cz`**

---

### **NAS Server**

**1. Nahraj build na NAS:**
```bash
# Přes SCP
scp -r dist/* user@nas-ip:/var/www/filip-eckstein/

# Nebo přes FTP (FileZilla, WinSCP)
```

**2. Nastav Nginx:**

Soubor: `/etc/nginx/sites-available/filip-eckstein.conf`

```nginx
server {
    listen 80;
    server_name filip-eckstein.cz www.filip-eckstein.cz;
    
    root /var/www/filip-eckstein;
    index index.html;

    # SPA routing - DŮLEŽITÉ!
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache pro assets
    location /assets/ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

**3. Restart Nginx:**
```bash
sudo nginx -t
sudo systemctl reload nginx
```

**✅ Web bude na: `http://filip-eckstein.cz`**

---

### **Netlify/Vercel**

```bash
# Netlify
netlify deploy --dir=dist

# Vercel
vercel --prod
```

**Nebo přetáhni `dist/` složku do jejich web rozhraní.**

**✅ Automaticky se nastaví routing!**

---

## 🔐 **Admin systém:**

### **Přístup:**
- URL: `https://filip-eckstein.cz/admin`
- Username: (nastavíš v Supabase)
- Password: (nastavíš v Supabase)

### **Funkce:**
- 📁 **Projects Manager** - CRUD operace, upload obrázků
- 🎯 **Filters Manager** - správa kategorií a filtrů
- 🏆 **Achievements Manager** - soutěže + certifikace
- 💬 **Testimonials Manager** - zákaznické reference
- ✏️ **Content Editor** - Hero sekce, About Me
- ⚙️ **Settings** - změna hesla, nastavení

### **Setup:**

Viz [ADMIN-SETUP.md](./ADMIN-SETUP.md) pro kompletní instrukce.

**Rychlý start:**
1. Vytvoř Supabase projekt
2. Zkopíruj env variables do `/utils/supabase/info.tsx`
3. Nastav DeepL API key (pro auto-translate)
4. První přihlášení vytvoří admin účet

---

## 📚 **Dokumentace:**

| Dokument | Popis |
|----------|-------|
| [JAK-STAHNOUT-BUILD.md](./JAK-STAHNOUT-BUILD.md) | **⭐ Jak stáhnout a nahrát build** |
| [BUILD-DOWNLOAD-INSTRUCTIONS.md](./BUILD-DOWNLOAD-INSTRUCTIONS.md) | Detailní build instrukce |
| [GITHUB-PAGES-SETUP.md](./GITHUB-PAGES-SETUP.md) | GitHub Pages deployment |
| [DEPLOYMENT-QUICK-FIX.md](./DEPLOYMENT-QUICK-FIX.md) | Oprava 404 na /admin |
| [ADMIN-SETUP.md](./ADMIN-SETUP.md) | Supabase admin setup |
| [EMAILJS-SETUP.md](./EMAILJS-SETUP.md) | Kontaktní formulář setup |
| [3D-MODEL-VIEWER.md](./3D-MODEL-VIEWER.md) | 3D model viewer guide |
| [nginx-config.txt](./nginx-config.txt) | Nginx konfigurace pro NAS |

---

## 🧪 **Testování:**

Po deployi zkontroluj:

- ✅ `https://filip-eckstein.cz/` - hlavní stránka
- ✅ `https://filip-eckstein.cz/admin` - admin login
- ✅ `https://filip-eckstein.cz/projects` - projekty
- ✅ `https://filip-eckstein.cz/achievements` - úspěchy
- ✅ `https://filip-eckstein.cz/testimonials` - reference
- ✅ Refresh (F5) na jakékoli stránce - mělo by fungovat

---

## 🐛 **Řešení problémů:**

### ❌ `/admin` ukazuje 404

**Příčina:** Chybí `404.html` v buildu

**Řešení:**
```bash
# Použij build script (automaticky kopíruje 404.html)
./build-and-download.sh

# Nebo manuálně
cp 404.html dist/404.html
```

Viz [DEPLOYMENT-QUICK-FIX.md](./DEPLOYMENT-QUICK-FIX.md)

---

### ❌ DeepL auto-translate nefunguje

**Příčina:** Chybí API key

**Řešení:**
1. Vytvoř DeepL account (https://www.deepl.com/pro-api)
2. Nastav `DEEPL_API_KEY` v Supabase Edge Function env variables
3. Restart Edge Function

Viz [ADMIN-SETUP.md](./ADMIN-SETUP.md)

---

### ❌ Obrázky se nenahrávají

**Příčina:** Supabase Storage není správně nastavený

**Řešení:**
1. Zkontroluj že bucket `make-635fd90e-images` existuje
2. Zkontroluj Storage policies v Supabase
3. Zkontroluj že `SUPABASE_SERVICE_ROLE_KEY` je správně nastavený

---

## 📝 **Checklist před použitím:**

### **Development:**
- [ ] Nainstalované dependencies (`npm install`)
- [ ] Supabase projekt vytvořený
- [ ] Environment variables nastavené
- [ ] DeepL API key nastavený (optional)
- [ ] EmailJS account nastavený (pro kontaktní formulář)

### **Build:**
- [ ] Build byl úspěšný (`npm run build`)
- [ ] `dist/404.html` existuje
- [ ] `dist/CNAME` existuje (pro custom domain)
- [ ] Lokální test funguje

### **Deployment:**
- [ ] DNS záznamy nastavené (pokud custom domain)
- [ ] GitHub Pages nebo NAS nakonfigurovaný
- [ ] SPA routing funguje (test `/admin`)
- [ ] HTTPS zapnuté

### **Admin:**
- [ ] Admin login funguje
- [ ] Upload obrázků funguje
- [ ] Auto-translate funguje (DeepL)
- [ ] 3D model viewer funguje

---

## 🚀 **Quick Start (TL;DR):**

```bash
# 1. Clone projektu
git clone https://github.com/tvuj-username/filip-eckstein-portfolio.git
cd filip-eckstein-portfolio

# 2. Instalace
npm install

# 3. Development
npm run dev

# 4. Build + Deploy
npm run deploy
```

**Nebo použij build script:**
```bash
# Windows
build-and-download.bat

# macOS/Linux
./build-and-download.sh
```

**Hotovo!** 🎉

---

## 📞 **Kontakt:**

- **Web:** https://filip-eckstein.cz
- **Email:** [tvuj-email]
- **GitHub:** [tvuj-github]

---

## 📄 **License:**

© 2025 Filip Eckstein. All rights reserved.

---

**Vytvořeno s ❤️ v Figma Make**
