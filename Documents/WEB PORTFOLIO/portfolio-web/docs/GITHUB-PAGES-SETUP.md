# 🚀 GitHub Pages - Kompletní návod pro filip-eckstein.cz

## ✅ Co jsem opravil:

1. ✅ Vytvořil `404.html` - zachytává všechny neexistující URL
2. ✅ Upravil `App.tsx` - přesměruje na správnou route po načtení
3. ✅ Smazal neplatné soubory (`_redirects/Code-component-*.tsx`)

---

## 📋 Jak nasadit na GitHub Pages:

### **Krok 1: Build projektu**

Pokud používáš Figma Make, build se dělá automaticky. Pokud ne:

```bash
npm run build
```

Vytvoří se složka `dist/` s kompletní aplikací.

---

### **Krok 2: Zkopíruj 404.html do build složky**

**VELMI DŮLEŽITÉ:** Soubor `404.html` **MUSÍ** být v root build složky!

```bash
# Po buildu zkopíruj 404.html
cp 404.html dist/404.html
```

**Struktura po buildu:**
```
dist/
├── index.html          ← hlavní soubor
├── 404.html            ← ✅ MUSÍ BÝT TADY!
├── assets/
│   ├── index-abc123.js
│   ├── index-xyz789.css
│   └── ...
└── ...
```

---

### **Krok 3: Nahraj na GitHub**

#### **A) Pokud používáš GitHub Actions (automatický deploy):**

Ujisti se že máš workflow soubor `.github/workflows/deploy.yml`:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]  # nebo master
  workflow_dispatch:

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout
        uses: actions/checkout@v3
      
      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm install
      
      - name: Build
        run: npm run build
      
      - name: Copy 404.html to dist
        run: cp 404.html dist/404.html
      
      - name: Deploy to GitHub Pages
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./dist
          cname: filip-eckstein.cz  # tvoje vlastní doména
```

**Pak:**
```bash
git add .
git commit -m "Fix routing for GitHub Pages"
git push origin main
```

---

#### **B) Pokud nahráváš manuálně (gh-pages branch):**

```bash
# Build projektu
npm run build

# Zkopíruj 404.html
cp 404.html dist/404.html

# Nahraj dist/ do gh-pages branch
git checkout --orphan gh-pages
git rm -rf .
cp -r dist/* .
git add .
git commit -m "Deploy to GitHub Pages"
git push origin gh-pages --force
```

---

### **Krok 4: Nastav GitHub Pages**

1. Jdi na GitHub repo: `https://github.com/tvuj-username/tvuj-repo`
2. **Settings** → **Pages**
3. **Source**: Deploy from a branch
4. **Branch**: `gh-pages` → `/` (root)
5. **Custom domain**: `filip-eckstein.cz`
6. ✅ **Enforce HTTPS** (zaškrtni)
7. Klikni **Save**

---

### **Krok 5: Nastav DNS (u registrátora domény)**

Přidej tyto DNS záznamy pro `filip-eckstein.cz`:

#### **Pro apex doménu (filip-eckstein.cz):**
```
Type: A
Name: @
Value: 185.199.108.153

Type: A
Name: @
Value: 185.199.109.153

Type: A
Name: @
Value: 185.199.110.153

Type: A
Name: @
Value: 185.199.111.153
```

#### **Pro www subdoménu (www.filip-eckstein.cz):**
```
Type: CNAME
Name: www
Value: tvuj-username.github.io.
```

**Poznámka:** Nahraď `tvuj-username` za své GitHub username.

---

### **Krok 6: Ověř že CNAME soubor existuje**

V `dist/` složce (po buildu) by měl být soubor `CNAME`:

```
filip-eckstein.cz
```

Pokud není, vytvoř ho:

```bash
echo "filip-eckstein.cz" > dist/CNAME
```

Nebo přidej do build scriptu:

```json
// package.json
{
  "scripts": {
    "build": "vite build && echo filip-eckstein.cz > dist/CNAME && cp 404.html dist/404.html"
  }
}
```

---

## 🧪 Testování

Po nasazení počkej 5-10 minut a otestuj:

- ✅ `https://filip-eckstein.cz/` - hlavní stránka
- ✅ `https://filip-eckstein.cz/admin` - mělo by načíst admin login
- ✅ `https://filip-eckstein.cz/projects` - projekty
- ✅ `https://filip-eckstein.cz/achievements` - úspěchy
- ✅ Refresh na libovolné stránce - mělo by fungovat!

---

## 🐛 Řešení problémů

### ❌ Stále vidím 404

**Zkontroluj:**
1. Je `404.html` v root build složky? (`dist/404.html`)
2. Je správně nastavená DNS? (ping filip-eckstein.cz)
3. Je zapnuté "Enforce HTTPS" v Settings → Pages?
4. Počkej 5-10 minut - DNS propagace trvá

### ❌ `/admin` nefunguje ale `/` ano

**Problém:** Soubor `404.html` není v buildu!

```bash
# Ujisti se že je 404.html ve výstupu
ls -la dist/ | grep 404

# Pokud není, zkopíruj ho
cp 404.html dist/404.html
```

### ❌ "This site can't be reached"

**Problém:** DNS není správně nastavené.

1. Zkontroluj DNS záznamy u registrátora
2. Ověř: `nslookup filip-eckstein.cz`
3. Mělo by vrátit GitHub Pages IP adresy

### ❌ Červený varování "Domain's DNS record could not be retrieved"

**Počkej 24-48 hodin** - DNS propagace může trvat. Mezitím bude web fungovat na:
- `https://tvuj-username.github.io/repo-name/`

---

## 📝 Checklist před pushnutím:

- [ ] ✅ Build projektu (`npm run build`)
- [ ] ✅ Zkopírován `404.html` do `dist/` složky
- [ ] ✅ Zkopírován `CNAME` do `dist/` (obsahuje: `filip-eckstein.cz`)
- [ ] ✅ Push na GitHub
- [ ] ✅ Nastavené DNS záznamy u registrátora
- [ ] ✅ GitHub Pages nastavené na `gh-pages` branch
- [ ] ✅ Custom domain nastavená na `filip-eckstein.cz`
- [ ] ✅ Enforce HTTPS zapnuté

---

## 🎯 Automatizace (doporučuji)

Vytvoř npm script pro jednoduché nasazení:

```json
// package.json
{
  "scripts": {
    "build": "vite build",
    "deploy": "npm run build && cp 404.html dist/404.html && echo filip-eckstein.cz > dist/CNAME && gh-pages -d dist"
  },
  "devDependencies": {
    "gh-pages": "^6.1.0"
  }
}
```

**Instalace:**
```bash
npm install --save-dev gh-pages
```

**Použití:**
```bash
npm run deploy
```

Jeden příkaz = build + nahraj na GitHub Pages! 🚀

---

## ❓ Otázky?

Pokud něco nefunguje, napiš mi:
- Co vidíš když otevřeš `filip-eckstein.cz/admin`?
- Jaká je chybová zpráva?
- Je web viditelný na `username.github.io/repo-name`?
