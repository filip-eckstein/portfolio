# 📥 JAK STÁHNOUT BUILD - Rychlý návod pro Filipa

## 🎯 **Tvoje situace:**
- Máš projekt v **Figma Make**
- Chceš **stáhnout zbuildované soubory**
- Pak to nahraješ na **NAS server**

---

## ✅ **ŘEŠENÍ - 2 možnosti:**

---

### **1️⃣ Figma Make - Download (NEJJEDNODUŠŠÍ)** ⭐

V Figma Make rozhraní klikni na:
- **"Export"** tlačítko, nebo
- **"Download"** tlačítko, nebo
- **"Download build"** tlačítko

**Stáhne se ZIP** s kompletním buildem! 🎉

**✅ To je vše! Rozbal ZIP a nahraj na NAS.**

---

### **2️⃣ Lokální build (pokud nemáš Figma Make download)**

**Krok 1: Stáhni projekt z Figma Make**

1. V Figma Make klikni na **"Download source"** nebo **"Export source code"**
2. Rozbal ZIP někam na disk (např. `C:\Projects\filip-portfolio`)

**Krok 2: Nainstaluj dependencies**

Otevři **Command Prompt** nebo **PowerShell** v té složce:

```bash
npm install
```

Počkej cca 2-5 minut (stahuje se React a další knihovny).

**Krok 3: Build projektu**

**Windows:**
```bash
# Dvojklik na:
build-and-download.bat

# Nebo v terminálu:
.\build-and-download.bat
```

**macOS/Linux:**
```bash
# V terminálu:
chmod +x build-and-download.sh
./build-and-download.sh
```

**Vytvoří se:**
- ✅ `filip-eckstein-portfolio-20250103_143022.zip` (s timestampem)
- ✅ Obsahuje kompletní build ready k nahrání

**✅ Stačí rozbalit a nahrát na NAS!**

---

## 📂 **Co dostaneš (struktura buildu):**

```
filip-eckstein-portfolio-[timestamp].zip
│
└─── (po rozbalení)
     ├── index.html          ← hlavní soubor
     ├── 404.html            ← pro správný routing
     ├── CNAME               ← custom domain
     └── assets/
         ├── index-abc123.js  ← React app (minifikovaný)
         ├── index-xyz789.css ← styly (Tailwind)
         └── [další soubory]
```

**Celá tato složka jde na NAS!**

---

## 🚀 **Nahrání na NAS server:**

### **Způsob A: FTP/SFTP (FileZilla, WinSCP)**

1. Otevři **FileZilla** nebo **WinSCP**
2. Připoj se na NAS:
   - Host: `tvuj-nas-ip` (např. `192.168.1.100`)
   - Username: `tvuj-username`
   - Password: `tvoje-heslo`
3. Naviguj do složky webu (např. `/var/www/filip-eckstein/`)
4. Nahraj **CELÝ obsah** rozbalené složky (ne ZIP!)
   - Nahraješ: `index.html`, `404.html`, `CNAME`, `assets/`

**✅ Hotovo!**

---

### **Způsob B: SSH/SCP (pokud znáš terminál)**

```bash
# Rozbal ZIP lokálně
unzip filip-eckstein-portfolio-20250103_143022.zip -d build-output

# Nahraj na NAS přes SCP
scp -r build-output/* username@192.168.1.100:/var/www/filip-eckstein/
```

**✅ Hotovo!**

---

## ⚙️ **Konfigurace Nginx na NAS:**

**Důležité!** NAS musí správně routovat SPA aplikaci.

**1. Připoj se na NAS přes SSH:**
```bash
ssh username@192.168.1.100
```

**2. Uprav Nginx config:**

Soubor: `/etc/nginx/sites-available/filip-eckstein.conf` (nebo podobný)

```nginx
server {
    listen 80;
    server_name filip-eckstein.cz www.filip-eckstein.cz;
    
    root /var/www/filip-eckstein;
    index index.html;

    # DŮLEŽITÉ: SPA routing!
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache pro assets
    location /assets/ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Compression
    gzip on;
    gzip_types text/css application/javascript application/json;
}
```

**3. Restart Nginx:**
```bash
sudo nginx -t          # Zkontroluj syntax
sudo systemctl reload nginx
```

**✅ Web poběží na `http://filip-eckstein.cz`**

---

## 🧪 **Test že vše funguje:**

Po nahrání zkontroluj tyto URL:

- ✅ `http://filip-eckstein.cz/` - hlavní stránka
- ✅ `http://filip-eckstein.cz/admin` - admin (ne 404!)
- ✅ `http://filip-eckstein.cz/projects` - projekty
- ✅ `http://filip-eckstein.cz/achievements` - úspěchy
- ✅ Refresh (F5) na `/admin` - mělo by zůstat na adminu (ne 404!)

**Pokud něco ukazuje 404:**
- ❌ Nginx není správně nakonfigurovaný
- ❌ Nebo `404.html` není na serveru

---

## 🐛 **Řešení problémů:**

### ❌ `/admin` ukazuje 404

**Příčina:** Nginx neposílá requesty na `index.html`

**Řešení:**
```nginx
# Přidej do nginx configu:
location / {
    try_files $uri $uri/ /index.html;
}
```

---

### ❌ Stránka se vůbec nenačte

**Zkontroluj:**
1. Je Nginx zapnutý? `sudo systemctl status nginx`
2. Jsou soubory na správném místě? `ls -la /var/www/filip-eckstein/`
3. Existuje `index.html`? `ls -la /var/www/filip-eckstein/index.html`
4. Správná oprávnění? `sudo chmod -R 755 /var/www/filip-eckstein/`

---

### ❌ Build script nefunguje (npm install selže)

**Zkontroluj Node.js verzi:**
```bash
node --version  # Mělo by být v18+ nebo v20+
```

**Pokud je starý Node:**
```bash
# Aktualizuj Node.js:
# Windows: Stáhni z https://nodejs.org/
# macOS: brew install node
# Linux: sudo apt update && sudo apt install nodejs npm
```

---

## 📝 **Checklist před nahráním na NAS:**

- [ ] ✅ Build byl úspěšný
- [ ] ✅ Rozbalil jsem ZIP
- [ ] ✅ Vidím `index.html`, `404.html`, `CNAME`
- [ ] ✅ Vidím složku `assets/`
- [ ] ✅ Připojil jsem se na NAS (FTP/SSH)
- [ ] ✅ Nahrál jsem **celý obsah** (ne ZIP soubor!)
- [ ] ✅ Zkontroloval jsem Nginx config
- [ ] ✅ Restartoval jsem Nginx
- [ ] ✅ Otestoval jsem URL (/, /admin, /projects)

---

## 🎯 **TL;DR (Rychlá verze):**

### **V Figma Make:**
1. Klikni **"Download"** nebo **"Export"**
2. Rozbal ZIP
3. Nahraj na NAS přes FTP do `/var/www/filip-eckstein/`
4. Ujisti se, že Nginx má `try_files $uri $uri/ /index.html;`
5. Otestuj: `http://filip-eckstein.cz/admin`

**Hotovo!** 🎉

---

### **Lokální build (pokud Figma Make download nefunguje):**

```bash
# Windows (dvojklik):
build-and-download.bat

# macOS/Linux (terminál):
./build-and-download.sh

# Nahraj ZIP obsah na NAS
```

**Hotovo!** 🎉

---

## ❓ **Potřebuješ pomoc?**

Pokud něco nefunguje, napiš mi:
- Co přesně vidíš/chybová zpráva?
- Který krok selhal?
- Screenshot pomůže!

---

**Vytvořeno: 3. ledna 2025**  
**Pro: Filip Eckstein**  
**Účel: Stažení a nahrání portfolio buildu na NAS**
