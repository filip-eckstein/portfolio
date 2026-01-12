// Utility to fill Czech translations for all projects
// This script should be run once to populate all Czech fields in the database

export const czechTranslations = [
  {
    id: "educational-electrical-model",
    titleCs: "Vzdělávací elektroinstalační model",
    descriptionCs: "Vítězný vzdělávací model vytvořený pro demonstraci základních principů elektroinstalačních zapojení pro studenty.",
    fullDescriptionCs: "Vítězný vzdělávací model vytvořený pro demonstraci základních principů elektroinstalačních zapojení pro studenty. Tento projekt vyhrál soutěž o nejlepší vzdělávací model vytvořený 3D tiskem pro studenty středních a vyšších odborných škol v České republice. Model ukazuje různé typy zapojení vypínačů světel a elektroinstalace jasným a vizuálním způsobem, který pomáhá studentům pochopit složité elektrické koncepty. Navržen s ohledem na funkčnost i vzdělávací hodnotu, kombinuje 3D tištěné komponenty s elektrickými prvky. Jedná se o můj návrh i myšlenku.",
    categoryCs: "Vzdělávací",
    durationCs: "6 měsíců",
    softwareCs: ["Fusion 360", "PrusaSlicer", "Bambu Studio"],
    technologiesCs: ["3D tisk", "Elektronika"],
    awardCs: "1. místo - Soutěž vzdělávacích modelů 2025",
    specsCs: [
      { label: "Materiály", value: "PLA, PETG" },
      { label: "Typ tisku", value: "FDM" },
      { label: "Časová náročnost", value: "6 měsíců" },
      { label: "Účel", value: "Vzdělávací, soutěžní model" },
      { label: "Technologie", value: "3D tisk, elektronika" }
    ]
  },
  {
    id: "diy-stream-deck",
    titleCs: "Arduino Stream deck",
    descriptionCs: "Vlastní stream deck navržený pro pohodlné ovládání maker, který funguje pomocí Arduina Pro Micro a vlastního kódu.",
    fullDescriptionCs: "Vlastní stream deck navržený pro pohodlné ovládání maker, který funguje pomocí Arduina Pro Micro a vlastního kódu. Tento projekt kombinuje 3D tištěný obal s elektronickými komponenty. Každé tlačítko lze naprogramovat k provedení různých příkazů, což je ideální pro jakoukoli práci na PC.",
    categoryCs: "Produktový design",
    durationCs: "1 den",
    softwareCs: ["Fusion 360", "Arduino IDE", "PrusaSlicer"],
    technologiesCs: ["Arduino"],
    specsCs: [
      { label: "Materiály", value: "PLA" },
      { label: "Typ tisku", value: "FDM" },
      { label: "Časová náročnost", value: "1 den" },
      { label: "Účel", value: "Praktický, osobní" },
      { label: "Technologie", value: "3D tisk, elektronika" }
    ]
  },
  {
    id: "dodge-challenger-model",
    titleCs: "Model Dodge Challenger v měřítku 1:46",
    descriptionCs: "Model Dodge Challenger v měřítku 1:46 s integrovaným LED osvětlením.",
    fullDescriptionCs: "Model Dodge Challenger v měřítku 1:46 s integrovaným LED osvětlením. Bylo použito mimochodem i dvousložkové pryskyřice pro realistický vzhled potůčku. Jako silnice byl použit nabarvený smirkový papír. Celý model funguje na 5v DC a má i podsvícený nápis i auto. Auto není mým vlastním 3D modelem, ale vše ostatní ano.",
    categoryCs: "Model",
    durationCs: "5 dní",
    softwareCs: ["Fusion 360", "PrusaSlicer"],
    technologiesCs: ["LED osvětlení"],
    specsCs: [
      { label: "Materiály", value: "PLA" },
      { label: "Typ tisku", value: "FDM" },
      { label: "Časová náročnost", value: "5 dní" },
      { label: "Účel", value: "Dekorace" },
      { label: "Technologie", value: "3D tisk, elektronika" }
    ]
  },
  {
    id: "character-figures",
    titleCs: "Modely figurek",
    descriptionCs: "3D tištěné modely figurek vytvořené speciálně pro klienta na základě jím poskytnutých referenčních obrázků.",
    fullDescriptionCs: "3D tištěné modely figurek vytvořené speciálně pro klienta na základě jím poskytnutých referenčních obrázků. Každá postava byla pečlivě modelována tak, aby zachytila detaily a styl dle předloh, poté optimalizována pro FDM tisk. Celkem se jedná o 10 kusů postaviček. Každá je vysoká cca 4-7cm. Klientka si postavičky následně bude barvit.",
    categoryCs: "Organický model",
    durationCs: "3 dny",
    softwareCs: ["Blender", "Bambu Studio"],
    technologiesCs: ["3D modelování", "Charakterový design"],
    specsCs: [
      { label: "Materiály", value: "PLA" },
      { label: "Typ tisku", value: "FDM" },
      { label: "Časová náročnost", value: "3 dny" },
      { label: "Účel", value: "Práce pro klienta" },
      { label: "Technologie", value: "3D tisk" }
    ]
  },
  {
    id: "tool-organizer",
    titleCs: "Organizér na nářadí pro elektrikáře",
    descriptionCs: "Organizér byl navrhnut na základě rozměrů od klienta. Je určen pro ukládání co největší škály nářadí, je tedy univerzální.",
    fullDescriptionCs: "Organizér na nářadí pro elektrikáře. Organizér byl navrhnut na základě rozměrů od klienta. Je určen pro ukládání co největší škály nářadí, je tedy univerzální. Dbalo se na přesnost a praktický design. Nakonec jsem tiskl dva kusy (oba stejně) na obě strany brašny. Organizér slouží jako náhrada za původní kožená poutka, která nevydržela a praskla.",
    categoryCs: "Funkční design",
    durationCs: "2 dny",
    softwareCs: ["Fusion 360", "Bambu Studio"],
    technologiesCs: ["Funkční design", "Modulární design"],
    specsCs: [
      { label: "Materiály", value: "PETG" },
      { label: "Typ tisku", value: "FDM" },
      { label: "Časová náročnost", value: "2 dny" },
      { label: "Účel", value: "Funkční díl" },
      { label: "Technologie", value: "3D tisk" }
    ]
  },
  {
    id: "planter-mold",
    titleCs: "Forma pro odlévání květináčů",
    descriptionCs: "Forma pro odlévání květináčů z patentované maltovité hmoty pro firmu.",
    fullDescriptionCs: "Forma pro odlévání květináčů z patentované maltovité hmoty pro firmu. Jednalo se o zakázku pro firmu, která požadovala formu na typy různých velkých květináčů. Výsledné výlisky byly vysoce detailní a připravené pro prodej.",
    categoryCs: "Funkční design",
    durationCs: "1 den",
    softwareCs: ["Fusion 360", "PrusaSlicer"],
    technologiesCs: ["Formování"],
    specsCs: [
      { label: "Materiály", value: "PETG" },
      { label: "Typ tisku", value: "FDM" },
      { label: "Časová náročnost", value: "1 den" },
      { label: "Účel", value: "Komerční forma" },
      { label: "Technologie", value: "3D tisk, formování" }
    ]
  },
  {
    id: "battery-organizer",
    titleCs: "Organizér baterií",
    descriptionCs: "Organizér na AA/AAA baterie navržený s ohledem na úsporu místa a snadný přístup.",
    fullDescriptionCs: "Organizér na AA/AAA baterie navržený s ohledem na úsporu místa a snadný přístup. Inspirován podobným designem od jiného designéra, ale zcela přepracován pro lepší použitelnost. Byl vytvořen organizér pro 50x AA baterie a 30x AAA baterie, včetně testeru baterií. Jsou využity dva různé typy organizérů - menší organizér pro 12x AA a 12x AAA baterií (zobrazený na obrázku). A větší organizér (který není na obrázku) na AA 26x baterií a AAA 14x baterií.",
    categoryCs: "Funkční design",
    durationCs: "2 hodiny",
    softwareCs: ["Fusion 360", "PrusaSlicer"],
    technologiesCs: ["Funkční design", "Organizační systémy"],
    specsCs: [
      { label: "Materiály", value: "PLA" },
      { label: "Typ tisku", value: "FDM" },
      { label: "Časová náročnost", value: "2 hodiny" },
      { label: "Účel", value: "Organizace" },
      { label: "Technologie", value: "3D tisk" }
    ]
  },
  {
    id: "paddle-shifter",
    titleCs: "Paddle shifter pro Thrustmaster T150",
    descriptionCs: "Vlastní paddle shifteru pro Thrustmaster T150 PRO vytvořený pomocí součástek z Arduina.",
    fullDescriptionCs: "Vlastní paddle shifter pro Thrustmaster T150 PRO, který jsem navrhl, protože originál takovou funkci neměl. Tento upgrade přidává sekvenční řazení pomocí pádel pod volantem. Vše funguje přes Arduino Micro, které emuluje klávesnici a posílá příkazy do hry. Celý systém je napájen přes USB. Design je čistý a snadno přizpůsobitelný různým velikostem rukou. Jedná se o můj návrh i myšlenku.",
    categoryCs: "Funkční design",
    durationCs: "3 dny",
    softwareCs: ["Fusion 360", "Arduino IDE", "PrusaSlicer"],
    technologiesCs: ["Arduino", "Elektronika"],
    specsCs: [
      { label: "Materiály", value: "PLA, PETG" },
      { label: "Typ tisku", value: "FDM" },
      { label: "Časová náročnost", value: "3 dny" },
      { label: "Účel", value: "Gaming upgrade" },
      { label: "Technologie", value: "3D tisk, elektronika" }
    ]
  },
  {
    id: "toy-figure",
    titleCs: "Hračková figurka s pohyblivými končetinami",
    descriptionCs: "Postavička s pohyblivými končetinami navržená jako tištěná na místě (print-in-place), inspirovaná populárním designem 'Flexi'.",
    fullDescriptionCs: "Postavička s pohyblivými končetinami navržená jako tištěná na místě (print-in-place), inspirovaná populárním designem 'Flexi'. Celá figurka je vytištěna najednou bez potřeby montáže. Klouby jsou funkční přímo po vyjmutí z tiskárny díky pečlivě navrženým tolerancím. Figurka měří přibližně 12 cm na výšku a je inspirována postavou Bendy z videoher. Design využívá print-in-place techniku s pohyblivými klouby v ramenou, stehnech a krku.",
    categoryCs: "Organický model",
    durationCs: "4 hodiny",
    softwareCs: ["Fusion 360", "PrusaSlicer"],
    technologiesCs: ["Print-in-place", "Pohyblivé klouby"],
    specsCs: [
      { label: "Materiály", value: "PLA" },
      { label: "Typ tisku", value: "FDM" },
      { label: "Časová náročnost", value: "4 hodiny" },
      { label: "Účel", value: "Hračka, dekorace" },
      { label: "Technologie", value: "3D tisk, print-in-place" }
    ]
  },
  {
    id: "vacuum-adapter",
    titleCs: "Redukční adaptér vysavače",
    descriptionCs: "Jednoduchý a funkční redukční adaptér, který umožňuje připojení různých velikostí hadic a nástavců k vysavači.",
    fullDescriptionCs: "Jednoduchý a funkční redukční adaptér, který umožňuje připojení různých velikostí hadic a nástavců k vysavači. Byl navržen na základě potřeby propojit dvě různé velikosti hadic - 32mm na 35mm průměr. Díky přesnému návrhu drží adaptér těsně bez potřeby lepení nebo jiného upevnění. Skvěle demonstruje praktické použití 3D tisku pro řešení běžných domácích problémů. Tisk zabral přibližně 30 minut.",
    categoryCs: "Funkční díl",
    durationCs: "30 minut",
    softwareCs: ["Fusion 360", "PrusaSlicer"],
    technologiesCs: ["Funkční design"],
    specsCs: [
      { label: "Materiály", value: "PLA" },
      { label: "Typ tisku", value: "FDM" },
      { label: "Časová náročnost", value: "30 minut" },
      { label: "Účel", value: "Domácí náhradní díl" },
      { label: "Technologie", value: "3D tisk" }
    ]
  },
  {
    id: "kite-parts",
    titleCs: "Díly pro draka",
    descriptionCs: "Vlastní náhradní díly pro draka vytištěné na 3D tiskárně, které nahradily originální zlomené komponenty.",
    fullDescriptionCs: "Vlastní náhradní díly pro draka vytištěné na 3D tiskárně, které nahradily originální zlomené komponenty. Originální plastové spojovací díly draka se zlomily během používání, a protože nebyly k dispozici náhradní díly, navrhl jsem vlastní vyztužené verze. Nové díly jsou silnější a odolnější než originály. Design zahrnuje přesné rozměry pro perfektní pasování a vyztužené oblasti pro lepší odolnost proti zlomení. Celkem bylo vytištěno 8 různých dílů.",
    categoryCs: "Náhradní díl",
    durationCs: "2 hodiny",
    softwareCs: ["Fusion 360", "PrusaSlicer"],
    technologiesCs: ["Funkční design", "Zpětné inženýrství"],
    specsCs: [
      { label: "Materiály", value: "PETG" },
      { label: "Typ tisku", value: "FDM" },
      { label: "Časová náročnost", value: "2 hodiny" },
      { label: "Účel", value: "Náhradní díly" },
      { label: "Technologie", value: "3D tisk" }
    ]
  },
  {
    id: "sporilov-architectural-model",
    titleCs: "Architektonický model Spořilova",
    descriptionCs: "Detailní architektonický model městské části Spořilov vytvořený pro školní projekt urbanistické studie.",
    fullDescriptionCs: "Detailní architektonický model městské části Spořilov vytvořený pro školní projekt urbanistické studie. Model zahrnuje budovy, silnice, vegetaci a další městské prvky v měřítku 1:1000. Projekt byl vytvořen v týmu tří lidí pro předmět Základy urbanismu. Model demonstruje současnou urbanistickou strukturu oblasti a byl použit jako základ pro studii možných budoucích změn a zlepšení. Všechny budovy byly 3D modelovány na základě skutečných plánů a poté vytištěny. Celková velikost modelu je 40x40 cm.",
    categoryCs: "Architektonický model",
    durationCs: "2 týdny",
    softwareCs: ["Fusion 360", "PrusaSlicer", "SketchUp"],
    technologiesCs: ["Architektonické modelování", "Urbanismus"],
    specsCs: [
      { label: "Materiály", value: "PLA" },
      { label: "Typ tisku", value: "FDM" },
      { label: "Časová náročnost", value: "2 týdny" },
      { label: "Účel", value: "Školní projekt, studie" },
      { label: "Technologie", value: "3D tisk, architektonické modelování" }
    ]
  },
  {
    id: "prokopske-udoli-model",
    titleCs: "Model Prokopského údolí",
    descriptionCs: "Topografický model přírodní rezervace Prokopské údolí vytvořený pro vzdělávací účely.",
    fullDescriptionCs: "Topografický model přírodní rezervace Prokopské údolí vytvořený pro vzdělávací účely. Model zobrazuje detailní topografii oblasti včetně vrstevnic, vodních toků a lesních ploch. Byl vytvořen na základě reálných geodetických dat a GIS map. Každá vrstva představuje nadmořskou výšku v intervalu 5 metrů. Model slouží jako učební pomůcka pro pochopení krajinného reliéfu a geografie oblasti. Celková velikost modelu je 30x40 cm a zahrnuje více než 30 vrstev PLA materiálu.",
    categoryCs: "Topografický model",
    durationCs: "1 týden",
    softwareCs: ["QGIS", "Blender", "PrusaSlicer"],
    technologiesCs: ["GIS", "Topografické modelování"],
    specsCs: [
      { label: "Materiály", value: "PLA" },
      { label: "Typ tisku", value: "FDM" },
      { label: "Časová náročnost", value: "1 týden" },
      { label: "Účel", value: "Vzdělávací model" },
      { label: "Technologie", value: "3D tisk, GIS" }
    ]
  },
  {
    id: "team-keychain",
    titleCs: "Týmová klíčenka",
    descriptionCs: "Vlastní design klíčenky pro týmové členstvo s gravírovaným logem.",
    fullDescriptionCs: "Vlastní design klíčenky pro týmové členstvo s gravírovaným logem. Klíčenka byla navržena jako dárek pro členy týmu a obsahuje logo týmu, jméno člena a rok. Design využívá vícebarevný tisk (dual extrusion) pro kontrast loga a textu. Klíčenka je odolná a praktická díky použití PETG materiálu. Celkem bylo vytištěno 15 kusů pro všechny členy týmu. Rozm��ry: 60x30x5 mm.",
    categoryCs: "Produktový design",
    durationCs: "1 hodina",
    softwareCs: ["Fusion 360", "PrusaSlicer"],
    technologiesCs: ["Multi-color print"],
    specsCs: [
      { label: "Materiály", value: "PETG" },
      { label: "Typ tisku", value: "FDM" },
      { label: "Časová náročnost", value: "1 hodina" },
      { label: "Účel", value: "Týmový merch" },
      { label: "Technologie", value: "3D tisk, multi-color" }
    ]
  }
];

export async function fillCzechTranslations(adminToken: string, projectId: string, publicAnonKey: string) {
  try {
    const response = await fetch(
      `https://${projectId}.supabase.co/functions/v1/make-server-635fd90e/admin/projects/update-czech-translations`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`,
          'X-Admin-Token': adminToken,
        },
        body: JSON.stringify({ translations: czechTranslations }),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to update translations');
    }

    const result = await response.json();
    console.log('✅ Czech translations updated:', result);
    return result;
  } catch (error) {
    console.error('❌ Error updating Czech translations:', error);
    throw error;
  }
}