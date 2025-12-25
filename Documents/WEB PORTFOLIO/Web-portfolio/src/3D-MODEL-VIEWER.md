# 3D Model Viewer - Setup Guide

## 📦 Přidání 3D modelu k projektu

### 1. Připrava 3D modelu
- **Podporované formáty**: GLB, GLTF
- **Doporučený nástroj pro export**: Fusion 360, Blender, Tinkercad
- **Tip**: GLB je doporučený formát (komprimovaný, vše v jednom souboru)

### 2. Export z Fusion 360
1. File → Export
2. Vyberte formát "GLB" nebo "GLTF"
3. Nastavení optimalizace:
   - Decimation: 90-95% (redukce polycount)
   - Include materials: Yes
   - Include animations: Optional

### 3. Upload v Admin Dashboardu
1. Otevřete projekt v Admin → Projects
2. Scrollujte dolů k sekci "3D Model (GLB/GLTF)"
3. Klikněte "Upload 3D Model"
4. Vyberte soubor (.glb nebo .gltf)
5. Počkejte na upload
6. Klikněte "Save Project"

### 4. Zobrazení na webu
- 3D model se automaticky zobrazí v detail projektu
- Návštěvníci mohou:
  - **Otáčet**: Přetáhnout myší
  - **Přiblížit**: Scroll kolečkem
  - **Posunout**: Pravé tlačítko + tah
- Model se automaticky rotuje (auto-rotate)

## 🎨 Vlastnosti vieweru

### Interaktivní kontroly
- ✅ Camera controls (otáčení, zoom, posun)
- ✅ Auto-rotation (automatická rotace)
- ✅ Shadows (stíny pro realismus)
- ✅ Touch support (podpora dotyků na mobilu)

### Optimalizace
- Model viewer lazy-loaduje modely
- Nepřidává zátěž dokud uživatel neotevře detail projektu
- Podporuje komprimované GLB formáty

## 🔧 Technické detaily

### Google Model Viewer
- **Verze**: 3.4.0
- **CDN**: Ajax Google Libraries
- **Dokumentace**: https://modelviewer.dev/

### Integrace
- Script se automaticky načítá v `ProjectsPage.tsx`
- TypeScript deklarace v `/model-viewer.d.ts`
- Backend ukládá modely do Supabase Storage

## 📝 Příklad použití

```tsx
{selectedProject.model3dUrl && (
  <model-viewer
    src={selectedProject.model3dUrl}
    alt={selectedProject.title}
    auto-rotate
    camera-controls
    shadow-intensity="1"
  ></model-viewer>
)}
```

## 💡 Tipy

### Velikost souborů
- **Ideální velikost**: < 5 MB
- **Maximum**: 10 MB
- **Optimalizace**: Použijte GLB místo GLTF (menší soubor)

### Kvalita vs. Výkon
- Vysoký polycount: Detailní, ale pomalý
- Nízký polycount: Rychlý, ale méně detailní
- **Doporučení**: 50k-100k polygonů

### Textury
- Použijte komprimované textury (JPEG místo PNG)
- Doporučená velikost: 1024x1024 px
- Model viewer podporuje PBR materiály

## 🚀 Další možnosti

### Rozšíření vieweru
Model viewer podporuje mnoho dalších funkcí:
- AR mode (Augmented Reality)
- Animace
- Varianty (různé barvy/materiály)
- Hotspoty (interaktivní body)
- Environment maps (HDR pozadí)

Pro přidání těchto funkcí upravte `<model-viewer>` element v `ProjectsPage.tsx`.

### Příklad s AR:
```tsx
<model-viewer
  src={selectedProject.model3dUrl}
  alt={selectedProject.title}
  ar
  ar-modes="scene-viewer webxr quick-look"
  camera-controls
  shadow-intensity="1"
></model-viewer>
```

## ⚠️ Poznámky

- 3D model je **volitelný** - projekty bez modelu fungují normálně
- Model se zobrazuje pouze v detailu projektu, ne v list view
- Ujistěte se, že GLB soubor je správně exportovaný (obsahuje geometrii + materiály)
