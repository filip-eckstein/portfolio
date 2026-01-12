# ⚡ Rychlá oprava pro /admin - CHECKLIST

## Co je problém?
❌ `filip-eckstein.cz/admin` vrací 404  
❌ Po refreshi na `/projects` nebo `/achievements` je 404

## Proč?
Server neví, že má všechny URL přesměrovat na `index.html` (potřeba pro React Router).

---

## ✅ ŘEŠENÍ - Podle hostingu:

### 🔷 Používáš **GitHub Pages**? ⭐ (TO JE TVŮJ PŘÍPAD!)

1. ✅ Soubor `/404.html` už existuje v projektu
2. ✅ `App.tsx` už je upravený pro GitHub Pages routing
3. ⚠️ **DŮLEŽITÉ:** Po buildu **ZKOPÍRUJ `404.html` do `dist/` složky!**

**Přesné kroky:**
```bash
# 1. Build projektu
npm run build

# 2. MUSÍŠ zkopírovat 404.html do dist!
cp 404.html dist/404.html

# 3. Vytvoř CNAME soubor (pokud ještě nemáš)
echo "filip-eckstein.cz" > dist/CNAME

# 4. Deploy na GitHub Pages
# (buď přes GitHub Actions nebo gh-pages branch)
```

**📚 Detailní návod:** Viz soubor `/GITHUB-PAGES-SETUP.md`

---

### 🔷 Používáš **Netlify**?
1. ✅ Soubor `/_redirects` už existuje v projektu
2. 📦 Build a deploy
3. 🎉 Hotovo! Netlify automaticky použije `_redirects`

---

### 🔷 Používáš **Vercel**?
1. ✅ Soubor `/vercel.json` už existuje v projektu
2. 📦 Push na GitHub
3. 🎉 Hotovo! Vercel automaticky použije `vercel.json`

---

### 🔷 Používáš **NAS s Apache**?
1. ✅ Soubor `/.htaccess` už existuje v projektu
2. 📦 Build projektu
3. 📂 **ZKOPÍRUJ `.htaccess` do složky s buildem** (kam nahráváš `index.html`)
4. ✔️ Zkontroluj že je povolený `mod_rewrite`:
   ```bash
   sudo a2enmod rewrite
   sudo systemctl restart apache2
   ```
5. 🎉 Hotovo!

**Struktura po nahrání:**
```
/var/www/filip-eckstein/   (nebo kde máš web)
├── index.html
├── .htaccess              ← MUSÍ BÝT TADY!
├── assets/
├── ...
```

---

### 🔷 Používáš **NAS s Nginx**?
1. 📂 Build projektu a nahraj na server
2. ✏️ Uprav Nginx config podle `/nginx-config.txt`
3. ✔️ Testuj config: `sudo nginx -t`
4. 🔄 Reload: `sudo systemctl reload nginx`
5. 🎉 Hotovo!

---

## 🧪 Jak otestovat že to funguje?

Po deployi zkus:
```
https://filip-eckstein.cz/admin
https://filip-eckstein.cz/projects
https://filip-eckstein.cz/achievements
```

**Mělo by fungovat bez 404!** ✅

---

## 🆘 Stále 404?

### Apache:
```bash
# Zkontroluj že je .htaccess v build složce
ls -la /path/to/web/ | grep htaccess

# Zkontroluj logy
sudo tail -f /var/log/apache2/error.log
```

### Nginx:
```bash
# Zkontroluj že je konfigurace správně
sudo nginx -t

# Zkontroluj logy
sudo tail -f /var/log/nginx/error.log
```

---

## 📱 **Napiš mi:**
- Jaký hosting používáš? (Netlify / Vercel / NAS Apache / NAS Nginx / jiný?)
- Co vidíš když otevřeš `filip-eckstein.cz/admin`? (404 / prázdná stránka / chyba?)

Pak ti pomůžu přesně!