# 🚀 Oprava routingu na produkci (filip-eckstein.cz)

## Problém
Po buildu a deployi nefunguje `/admin` a další routes - zobrazuje se 404.

## Řešení
Vytvořil jsem konfigurační soubory pro všechny běžné hostingy. Použij ten správný podle toho, kde máš web hostovaný:

---

## 📌 Netlify

Soubor `/_redirects` je už vytvořený a připravený.

**Co udělat:**
1. Build projektu: `npm run build`
2. Nahraj celou složku `dist/` (včetně `_redirects` souboru) na Netlify
3. Netlify automaticky rozpozná `_redirects` soubor
4. Hotovo! ✅

---

## 📌 Vercel

Soubor `/vercel.json` je už vytvořený a připravený.

**Co udělat:**
1. Ujisti se že `vercel.json` je v root složce projektu (✅ už je)
2. Push na GitHub
3. Vercel automaticky použije tuto konfiguraci při buildu
4. Hotovo! ✅

---

## 📌 NAS Server s Apache

Soubor `/.htaccess` je už vytvořený a připravený.

**Co udělat:**
1. Build projektu: `npm run build`
2. Nahraj celou složku `dist/` na tvůj NAS
3. **DŮLEŽITÉ:** Zkopíruj soubor `.htaccess` do root složky webu (tam kde je `index.html`)
4. Ujisti se že Apache má povolený `mod_rewrite` modul
5. Restartuj Apache (pokud je potřeba)
6. Hotovo! ✅

**Ověření .htaccess:**
```bash
# SSH do NAS serveru
ls -la /path/to/web/root/  # měl by tam být soubor .htaccess
```

---

## 📌 NAS Server s Nginx

Instrukce jsou v souboru `/nginx-config.txt`.

**Co udělat:**
1. Build projektu: `npm run build`
2. Nahraj složku `dist/` na NAS
3. Otevři Nginx config: `sudo nano /etc/nginx/sites-available/filip-eckstein.cz`
4. Přidej konfiguraci z `nginx-config.txt` do `server` bloku
5. Otestuj konfiguraci: `sudo nginx -t`
6. Reload Nginx: `sudo systemctl reload nginx`
7. Hotovo! ✅

**Příklad Nginx konfigurace:**
```nginx
server {
    listen 80;
    server_name filip-eckstein.cz www.filip-eckstein.cz;
    root /var/www/filip-eckstein;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # Security headers
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-Frame-Options "DENY" always;
    add_header X-XSS-Protection "1; mode=block" always;
}
```

---

## 🔍 Testování po nasazení

Po deployi otestuj tyto URL:
- ✅ `https://filip-eckstein.cz/` - hlavní stránka
- ✅ `https://filip-eckstein.cz/admin` - admin login
- ✅ `https://filip-eckstein.cz/projects` - projekty
- ✅ `https://filip-eckstein.cz/achievements` - úspěchy
- ✅ `https://filip-eckstein.cz/testimonials` - reference

Všechny by měly fungovat bez 404 chyby!

---

## 🐛 Stále nefunguje?

### Pro Apache (NAS):
```bash
# Zkontroluj jestli je mod_rewrite povolený
sudo a2enmod rewrite
sudo systemctl restart apache2

# Zkontroluj Apache logy
sudo tail -f /var/log/apache2/error.log
```

### Pro Nginx (NAS):
```bash
# Zkontroluj syntax
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx

# Zkontroluj logy
sudo tail -f /var/log/nginx/error.log
```

### Pro Netlify/Vercel:
- Zkontroluj build logy v dashboard
- Ujisti se že soubory `_redirects` nebo `vercel.json` jsou v buildu
- Zkus Clear cache & redeploy

---

## 📦 Build příkazy

```bash
# Development
npm run dev

# Production build
npm run build

# Preview buildu lokálně
npm run preview
```

Po buildu by měla být celá aplikace v `dist/` složce - tu nahraješ na server.

---

## ❓ Kde hostuješ?

Pokud nepoužíváš ani jeden z těchto serverů, napiš mi jaký hosting používáš a přidám konfiguraci!
