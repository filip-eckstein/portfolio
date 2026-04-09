# 📥 Jak stáhnout a zbuildovat projekt

## 🎯 **3 způsoby jak získat build:**

---

## **1️⃣ Figma Make (nejjednodušší)**

Pokud jsi v **Figma Make**:

1. Klikni na **"Export"** nebo **"Download"** tlačítko
2. Stáhne se ZIP soubor s kompletním buildem
3. Rozbal a nahraj na server

**✅ Hotovo!**

---

## **2️⃣ Lokální build (automatický ZIP)**

Pokud máš projekt **stažený lokálně**:

```bash
# 1. Nainstaluj dependencies (pouze jednou)
npm install

# 2. Build a vytvoř ZIP
chmod +x build-and-download.sh
./build-and-download.sh
```

**Vytvoří se:**
- `filip-eckstein-portfolio-YYYYMMDD_HHMMSS.zip`
- Obsahuje kompletní build včetně `404.html` a `CNAME`

**✅ Stačí rozbalit a nahrát!**

---

## **3️⃣ Manuální build (krok po kroku)**

```bash
# 1. Nainstaluj dependencies
npm install

# 2. Build projektu
npm run build

# 3. Zkopíruj potřebné soubory
cp 404.html dist/404.html
echo "filip-eckstein.cz" > dist/CNAME

# 4. Build je v dist/ složce
ls -la dist/
```

**Složka `dist/` obsahuje:**
```
dist/
├── index.html          ← hlavní soubor
├── 404.html            ← GitHub Pages routing
├── CNAME               ← custom domain
└── assets/
    ├── index-abc123.js
    ├── index-xyz789.css
    └── [další soubory]
```

**✅ Tuto složku nahraj na server!**

---

## 🌐 **Kam nahrát build:**

### **A) GitHub Pages (doporučeno)**

```bash
# Automatický deploy
npm run deploy

# Nebo manuálně
npx gh-pages -d dist
```

**Výhody:**
- ✅ Automatický HTTPS
- ✅ Globální CDN
- ✅ Zdarma
- ✅ Custom domain support

---

### **B) NAS Server (tvůj případ)**

**1. Nahraj `dist/` složku na NAS**

```bash
# Přes SCP/SFTP
scp -r dist/* user@your-nas-ip:/var/www/filip-eckstein/

# Nebo přes FTP klient (FileZilla, WinSCP)
```

**2. Nastav Nginx**

Použij konfiguraci z `nginx-config.txt`:

```nginx
server {
    listen 80;
    server_name filip-eckstein.cz www.filip-eckstein.cz;
    root /var/www/filip-eckstein;
    index index.html;

    # SPA routing - pošli všechny requesty na index.html
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache statických souborů
    location /assets/ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

**3. Restart Nginx**

```bash
sudo nginx -t
sudo systemctl reload nginx
```

**✅ Web bude fungovat na `http://filip-eckstein.cz`**

---

### **C) Jiný hosting (Netlify, Vercel, apod.)**

**Netlify/Vercel:**
1. Přetáhni `dist/` složku do jejich web rozhraní
2. Nebo použij CLI: `netlify deploy --dir=dist`

**✅ Automaticky se nastaví routing!**

---

## 📦 **Co je v buildu:**

| Soubor | Popis |
|--------|-------|
| `index.html` | Hlavní HTML soubor (entry point) |
| `404.html` | Řeší routing pro GitHub Pages |
| `CNAME` | Custom domain pro GitHub Pages |
| `assets/*.js` | Minifikovaný JavaScript (React app) |
| `assets/*.css` | Minifikované CSS (Tailwind) |
| `assets/*.woff2` | Fonty (pokud jsou použité) |

---

## 🔍 **Ověření buildu:**

Po nahrání zkontroluj:

```bash
# Test lokálně (před nahráním)
cd dist
python3 -m http.server 8000

# Otevři: http://localhost:8000
```

**Funkční build musí:**
- ✅ Načíst homepage (/)
- ✅ Načíst `/admin` (ne 404)
- ✅ Načíst `/projects`
- ✅ Načíst `/achievements`
- ✅ Refresh (F5) na jakékoli stránce funguje

---

## 🐛 **Řešení problémů:**

### ❌ `npm: command not found`

**Řešení:** Nainstaluj Node.js
```bash
# macOS
brew install node

# Ubuntu/Debian
sudo apt install nodejs npm

# Windows
# Stáhni z: https://nodejs.org/
```

---

### ❌ Build selže s chybou

**Zkontroluj:**
```bash
# Verze Node.js (měla by být 18+)
node --version

# Smaž node_modules a reinstaluj
rm -rf node_modules
npm install
npm run build
```

---

### ❌ ZIP se nevytvoří

**Nainstaluj zip:**
```bash
# macOS
brew install zip

# Ubuntu/Debian
sudo apt install zip

# Windows - použij 7-Zip nebo WinRAR
```

**Nebo vytvoř ZIP manuálně:**
```bash
cd dist
zip -r ../build.zip .
```

---

## ✅ **Checklist před uploadem:**

- [ ] Build byl úspěšný (`npm run build`)
- [ ] `dist/404.html` existuje
- [ ] `dist/CNAME` existuje (obsahuje: `filip-eckstein.cz`)
- [ ] `dist/index.html` existuje
- [ ] Lokální test funguje (`python3 -m http.server`)
- [ ] Routing funguje (refresh na `/admin` neskončí s 404)

---

## 🚀 **Quick Start (TL;DR):**

```bash
# Kompletní automatický build + ZIP
npm install
./build-and-download.sh

# Nebo deploy přímo na GitHub Pages
npm run deploy
```

**Hotovo!** 🎉
