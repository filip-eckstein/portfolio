# 🚀 Návod na deploy - Windows

## 📋 Co potřebuješ mít nainstalované:

1. **Node.js** (LTS verze)
   - Stáhni z: https://nodejs.org/
   - Po instalaci **restartuj počítač**

2. **Git**
   - Stáhni z: https://git-scm.com/download/win
   - Při instalaci nech výchozí nastavení

---

## 🎯 RYCHLÝ START - 3 kroky:

### **KROK 1: První spuštění (jen jednou)**

1. Stáhni projekt z Figma Make (Export → Download)
2. Rozbal ZIP do složky
3. **Dvojklik na:** `setup-windows.bat`
4. Počkej 3-5 minut (instalují se balíčky)

### **KROK 2: Testování lokálně (volitelné)**

- **Dvojklik na:** `start-dev.bat`
- Otevře se prohlížeč na `http://localhost:3000`
- Zkontroluj, že vše funguje
- Zastav server: **CTRL + C** v terminálu

### **KROK 3: Deploy na GitHub Pages**

- **Dvojklik na:** `deploy-windows.bat`
- Počkej 2-3 minuty
- Hotovo! ✨

---

## 🌐 Po deployi:

Počkaj **2-5 minut** a otevři:

- ✅ https://filip-eckstein.cz/
- ✅ https://filip-eckstein.cz/admin ← **OPRAVENO!**
- ✅ https://filip-eckstein.cz/projects
- ✅ https://filip-eckstein.cz/achievements

---

## 🔧 Co dělá deploy script:

1. **Builduje** projekt (vytvoří optimalizovaný kód)
2. **Kopíruje** `404.html` (pro SPA routing)
3. **Vytváří** `CNAME` (vlastní doména filip-eckstein.cz)
4. **Commituje** změny do Gitu
5. **Pushuje** na GitHub (zdrojový kód)
6. **Deployuje** na GitHub Pages (gh-pages branch)

---

## ⚠️ Časté problémy:

### **"npm není rozpoznán"**
- Nainstaluj Node.js a **restartuj počítač**

### **"git není rozpoznán"**
- Nainstaluj Git a **restartuj počítač**

### **"Permission denied" při push**
- Zkontroluj Git credentials:
  ```
  git config --global user.name "Tvoje Jméno"
  git config --global user.email "tvuj@email.com"
  ```

### **Deploy funguje, ale /admin nefunguje**
- Počkej 5 minut (GitHub Pages cache)
- Zkus Hard Refresh: **CTRL + SHIFT + R**
- Zkontroluj konzoli v prohlížeči (F12)

---

## 📝 Ruční deploy (pokud nefungují .bat soubory):

Otevři Command Prompt (cmd) ve složce projektu:

```bash
# 1. První spuštění (jen jednou)
npm install

# 2. Build
npm run build

# 3. Zkopíruj soubory (Windows)
copy /Y 404.html dist\404.html
echo filip-eckstein.cz > dist\CNAME

# 4. Git commit & push
git add .
git commit -m "Update project"
git push origin main

# 5. Deploy na GitHub Pages
npx gh-pages -d dist
```

---

## 🆘 Potřebuješ pomoc?

Otevři issue na GitHubu nebo napiš do Figma Make chatu! 💬
