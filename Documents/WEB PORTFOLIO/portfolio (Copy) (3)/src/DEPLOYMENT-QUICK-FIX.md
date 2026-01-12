# 🚨 RYCHLÁ OPRAVA - Admin 404 na filip-eckstein.cz

## ❌ Problém
Když jdeš na `filip-eckstein.cz/admin` → vidíš "Page not found"

## ✅ Příčina
GitHub Pages neví o React Router routes. Potřebuje `404.html` v build složce.

## 🔧 Řešení (2 minuty)

### **Varianta A: Použij build script** ⭐ DOPORUČUJI

```bash
# Spusť build script (automaticky zkopíruje 404.html + vytvoří CNAME)
chmod +x build-for-github-pages.sh
./build-for-github-pages.sh

# Nahraj na GitHub
git add dist/
git commit -m "Deploy with 404.html fix"
git push
```

---

### **Varianta B: Manuální deploy**

```bash
# 1. Build projektu
npm run build

# 2. Zkopíruj 404.html do dist
cp 404.html dist/404.html

# 3. Vytvoř CNAME (pokud ještě není)
echo "filip-eckstein.cz" > dist/CNAME

# 4. Deploy pomocí gh-pages
npx gh-pages -d dist
```

---

### **Varianta C: Automatizovaný deploy script**

Přidej do `package.json`:

```json
{
  "scripts": {
    "deploy": "npm run build && cp 404.html dist/404.html && echo filip-eckstein.cz > dist/CNAME && npx gh-pages -d dist"
  }
}
```

Pak stačí:
```bash
npm run deploy
```

---

## 🧪 Ověření

Po deployi (počkej 2-5 minut) zkontroluj:

1. ✅ `https://filip-eckstein.cz/` - hlavní stránka
2. ✅ `https://filip-eckstein.cz/admin` - admin login (ne 404!)
3. ✅ `https://filip-eckstein.cz/projects` - projekty
4. ✅ Refresh (F5) na kterékoli stránce - mělo by fungovat

---

## 📂 Kontrola dist složky

Po buildu zkontroluj, že existují tyto soubory:

```bash
ls -la dist/

# Mělo by být:
dist/
├── 404.html      ← ✅ MUSÍ BÝT!
├── CNAME         ← ✅ MUSÍ BÝT! (obsahuje: filip-eckstein.cz)
├── index.html
└── assets/
```

---

## 🐛 Pokud stále nefunguje

### Zkontroluj GitHub Pages nastavení:

1. Jdi na GitHub repo → **Settings** → **Pages**
2. **Source**: Deploy from a branch
3. **Branch**: `gh-pages` → `/` (root) ✅
4. **Custom domain**: `filip-eckstein.cz` ✅
5. **Enforce HTTPS**: ☑️ Zaškrtnuto ✅

### Zkontroluj že 404.html je v gh-pages branch:

```bash
# Přepni na gh-pages branch
git checkout gh-pages

# Zkontroluj že existuje 404.html
ls -la | grep 404

# Mělo by být:
# -rw-r--r--  1 user  staff  2048 Jan  3 12:00 404.html

# Vrať se zpět
git checkout main  # nebo master
```

### Pokud 404.html NENÍ v gh-pages:

**Problém je jasný - gh-pages nemá 404.html!**

**Řešení:**
```bash
# Použij build script (už obsahuje vše potřebné)
./build-for-github-pages.sh

# Deploy znovu
npx gh-pages -d dist
```

---

## 💡 TL;DR

**Nejrychlejší řešení (1 příkaz):**

```bash
./build-for-github-pages.sh && npx gh-pages -d dist
```

**Hotovo!** 🎉

Počkej 2-5 minut a `/admin` bude fungovat!
