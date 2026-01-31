/**
 * Normative Registry - Baza de date cu normative și reglementări pentru centre de date
 * 
 * Conține standarde internaționale (ASHRAE, TIA-942, EN 50600, Uptime Institute)
 * și normative românești relevante pentru proiectarea centrelor de date.
 */

export type NormativeSource = 'ASHRAE' | 'TIA-942' | 'EN-50600' | 'Uptime' | 'Romanian' | 'IEEE';

export type NormativeCategory =
    | 'thermal'      // Climatizare, temperatură, umiditate
    | 'electrical'   // Instalații electrice, UPS, generatoare
    | 'fire'         // Securitate la incendiu
    | 'infrastructure' // Construcții, structură, fundații
    | 'cabling'      // Cablaje, trasee, rack-uri
    | 'redundancy'   // Disponibilitate, redundanță, SLA
    | 'hvac'         // Ventilare, aer condiționat
    | 'security'     // Securitate fizică și acces
    | 'power'        // Alimentare electrică, distribuție
    | 'cooling';     // Răcire, chillere, free cooling

export interface NormativeEntry {
    id: string;
    code: string;
    title: string;
    source: NormativeSource;
    category: NormativeCategory;
    keywords: string[];
    summary: string;
    content: string;
    year?: number;
    url?: string;
    articles?: NormativeArticle[];
}

export interface NormativeArticle {
    id: string;
    title: string;
    content: string;
    keywords: string[];
}

export const normativeRegistry: NormativeEntry[] = [
    // ============================================================================
    // ASHRAE - Thermal Guidelines
    // ============================================================================
    {
        id: 'ashrae-tc-9.9-a1',
        code: 'ASHRAE TC 9.9 - Clasa A1',
        title: 'Condiții de mediu recomandate - Clasa A1',
        source: 'ASHRAE',
        category: 'thermal',
        year: 2021,
        keywords: ['temperatură', 'umiditate', 'punct de rouă', 'climate', 'server', 'rack', 'răcire', 'cooling', 'server room', 'sala calculatoare', 'datacentru', 'mediu ambiant'],
        summary: 'Definește condițiile de mediu recomandate pentru echipamentele IT clasa A1 (majoritatea serverelor enterprise).',
        content: `CLASE DE MEDIU ASHRAE
    
Clasa A1 (Recomandat pentru servere enterprise):
- Temperatură aer admisie: 18°C - 27°C (recomandat)
- Extindere permisă: 15°C - 32°C
- Umiditate relativă: 8% - 80% (fără condensare)
- Punct de rouă maxim: 17°C
- Rată maximă schimbare temperatură: 5°C/h

Clasa A2 (Extinsă):
- Temperatură: 10°C - 35°C
- Umiditate: 8% - 80%
- Altitudine maximă: 3050m

Clasa A3/A4 (Permisivă):
- Temperatură: 5°C - 45°C
- Pentru echipamente certificate specific`,
        articles: [
            {
                id: 'ashrae-a1-temp',
                title: 'Temperatura de operare',
                content: 'Temperatura aerului la admisia echipamentelor IT trebuie menținută între 18°C și 27°C pentru performanță optimă. Temperaturile sub 18°C pot cauza probleme de condensare, în timp ce temperaturile peste 27°C pot reduce durata de viață a componentelor.',
                keywords: ['temperatură', 'admisie', 'server', 'răcire']
            },
            {
                id: 'ashrae-a1-humidity',
                title: 'Umiditatea relativă',
                content: 'Umiditatea relativă trebuie menținută între 40% și 60% pentru condiții optime. La valori sub 30% crește riscul de descărcări electrostatice. La valori peste 80% apare riscul de condensare și coroziune.',
                keywords: ['umiditate', 'condensare', 'electrostatică', 'coroziune']
            }
        ]
    },
    {
        id: 'ashrae-hot-cold-aisle',
        code: 'ASHRAE - Hot/Cold Aisle',
        title: 'Configurația culoarelor calde și reci',
        source: 'ASHRAE',
        category: 'cooling',
        year: 2021,
        keywords: ['culoar cald', 'culoar rece', 'hot aisle', 'cold aisle', 'containment', 'separare', 'flux aer', 'rack', 'aranjament', 'eficiență răcire'],
        summary: 'Best practices pentru aranjamentul rack-urilor și gestionarea fluxului de aer.',
        content: `CONFIGURAȚIA HOT AISLE / COLD AISLE

Principii fundamentale:
1. Fețele frontale ale rack-urilor se orientează spre culoarul rece
2. Fețele posterioare se orientează spre culoarul cald
3. Aerul rece intră frontal, aerul cald iese posterior

Dimensiuni recomandate culoare:
- Culoar rece: minimum 1.2m (recomandat 1.5m)
- Culoar cald: minimum 1.0m (recomandat 1.2m)
- Pentru acces mentenanță: minimum 1.0m frontal și posterior

Containment (Izolare culoare):
- Cold Aisle Containment (CAC): Izolează culoarul rece
  - Reduce bypass aer
  - Eficiență îmbunătățită 20-30%
  
- Hot Aisle Containment (HAC): Izolează culoarul cald
  - Temperatura ambiantă normală în sala
  - Preferată pentru siguranța personalului

Distanțe între rack-uri:
- Minimal în rând: 0mm (pot fi adiacente)
- Între fețele rack-urilor: ≥1200mm
- Spațiu lateral pentru cablaje: 150-300mm`,
        articles: [
            {
                id: 'ashrae-containment',
                title: 'Containment - Izolarea culoarelor',
                content: 'Izolarea culoarelor (containment) poate îmbunătăți eficiența răcirii cu 20-30%. Cold Aisle Containment izolează culoarul rece folosind uși și acoperiș. Hot Aisle Containment izolează culoarul cald, permițând temperatură ambiantă normală în restul sălii.',
                keywords: ['containment', 'izolare', 'eficiență', 'răcire']
            }
        ]
    },
    {
        id: 'ashrae-pue',
        code: 'ASHRAE - PUE',
        title: 'Power Usage Effectiveness (PUE)',
        source: 'ASHRAE',
        category: 'power',
        year: 2021,
        keywords: ['pue', 'eficiență', 'energie', 'consum', 'power', 'kw', 'datacenter', 'green', 'sustenabilitate', 'eficiență energetică'],
        summary: 'Metrica standard pentru eficiența energetică a centrelor de date.',
        content: `POWER USAGE EFFECTIVENESS (PUE)

Formula:
PUE = Energia totală datacenter / Energia echipamente IT

Clasificare PUE:
- PUE 3.0+: Ineficient (datacenter vechi)
- PUE 2.0-3.0: Sub medie
- PUE 1.4-2.0: Eficiență medie
- PUE 1.2-1.4: Eficient
- PUE 1.1-1.2: Foarte eficient
- PUE <1.1: World-class (Google, Facebook)

Componente consum non-IT:
1. Răcire (HVAC): 30-50% din overhead
2. UPS și distribuție: 10-15%
3. Iluminat și sisteme auxiliare: 5-10%

Strategii reducere PUE:
- Free cooling (aer exterior)
- Economizere apă
- UPS cu randament ridicat (>95%)
- Temperatură admisie mai mare (până la 27°C)
- Virtualizare și consolidare servere`
    },

    // ============================================================================
    // TIA-942 - Infrastructure Design
    // ============================================================================
    {
        id: 'tia-942-clearances',
        code: 'TIA-942 Secțiunea 5.3',
        title: 'Spații libere și dimensiuni minime',
        source: 'TIA-942',
        category: 'infrastructure',
        year: 2017,
        keywords: ['distanță', 'rack', 'spațiu', 'coridor', 'acces', 'mentenanță', 'clearance', 'dimensiuni', 'layout', 'aranjament'],
        summary: 'Cerințe pentru distanțele minime în sala de echipamente IT.',
        content: `SPAȚII LIBERE ȘI ACCES - TIA-942

Dimensiuni minime culoare:
- Culoar de lucru (față rack): ≥1000mm
- Culoar hot aisle: ≥1000mm
- Culoar pentru acces echipament mare: ≥1200mm
- Recomandat pentru mentenanță: ≥1200mm

Rack-uri și cabinete:
- Distanța minimă față-spate între rack-uri: 1000mm
- Spațiu lateral pentru cablare: 150mm minim
- Înălțime rack standard: 42U (2m)
- Adâncime rack: 1000-1200mm
- Lățime rack standard: 600mm sau 800mm

Uși și căi de acces:
- Lățime ușă principală: ≥1100mm (dublu: 2200mm)
- Înălțime ușă: ≥2400mm
- Praguri: evitate sau rampe max 6%
- Încărcare podea: ≥12 kN/m²

Zone servicii:
- Platformă de livrare: 4x4m minim
- Camera UPS: proximitate sala IT
- Camera generatoare: acces exterior pentru combustibil`,
        articles: [
            {
                id: 'tia-rack-spacing',
                title: 'Distanțe între rack-uri',
                content: 'Distanța minimă între fețele rack-urilor trebuie să fie de minimum 1000mm pentru a permite accesul personalului. Pentru mentenanță și înlocuire echipamente, se recomandă minimum 1200mm. Rack-urile pot fi adiacente lateral (0mm), dar se recomandă 50-100mm pentru cablare.',
                keywords: ['rack', 'distanță', 'spațiu', 'mentenanță']
            },
            {
                id: 'tia-floor-loading',
                title: 'Încărcare podea',
                content: 'Podeaua tehnică trebuie să suporte minimum 12 kN/m² pentru sarcină distribuită. Pentru rack-uri grele (>1000kg), se recomandă 15 kN/m² sau suporți suplimentari. Verificați întotdeauna greutatea echipamentelor IT încărcate complet.',
                keywords: ['podea', 'încărcare', 'greutate', 'rack']
            }
        ]
    },
    {
        id: 'tia-942-cabling',
        code: 'TIA-942 Secțiunea 6',
        title: 'Sisteme de cablare structurată',
        source: 'TIA-942',
        category: 'cabling',
        year: 2017,
        keywords: ['cablare', 'fibră', 'utp', 'patch', 'traseu', 'cablaj', 'rețea', 'backbone', 'horizontal', 'pathway'],
        summary: 'Cerințe pentru infrastructura de cablare în centre de date.',
        content: `CABLARE STRUCTURATĂ - TIA-942

Topologie:
- Entrance Room (ER): punct de intrare operatori
- Main Distribution Area (MDA): distribuție principală
- Horizontal Distribution Area (HDA): distribuție zone
- Zone Distribution Area (ZDA): distribuție locală
- Equipment Distribution Area (EDA): rack-uri

Tipuri cabluri:
- Backbone: Fibră optică OM4/OS2
- Horizontal: Cat6A minim (10Gbps)
- Patch-uri: Lungime maximă 5m recomandată

Lungimi maxime:
- Horizontal copper: 90m permanent + 10m patch
- Fibră OM4: 150m (40G), 100m (100G)
- Fibră OS2: 10km single-mode

Căi de cabluri:
- Înălțime minimă jgheab: 200mm
- Umplere maximă: 40% inițial, 60% maxim
- Separare alimentare/date: minim 150mm sau ecranare
- Rază de curbură: 10x diametrul cablului

Etichetare obligatorie:
- Fiecare cablu la ambele capete
- Patch panel-uri și porturi
- Trasee și jgheaburi`,
        articles: [
            {
                id: 'tia-fiber',
                title: 'Specificații fibră optică',
                content: 'Pentru backbone se recomandă fibră optică OM4 (multimod) pentru distanțe până la 150m la 40Gbps sau OS2 (single-mode) pentru distanțe lungi. Toate terminațiile trebuie să fie LC duplex sau MPO pentru densitate mare.',
                keywords: ['fibră', 'optică', 'backbone', 'multimod', 'single-mode']
            }
        ]
    },

    // ============================================================================
    // EN 50600 - European Datacenter Standard
    // ============================================================================
    {
        id: 'en50600-availability',
        code: 'EN 50600-1',
        title: 'Clase de disponibilitate',
        source: 'EN-50600',
        category: 'redundancy',
        year: 2019,
        keywords: ['disponibilitate', 'availability', 'clasă', 'tier', 'redundanță', 'uptime', 'sla', 'downtime', 'mentenanță'],
        summary: 'Clasificarea europeană a centrelor de date după disponibilitate.',
        content: `CLASE DE DISPONIBILITATE - EN 50600-1

Clasa 1 - Disponibilitate de bază:
- Fără redundanță (N)
- Mentenanță = downtime planificat
- Uptime: ~99.67% (aprox. 29h downtime/an)
- Aplicații: dezvoltare, test

Clasa 2 - Componente redundante:
- Redundanță N+1 pe componente critice
- Mentenanță parțială fără downtime
- Uptime: ~99.75%
- Aplicații: business non-critic

Clasa 3 - Mentenanță concurentă:
- Redundanță N+1 sau 2N pe trasee
- Mentenanță completă fără downtime
- Uptime: ~99.98% (aprox. 1.6h/an)
- Aplicații: business critic

Clasa 4 - Toleranță la defecte:
- Redundanță 2N pe toate sistemele
- Compartimentare (fire, structural)
- Uptime: ~99.99% (aprox. 0.8h/an)
- Aplicații: misiune critică, financiar

Componentele evaluate:
- Alimentare electrică
- Răcire
- Securitate fizică
- Sisteme de cablare
- Protecție la incendiu`,
        articles: [
            {
                id: 'en-n-redundancy',
                title: 'Tipuri de redundanță',
                content: 'N = capacitate de bază fără rezervă. N+1 = o componentă de rezervă pentru N active. 2N = capacitate dublă, două sisteme independente. 2(N+1) = două sisteme fiecare cu rezervă proprie.',
                keywords: ['redundanță', 'N+1', '2N', 'rezervă', 'capacitate']
            }
        ]
    },
    {
        id: 'en50600-protection',
        code: 'EN 50600-2-5',
        title: 'Sisteme de securitate',
        source: 'EN-50600',
        category: 'security',
        year: 2019,
        keywords: ['securitate', 'acces', 'control', 'cctv', 'supraveghere', 'perimetru', 'badge', 'biometric', 'intruziune'],
        summary: 'Cerințe pentru securitatea fizică a centrelor de date.',
        content: `SECURITATE FIZICĂ - EN 50600-2-5

Niveluri de securitate (Protection Classes):

Clasa 1 - Protecție de bază:
- Control acces cu cheie sau card simplu
- Supraveghere video zonată
- Înregistrare evenimente 30 zile

Clasa 2 - Securitate sporită:
- Control acces multi-factor (card + PIN)
- CCTV continuu cu înregistrare
- Monitorizare perimetru
- Retenție înregistrări 90 zile

Clasa 3 - Securitate înaltă:
- Biometric + card + PIN
- Mantrap (sas securitate)
- Detecție intruziune activă
- Gardă umană 24/7
- Audit trail complet

Clasa 4 - Maximum securitate:
- Verificare background personal
- Escortă obligatorie vizitatori
- Scanare vehicule
- Protecție anti-vehicul (bollards)

Zone de securitate:
1. Perimetru exterior
2. Zonă recepție
3. Zona operațională
4. Sala IT (acces restrictiv)
5. Zona critică (acces foarte restrictiv)`
    },

    // ============================================================================
    // Uptime Institute - Tier Classification
    // ============================================================================
    {
        id: 'uptime-tier1',
        code: 'Uptime Tier I',
        title: 'Tier I - Infrastructură de bază',
        source: 'Uptime',
        category: 'redundancy',
        year: 2020,
        keywords: ['tier', 'tier 1', 'basic', 'disponibilitate', 'uptime', 'redundanță', 'infrastructură'],
        summary: 'Cerințe pentru certificare Uptime Institute Tier I.',
        content: `UPTIME TIER I - INFRASTRUCTURĂ DE BAZĂ

Disponibilitate: 99.671% (28.8h downtime/an)

Caracteristici:
- Cale de distribuție unică pentru alimentare și răcire
- Fără componente redundante
- Susceptibil la perturbări din cauza activităților planificate și neplanificate

Cerințe minime:
- Spațiu dedicat pentru echipamentele IT
- UPS pentru bypass-ul golurilor de tensiune
- Generator pentru întreruperi prelungite
- Podea tehnică nu este obligatorie

Aplicații tipice:
- Afaceri mici
- Site-uri de dezvoltare/test
- Backup secundar

Deficiențe acceptate:
- Oprire completă pentru mentenanță anuală
- Vulnerabilitate la erori operaționale`
    },
    {
        id: 'uptime-tier2',
        code: 'Uptime Tier II',
        title: 'Tier II - Componente redundante',
        source: 'Uptime',
        category: 'redundancy',
        year: 2020,
        keywords: ['tier', 'tier 2', 'tier ii', 'redundant', 'disponibilitate', 'uptime', 'n+1'],
        summary: 'Cerințe pentru certificare Uptime Institute Tier II.',
        content: `UPTIME TIER II - COMPONENTE REDUNDANTE

Disponibilitate: 99.741% (22.7h downtime/an)

Caracteristici:
- Cale de distribuție unică
- Componente redundante (N+1)
- Mai puțin susceptibil la perturbări

Cerințe minime:
- UPS și generatoare N+1
- Sisteme de răcire N+1
- Podea tehnică recomandată
- Sistem de detecție incendiu

Redundanță tipică:
- UPS: N+1 module
- Generatoare: N+1
- Chillere: N+1
- CRAC/CRAH: N+1

Îmbunătățiri față de Tier I:
- Mentenanță componente fără oprire completă
- Buffer mai mare la incidente punctuale
- Costuri moderate suplimentare`
    },
    {
        id: 'uptime-tier3',
        code: 'Uptime Tier III',
        title: 'Tier III - Mentenanță concurentă',
        source: 'Uptime',
        category: 'redundancy',
        year: 2020,
        keywords: ['tier', 'tier 3', 'tier iii', 'concurrent', 'mentenanță', 'disponibilitate', 'uptime', '2n'],
        summary: 'Cerințe pentru certificare Uptime Institute Tier III.',
        content: `UPTIME TIER III - MENTENANȚĂ CONCURENTĂ

Disponibilitate: 99.982% (1.6h downtime/an)

Caracteristici:
- Căi de distribuție multiple (activ/pasiv)
- Toate componentele redundante
- Mentenanță fără impact asupra operării

Cerințe obligatorii:
- Alimentări electrice duale până la rack
- Trasee de răcire redundante
- 2N pe UPS sau minim N+1 cu bypass
- Generatoare redundante cu comutare automată
- Detectare și stingere incendiu
- 12 ore autonomie combustibil minim

Operațional:
- STS (Static Transfer Switch) pentru comutare
- Personal 24/7 nu este obligatoriu
- Monitorizare BMS obligatorie

Beneficii cheie:
- Zero downtime pentru mentenanță planificată
- Rapid recovery după incidente simple`
    },
    {
        id: 'uptime-tier4',
        code: 'Uptime Tier IV',
        title: 'Tier IV - Toleranță la defecte',
        source: 'Uptime',
        category: 'redundancy',
        year: 2020,
        keywords: ['tier', 'tier 4', 'tier iv', 'fault tolerant', 'toleranță', 'defecte', 'disponibilitate', 'uptime', '2n+1', 'critic'],
        summary: 'Cerințe pentru certificare Uptime Institute Tier IV.',
        content: `UPTIME TIER IV - TOLERANȚĂ LA DEFECTE

Disponibilitate: 99.995% (26 minute downtime/an)

Caracteristici:
- Căi de distribuție multiple active simultan
- Compartimentare completă (zone independente)
- Toleranță la orice defect unic
- Izolare la eveniment "worst case"

Cerințe obligatorii:
- 2(N+1) sau 2N pe toate sistemele critice
- Compartimentare fizică (foc, apă, structură)
- Alimentări electrice independente la rack
- Generatoare cu transfer automat sub 10s
- Sisteme de stingere zone multiple
- 12 ore minim autonomie combustibil
- Personal calificat 24/7 obligatoriu

Izolare compartimente:
- Minim 2 zone electrice independente
- Minim 2 zone mecanice independente
- Trasee cabluri separate fizic
- Protecție la incendiu compartimentată

Costuri și aplicații:
- Investiție de 2-3x față de Tier III
- Bănci, burse, infrastructură critică
- Aplicații life-safety și militare`
    },

    // ============================================================================
    // NORMATIVE ROMÂNEȘTI
    // ============================================================================
    {
        id: 'i7-2011',
        code: 'Normativ I7/2011 (actualizat 2023)',
        title: 'Proiectarea și execuția instalațiilor electrice aferente clădirilor',
        source: 'Romanian',
        category: 'electrical',
        year: 2023,
        keywords: ['electric', 'instalații', 'cablu', 'protecție', 'priză', 'tablou', 'împământare', 'curent', 'tensiune', 'siguranță', 'selectivitate', 'TN-S', 'IT'],
        summary: 'Normativul național complet pentru instalații electrice în clădiri - include cerințe speciale pentru centre de date și echipamente IT critice.',
        content: `NORMATIV I7/2011 (actualizat 2023) - INSTALAȚII ELECTRICE

═══════════════════════════════════════════════════════════
CAP. 1 - CLASIFICARE ÎNCĂPERI ȘI MEDII
═══════════════════════════════════════════════════════════

1.1 Clasificare generală (Art. 1.3):
┌────────────────┬───────────────────────────────────────────────┐
│ Categoria      │ Descriere                                     │
├────────────────┼───────────────────────────────────────────────┤
│ A (BE3a)       │ Pericol de explozie (gaze, vapori)            │
│ B (BE2)        │ Pericol de incendiu                           │
│ C (normal)     │ Încăperi normale, uscate                      │
│ D (AD4-AD8)    │ Umede, ude, exterioare                        │
│ E (AF2-AF4)    │ Corozive (substanțe chimice)                  │
└────────────────┴───────────────────────────────────────────────┘

1.2 Clasificări specifice datacenter:
- Sala servere: Categoria C (normal) cu condiții speciale
- Camera UPS cu baterii VRLA: Categoria C cu ventilare
- Camera baterii deschise: Categoria A (BE3a - hidrogen)
- Camera generator: Categoria B (pericol incendiu)
- Camera transformatoare ulei: Categoria B

1.3 Cerințe pentru categoria C cu condiții speciale:
- Temperatură: 15-35°C
- Umiditate relativă: 30-70%
- Praf conduc: absent
- Vibrații: minime

═══════════════════════════════════════════════════════════
CAP. 2 - ALIMENTARE CU ENERGIE ELECTRICĂ
═══════════════════════════════════════════════════════════

2.1 Categorii de consumatori (Art. 2.1):

CATEGORIA I - FOARTE IMPORTANȚI:
Cerință: Alimentare neîntreruptă (0 secunde)
Aplicare: Centre de date, săli de operații
Soluție obligatorie:
- UPS online dubla conversie
- Generator diesel cu ATS (<10s pornire)
- Alimentare din 2 surse independente (opțional)

CATEGORIA II - IMPORTANȚI:
Cerință: Întrerupere max 15-30 minute
Aplicare: Clădiri publice, industrie
Soluție: Generator sau alimentare rezervă

CATEGORIA III - NORMALI:
Cerință: Fără restricții speciale
Aplicare: Rezidențial, comerț

2.2 Scheme de alimentare pentru datacenter:

Tier I-II: Alimentare simplă + UPS + Generator
┌─────────────────────────────────────────────────────────┐
│ Rețea → TGBT → UPS → PDU → Rack-uri                    │
│           ↓                                             │
│      Generator (backup)                                 │
└─────────────────────────────────────────────────────────┘

Tier III-IV: Alimentare duală redundantă
┌─────────────────────────────────────────────────────────┐
│ Rețea A → TGBT-A → UPS-A → PDU-A ─┬─→ Rack (dual cord) │
│                                    │                    │
│ Rețea B → TGBT-B → UPS-B → PDU-B ─┘                    │
│     ↓          ↓                                        │
│   Gen-A      Gen-B                                      │
└─────────────────────────────────────────────────────────┘

2.3 Tensiuni de alimentare (Art. 2.3):
- Joasă tensiune: 230V (fază-neutru), 400V (între faze)
- Toleranță: ±10% (±5% pentru IT sensibil)
- Frecvență: 50Hz ±1%

═══════════════════════════════════════════════════════════
CAP. 3 - PROTECȚII ELECTRICE
═══════════════════════════════════════════════════════════

3.1 Protecție la supracurent (Art. 3.1):

Tipuri de dispozitive:
- Întrerupătoare automate (MCCB, MCB)
- Siguranțe fuzibile (gL/gG, aM)

Caracteristici curbe întrerupătoare:
┌────────────┬───────────────────────────────────────────┐
│ Curbă      │ Aplicare                                  │
├────────────┼───────────────────────────────────────────┤
│ B          │ Circuite rezistive, cabluri lungi        │
│ C          │ Standard - iluminat, prize               │
│ D          │ Motoare, transformatoare, UPS            │
│ K          │ Sarcini cu curenți de pornire mari       │
└────────────┴───────────────────────────────────────────┘

3.2 Selectivitate (Art. 3.2):

OBLIGATORIE pentru datacenter (continuitate serviciu).

Tipuri de selectivitate:
a) Ampermetrică: În aval << În amonte
b) Cronometrică: Întârzieri etajate
c) Energetică: Limitarea energiei de arc

Cerințe minime:
- Între TGBT și tablou secundar: selectivitate totală
- Între tablou și PDU: selectivitate totală
- La nivel rack: selectivitate parțială acceptabilă

3.3 Protecție diferențială (Art. 3.3):

Tipuri dispozitive RCD:
┌────────────┬────────────┬───────────────────────────────┐
│ Tip        │ Sensibil.  │ Aplicare                      │
├────────────┼────────────┼───────────────────────────────┤
│ AC         │ 30mA       │ Prize casnice                 │
│ A          │ 30mA       │ Echipam. cu electronice       │
│ B          │ 30-300mA   │ UPS, VFD, convertoare DC (*) │
│ B+         │ 300mA      │ Circuite IT critice           │
└────────────┴────────────┴───────────────────────────────┘
(*) TIP B OBLIGATORIU pentru UPS și echipamente cu redresoare!

Excepții datacenter (Art. 3.3.5):
- Circuite IT sub 63A: permite 300mA în loc de 30mA
- Condiție: sistem TN-S și cabluri LSZH

3.4 Putere de rupere (Art. 3.4):

Calcul curent scurtcircuit trifazat:
Ik3 = 1.1 × Un / (√3 × Zk)

Putere de rupere necesară:
- La TGBT datacenter: >50 kA tipic
- La tablou secundar: >25 kA tipic
- La PDU: >10 kA

3.5 Protecție la supratensiuni - SPD (Art. 3.5):

Conform IEC 61643-11, în cascadă:
┌────────────────┬────────────┬────────────┬──────────────┐
│ Nivel          │ Locație    │ Tip SPD    │ Up (kV)      │
├────────────────┼────────────┼────────────┼──────────────┤
│ Principal      │ TGBT       │ Tip 1+2    │ ≤2.5         │
│ Distribuție    │ Tablou sec │ Tip 2      │ ≤1.5         │
│ Final          │ PDU/rack   │ Tip 3      │ ≤1.0         │
└────────────────┴────────────┴────────────┴──────────────┘

═══════════════════════════════════════════════════════════
CAP. 4 - DIMENSIONARE CABLURI
═══════════════════════════════════════════════════════════

4.1 Criterii de dimensionare (Art. 4.1):

1. Curent de sarcină: Ib ≤ In ≤ Iz
2. Cădere de tensiune: conform tabel 4.2
3. Curent scurtcircuit: verificare la t=0.1-5s
4. Încălzire admisibilă: 70°C PVC, 90°C XLPE

4.2 Cădere de tensiune maximă (Art. 4.2):
┌────────────────────────────┬───────────────────────────┐
│ Circuit                    │ ΔU% max                   │
├────────────────────────────┼───────────────────────────┤
│ Circuite iluminat          │ 3%                        │
│ Circuite forță             │ 5%                        │
│ Circuite IT (datacenter)   │ 2% (de la UPS la rack)   │
│ Circuite motoare pornire   │ 15% la pornire           │
└────────────────────────────┴───────────────────────────┘

4.3 Secțiuni minime (Art. 4.3):
┌────────────────────────────┬────────────┬──────────────┐
│ Circuit                    │ Cu         │ Al           │
├────────────────────────────┼────────────┼──────────────┤
│ Iluminat                   │ 1.5 mm²    │ Nu se admite │
│ Prize                      │ 2.5 mm²    │ Nu se admite │
│ Circuite forță             │ 4 mm²      │ 16 mm²       │
│ Coloană principală         │ 10 mm²     │ 16 mm²       │
└────────────────────────────┴────────────┴──────────────┘

4.4 Capacități de transport - Cupru XLPE (Art. 4.4):

Instalare: jgheab perforat, temperatura ambiantă 30°C
┌────────────┬────────────┬────────────┬────────────────┐
│ Secțiune   │ 3 cabluri  │ 6 cabluri  │ 9 cabluri      │
├────────────┼────────────┼────────────┼────────────────┤
│ 10 mm²     │ 57 A       │ 50 A       │ 46 A           │
│ 16 mm²     │ 76 A       │ 66 A       │ 61 A           │
│ 25 mm²     │ 99 A       │ 86 A       │ 79 A           │
│ 35 mm²     │ 125 A      │ 109 A      │ 100 A          │
│ 50 mm²     │ 151 A      │ 132 A      │ 121 A          │
│ 70 mm²     │ 192 A      │ 167 A      │ 154 A          │
│ 95 mm²     │ 232 A      │ 202 A      │ 186 A          │
│ 120 mm²    │ 269 A      │ 234 A      │ 215 A          │
│ 150 mm²    │ 309 A      │ 269 A      │ 247 A          │
│ 185 mm²    │ 353 A      │ 307 A      │ 283 A          │
│ 240 mm²    │ 415 A      │ 361 A      │ 332 A          │
└────────────┴────────────┴────────────┴────────────────┘

Factori de corecție temperatură:
- 35°C: 0.94    - 45°C: 0.79
- 40°C: 0.87    - 50°C: 0.71

═══════════════════════════════════════════════════════════
CAP. 5 - SISTEME DE ÎMPĂMÂNTARE ȘI EGALIZARE
═══════════════════════════════════════════════════════════

5.1 Tipuri de sisteme (Art. 5.1):

Pentru datacenter se recomandă TN-S:
┌────────────┬───────────────────────────────────────────┐
│ Sistem     │ Caracteristici                            │
├────────────┼───────────────────────────────────────────┤
│ TN-S (*)   │ PE și N separate, cel mai sigur          │
│ TN-C-S     │ Comun apoi separat, acceptabil           │
│ TT         │ Necesită RCD, mai puțin recomandat       │
│ IT         │ Izolat, pentru continuitate maximă       │
└────────────┴───────────────────────────────────────────┘
(*) OBLIGATORIU pentru circuite IT critice

5.2 Rezistență priză de pământ (Art. 5.2):
- General: < 4 Ω
- Datacenter standard: < 1 Ω
- Datacenter Tier III/IV: < 0.5 Ω
- Cu LPS (protecție trăsnet): < 10 Ω

5.3 Conductoare de protecție PE (Art. 5.3):
┌────────────────────┬───────────────────────────────────┐
│ Secțiune fază      │ Secțiune minimă PE                │
├────────────────────┼───────────────────────────────────┤
│ S ≤ 16 mm²         │ S (egal cu faza)                  │
│ 16 < S ≤ 35 mm²    │ 16 mm²                            │
│ S > 35 mm²         │ S/2                               │
└────────────────────┴───────────────────────────────────┘

5.4 Egalizare potențiale - datacenter (Art. 5.4):

Componente sistem egalizare:
- Bară principală egalizare (MEB): Cu 50×5mm
- Conducte egalizare: min 16 mm² Cu
- Conectări obligatorii:
  □ Toate carcasele metalice rack-uri
  □ Jgheaburi de cabluri
  □ Conducte metalice (apă, HVAC)
  □ Structură podea tehnică
  □ Mase mari (UPS carcasă, generatoare)

Signal Reference Grid (SRG):
- Grilă Cu sub podea tehnică
- Ochiuri: 600×600 mm
- Bandă Cu: 25×3 mm sau cablu 25 mm²
- Conectare fiecare rack la nod apropiat

═══════════════════════════════════════════════════════════
CAP. 6 - TABLOURI ELECTRICE
═══════════════════════════════════════════════════════════

6.1 Grade de protecție (Art. 6.1):
┌────────────────────┬───────────────────────────────────┐
│ Amplasare          │ IP minim                          │
├────────────────────┼───────────────────────────────────┤
│ Interior uscat     │ IP30                              │
│ Interior umed      │ IP44                              │
│ Exterior acoperit  │ IP44                              │
│ Exterior liber     │ IP55                              │
│ Datacenter (sala)  │ IP30 (recomandat IP31)           │
└────────────────────┴───────────────────────────────────┘

6.2 Distanțe de acces (Art. 6.2):
- Față: 800 mm minim (1000 mm recomandat)
- Spate (dacă acces): 600 mm minim
- Lateral: 200 mm minim pentru ventilare
- Înălțime maximă dispozitive: 2000 mm

6.3 Model tablou datacenter (TGBT):

Componente obligatorii:
- Întrerupător general cu protecție diferențială
- Sistem bare Cu sau Al (densitate 1-2 A/mm²)
- Compartimentare faze și PE
- SPD Tip 1+2
- Analizor rețea (PQ)
- Separatoare pentru fiecare circuit

6.4 Documentație obligatorie (Art. 6.4):
- Schemă unifilară actualizată
- Plan tablou cu dispozitive
- Tabel circuite (denumire, In, secțiune)
- Instrucțiuni de operare
- Jurnal intervenții

═══════════════════════════════════════════════════════════
CAP. 7 - PREVEDERI PENTRU CENTRE DE DATE
═══════════════════════════════════════════════════════════

7.1 Cerințe generale IT (Art. 7.1):
- Alimentare duală la fiecare rack (A+B)
- PDU-uri redundante
- Monitorizare consum per rack
- EPO (Emergency Power Off) conform EN 50171

7.2 Distribuția de putere (Art. 7.2):
- PDU overhead: preferat (ventilare mai bună)
- PDU in-row: pentru densități mici/medii
- PDU floor-mounted: doar pentru echipamente speciale

7.3 Densitate de putere (Art. 7.3):
- Densitate mică: < 3 kW/rack
- Densitate medie: 3-10 kW/rack
- Densitate mare: 10-25 kW/rack
- High-performance: > 25 kW/rack (răcire lichidă)

7.4 Calitatea energiei (Art. 7.4):
Conform EN 50160 și IEEE 519:
- THD tensiune: < 8% (< 5% recomandat)
- THD curent: < 20%
- Factor de putere: > 0.92 (penalizări)
- Dezechilibru faze: < 2%`,
        articles: [
            {
                id: 'i7-selectivity',
                title: 'Selectivitate în distribuția electrică',
                content: 'Selectivitatea asigură că la un defect se declanșează doar protecția imediat în amonte, izolând defectul fără a afecta restul instalației. În datacenter, selectivitatea totală este obligatorie pe lanțul TGBT→Tablou→PDU. Se realizează prin întrerupătoare cu întârzieri etajate (selectivitate cronometrică) sau prin coordonare energetică.',
                keywords: ['selectivitate', 'protecție', 'întrerupător', 'coordonare']
            },
            {
                id: 'i7-grounding',
                title: 'Împământarea echipamentelor IT',
                content: 'Pentru centre de date se impune rezistență de împământare sub 1Ω (sub 0.5Ω pentru Tier III/IV). Sistemul TN-S cu separare completă neutru-PE este obligatoriu. Signal Reference Grid (SRG) sub podeaua tehnică formează referință de semnal comună. Toate rack-urile se conectează la barele de egalizare.',
                keywords: ['împământare', 'TN-S', 'SRG', 'egalizare', 'rack']
            },
            {
                id: 'i7-cable-sizing',
                title: 'Dimensionarea cablurilor pentru IT',
                content: 'Căderea de tensiune maximă de la UPS la rack trebuie să fie ≤2%. Pentru circuite cu sarcini nelineare (UPS, servere) se supradimensionează neutrul cu 170%. Cablurile trebuie să fie LSZH pentru reducerea emisiilor toxice la incendiu. Se aplică factori de corecție pentru grupare și temperatură ambiantă.',
                keywords: ['cablu', 'secțiune', 'cădere tensiune', 'LSZH', 'neutru']
            }
        ]
    },
    {
        id: 'p118-fire',
        code: 'P118/1999 + P118-3/2019',
        title: 'Normativ de securitate la incendiu a construcțiilor',
        source: 'Romanian',
        category: 'fire',
        year: 2019,
        keywords: ['incendiu', 'foc', 'evacuare', 'stingere', 'compartimentare', 'rezistență', 'risc', 'ISU', 'PSI', 'securitate', 'VESDA', 'FM-200', 'Novec', 'sprinkler'],
        summary: 'Normativul complet de securitate la incendiu - include P118-3 pentru instalații de stingere - esențial pentru autorizarea centrelor de date.',
        content: `P118/1999 + P118-3/2019 - SECURITATE LA INCENDIU

═══════════════════════════════════════════════════════════
CAP. 1 - CLASIFICARE CONSTRUCȚII ȘI RISC DE INCENDIU
═══════════════════════════════════════════════════════════

1.1 Categorii de pericol de incendiu (Art. 2.1):
┌────────────┬─────────────────┬───────────────────────────┐
│ Categorie  │ Sarcina termică │ Exemple                   │
├────────────┼─────────────────┼───────────────────────────┤
│ A (BE3a)   │ Explozie        │ Depozite gaze, chimicale  │
│ B (BE2)    │ Incendiu mare   │ Depozite combustibili     │
│ C          │ Incendiu mediu  │ Birouri, magazine         │
│ D          │ Incendiu mic    │ Locuințe                  │
│ E          │ Risc neglijabil │ Depozite incombustibile   │
└────────────┴─────────────────┴───────────────────────────┘

1.2 Clasificare spații datacenter:
┌────────────────────────┬────────────┬───────────────────┐
│ Spațiu                 │ Categorie  │ Sarcina termică   │
├────────────────────────┼────────────┼───────────────────┤
│ Sala servere           │ C          │ 420-840 MJ/m²     │
│ Camera UPS (baterii)   │ B/C        │ 500-900 MJ/m²     │
│ Camera generator       │ B          │ >840 MJ/m²        │
│ Camera transformator   │ B          │ >840 MJ/m²        │
│ Coridor tehnic         │ C          │ <420 MJ/m²        │
│ Sala de comandă (NOC)  │ C          │ <420 MJ/m²        │
└────────────────────────┴────────────┴───────────────────┘

1.3 Grade de rezistență la foc clădiri:
┌────────────┬─────────────────────────────────────────────┐
│ Grad       │ Cerințe elemente structurale                │
├────────────┼─────────────────────────────────────────────┤
│ I-II       │ Structură: R 120, Pereți: REI 60-90        │
│ III        │ Structură: R 60, Pereți: REI 30-60         │
│ IV         │ Structură: R 30, Pereți: REI 15-30         │
│ V          │ Fără cerințe speciale                       │
└────────────┴─────────────────────────────────────────────┘

Datacenter: obligatoriu minim Grad II pentru suprafață >500m²

═══════════════════════════════════════════════════════════
CAP. 2 - COMPARTIMENTARE ANTIFOC
═══════════════════════════════════════════════════════════

2.1 Dimensiuni maxime compartimente (Art. 3.2):
┌────────────────────┬──────────────────────────────────────┐
│ Tip clădire        │ Suprafața maximă compartiment        │
├────────────────────┼──────────────────────────────────────┤
│ Industrial categ B │ 1500 m² (sau 750 m² fără sprinklere)│
│ Industrial categ C │ 2500 m² (sau 1250 m² fără sprink.)  │
│ Datacenter Tier IV │ 2000 m² (recomandat zone 500m²)     │
│ Clădire înaltă     │ 2000 m² pe nivel                    │
└────────────────────┴──────────────────────────────────────┘

2.2 Rezistență la foc pereți despărțitori:
┌────────────────────────────┬───────────────────────────────┐
│ Utilizare                  │ Rezistență minimă             │
├────────────────────────────┼───────────────────────────────┤
│ Între compartimente        │ REI 60                        │
│ Casa scării evacuare       │ REI 90                        │
│ Depozit combustibili       │ REI 120                       │
│ Sala servere - coridor     │ REI 60                        │
│ Sala baterii - alte spații │ REI 90                        │
│ Camera generator           │ REI 120 (cu acces extern)     │
└────────────────────────────┴───────────────────────────────┘

2.3 Uși antifoc (Art. 3.4):
- Între compartimente: EI 30 minim (recomandat EI 60)
- Către casa scării: EI 60 cu autoînchidere
- Către exterior: fără cerințe speciale
- Mecanism autoînchidere: obligatoriu pentru toate

2.4 Treceri de cabluri și conducte (Art. 3.6):

OBLIGATORIU pentru toate străpungerile:
- Obturare cu materiale intumescente certificate
- Rezistență egală cu peretele traversat (min REI 60)
- Produse certificate conform EN 13501-2
- Etanșare la fum integral

Soluții acceptate:
- Manșoane intumescente pentru conducte PVC
- Mastic intumescent pentru cabluri
- Plăci rigide pentru goluri mari
- Sistem modular pentru zone cu cabluri multiple

═══════════════════════════════════════════════════════════
CAP. 3 - CĂI DE EVACUARE
═══════════════════════════════════════════════════════════

3.1 Număr minim ieșiri (Art. 4.1):
- <50 persoane: 1 ieșire (dacă distanța <25m)
- 50-100 persoane: minim 2 ieșiri
- >100 persoane: minim 2 ieșiri, capacitate calculată

Datacenter: de obicei 2 ieșiri din sala servere
(chiar dacă ocupație < 50, pentru siguranță)

3.2 Distanțe maxime de evacuare (Art. 4.2):
┌────────────────────────────┬───────────────────────────────┐
│ Situație                   │ Distanță maximă               │
├────────────────────────────┼───────────────────────────────┤
│ La o ieșire (fundătură)    │ 25 m                          │
│ La mai multe ieșiri        │ 40 m                          │
│ Cu sprinklere active       │ +25% (32m / 50m)             │
│ Cu stingere gaz            │ +25% (32m / 50m)             │
└────────────────────────────┴───────────────────────────────┘

3.3 Lățimi minime căi evacuare (Art. 4.3):
- Ușă: 0.9 m minim, 1.2 m recomandat
- Coridor: 1.4 m minim
- Scară: 1.2 m minim
- Rampă: max 8% pantă, suprafață antiderapantă

3.4 Iluminat de securitate (Art. 4.5):
- Nivel minim: 1 lux pe traseu evacuare
- Autonomie: minim 60 minute (90 min pentru datacenter)
- Pictograme illuminate: la fiecare schimbare direcție
- Test lunar obligatoriu: 1/4 din lămpi

═══════════════════════════════════════════════════════════
CAP. 4 - DETECȚIE INCENDIU (P118-3/2019)
═══════════════════════════════════════════════════════════

4.1 Obligativitate detectare automată:
- Datacenter: OBLIGATORIE (categoria C ≥500m²)
- Camera baterii: OBLIGATORIE
- Camera generator: OBLIGATORIE
- Toate spațiile tehnice fără supraveghere permanentă

4.2 Tipuri de detectoare și aplicare:

┌────────────────────┬────────────────────────────────────────┐
│ Tip detector       │ Aplicare                               │
├────────────────────┼────────────────────────────────────────┤
│ Fum punctual       │ Birouri, coridoare, spații normale    │
│ Fum liniar (beam)  │ Hale înalte (>6m înălțime)            │
│ Fum aspirație(*)   │ Datacenter, săli curate, arhive      │
│ Temperatură fixed  │ Bucătării, spații cu fum normal       │
│ Temperatură ROR    │ Depozite, producție                   │
│ Flacără UV/IR      │ Zone cu combustibili lichizi          │
│ Multicriteria      │ Spații cu risc de fals alarmă         │
└────────────────────┴────────────────────────────────────────┘
(*) VESDA sau echivalent - RECOMANDAT pentru datacenter

4.3 Sistem VESDA (Very Early Smoke Detection Apparatus):

Principiu: aspirație activă aer prin țevi perforate
Avantaje pentru datacenter:
- Detecție FOARTE TIMPURIE (înainte de foc vizibil)
- Funcționează în curenți de aer puternici (HVAC)
- Sensibilitate ajustabilă pe 4 nivele
- Monitorizare continuă flux aer

Niveluri alarmă VESDA:
┌──────────────┬─────────────────┬───────────────────────────┐
│ Nivel        │ Sensibilitate   │ Acțiune                   │
├──────────────┼─────────────────┼───────────────────────────┤
│ Alert        │ 0.03-0.08% obs. │ Notificare dispecerat     │
│ Action       │ 0.08-0.15% obs. │ Investigare obligatorie   │
│ Fire 1       │ 0.15-0.25% obs. │ Alarmă, pregătire stingere│
│ Fire 2       │ >0.25% obs.     │ Declanșare automată sist. │
└──────────────┴─────────────────┴───────────────────────────┘

4.4 Densitate detectoare punct (dacă nu VESDA):
- Sala servere sub podea: 1 detector / 20 m²
- Sala servere deasupra rack: 1 detector / 30 m²
- Coridor tehnic: 1 detector / 30 m²
- Sub tavan fals: 1 detector / 25 m²

═══════════════════════════════════════════════════════════
CAP. 5 - SISTEME DE STINGERE (P118-3/2019)
═══════════════════════════════════════════════════════════

5.1 Tipuri sisteme stingere pentru datacenter:

A) STINGERE CU GAZ - PREFERATĂ pentru IT:
┌──────────────────┬──────────────┬───────────────────────────┐
│ Agent            │ ODP / GWP    │ Caracteristici            │
├──────────────────┼──────────────┼───────────────────────────┤
│ FM-200 (HFC-227) │ 0 / 3220     │ Standard, eficient, rapid │
│ Novec 1230       │ 0 / 1        │ Ecologic, premium, scump  │
│ IG-541 (Inergen) │ 0 / 0        │ Natural, durabil, sigur   │
│ IG-55 (Argonite) │ 0 / 0        │ Natural, presiune mare    │
│ CO2              │ 0 / 1        │ Periculos, doar fără oam. │
└──────────────────┴──────────────┴───────────────────────────┘
ODP = Ozone Depletion Potential
GWP = Global Warming Potential

B) SPRINKLERE - Alternativă cu rezerve:
- Tip: Pre-action (dublu interlock) obligatoriu pentru IT
- Avantaj: cost redus, cantitate agent nelimitată
- Dezavantaj: daune apa, risc declanșare falsă
- Recomandare: doar pentru zone non-IT sau ca rezervă

C) WATER MIST - Compromis:
- Picături fine (<1000μm) - daune reduse
- Eficient pentru răcire și înăbușire
- Cost mediu, cantitate agent nelimitată

5.2 Proiectare sistem cu gaz (FM-200 / Novec):

Concentrație de stingere:
- FM-200: 7.0-8.5% (volumetric)
- Novec 1230: 4.5-5.5%
- IG-541: 40-50%

Timp de descărcare:
- FM-200/Novec: <10 secunde (cerință EN)
- Gaze inerte (IG): <60 secunde

Timp menținere concentrație:
- Minim 10 minute post-descărcare
- Verificare etanșeitate încăpere (<0.5 Pa)

Cerințe pentru încăpere:
- Etanșeitate pentru menținere concentrație
- Presiune maximă la descărcare: <1200 Pa
- Clapete suprapresiune sau guri de presiune
- Ventilare post-descărcare (evacuare agent)

5.3 Siguranța personalului:

Agent                | NOAEL    | LOAEL    | Observații
---------------------|----------|----------|------------------
FM-200               | 9%       | 10.5%    | Sigur la conc. stingere
Novec 1230           | 10%      | >10%     | Cel mai sigur
IG-541               | 43%      | 52%      | Sigur (aer + argon)
CO2                  | 4%       | 5%       | PERICULOS - evacuare!

NOAEL = No Observable Adverse Effect Level
LOAEL = Lowest Observable Adverse Effect Level

Obligații de siguranță:
- Prealarmă sonoră și vizuală: minim 30 secunde
- Buton oprire manuală la fiecare ieșire
- Indicatoare "Gaz descărcat" / "Nu intrați"
- Instruire personal: anuală
- Procedura de resetare agent

5.4 Integrare cu alte sisteme:

La alarm incendiu - comandă automată:
□ Oprire HVAC (ventilație)
□ Închidere clapete antifoc
□ Deblocare uși evacuare
□ Pornire iluminat de urgență
□ Deblocare lifturi la parter
□ Notificare dispecerat și ISU (112)

Întârziere stingere (countdown):
- Prealarmă: 30 secunde minim
- Posibilitate anulare manuală în această perioadă
- După 30s: descărcare automată

═══════════════════════════════════════════════════════════
CAP. 6 - MATERIALE ȘI FINISAJE
═══════════════════════════════════════════════════════════

6.1 Clasificare reacție la foc (EN 13501-1):
┌─────────────┬─────────────────────────────────────────────┐
│ Clasa       │ Descriere                                   │
├─────────────┼─────────────────────────────────────────────┤
│ A1          │ Necom­bustibil (beton, metal, sticlă)       │
│ A2          │ Cvasi-necombustibil (gips carton, vată min)│
│ B           │ Contribuție foarte mică la foc              │
│ C           │ Contribuție mică                            │
│ D           │ Contribuție acceptabilă                     │
│ E           │ Contribuție mare                            │
│ F           │ Netestat / neacceptabil                     │
└─────────────┴─────────────────────────────────────────────┘

6.2 Cerințe minime materiale datacenter:
- Podea tehnică: A1 sau A2-s1,d0
- Tavan fals: A2-s1,d0 minim
- Izolații termice: A1-A2 (vată minerală)
- Cabluri: Cca-s1b,d1,a1 minim (B2ca recomandat)
- Fără polistiren expus în sala IT

6.3 Clasificare fum (smoke):
s1 = fum redus, s2 = fum mediu, s3 = fum mare

6.4 Clasificare picături (droplets):
d0 = nicio picătură, d1 = picături rare, d2 = frecvente

═══════════════════════════════════════════════════════════
CAP. 7 - DOCUMENTAȚIE ȘI AUTORIZARE
═══════════════════════════════════════════════════════════

7.1 Scenariul de securitate la incendiu:

Document obligatoriu pentru autorizare construcție.
Conține:
- Identificare și clasificare risc
- Măsuri passive (compartimentare, materiale)
- Măsuri active (detecție, stingere)
- Căi de evacuare
- Organizarea intervenției
- Planuri de evacuare
- Calcule specifice (evacuare, ventilare, stingere)

7.2 Avize și autorizații:
- Aviz ISU (pompieri): pentru autorizație construire
- Autorizație ISU: pentru punere în funcțiune
- Verificare periodică: anuală pentru sisteme active

7.3 Documente obligatorii în exploatare:
- Registru PSI
- Plan de evacuare afișat
- Instrucțiuni de utilizare echipamente
- Contracte mentenanță sisteme
- Documente exerciții evacuare`,
        articles: [
            {
                id: 'p118-vesda',
                title: 'Sistemul VESDA pentru datacenter',
                content: 'VESDA (Very Early Smoke Detection Apparatus) este sistemul recomandat pentru centre de date. Folosește aspirație activă pentru a detecta fumul în stadiu incipient, înainte de aprinderea flăcărilor. Funcționează eficient în curenți de aer puternici din sistemele HVAC. Are 4 niveluri de alarmă: Alert, Action, Fire 1, Fire 2 pentru răspuns gradual.',
                keywords: ['VESDA', 'detecție', 'aspirație', 'fum', 'timpurie']
            },
            {
                id: 'p118-gas',
                title: 'Agenți de stingere pentru IT',
                content: 'Pentru datacenter se preferă stingerea cu gaze inerte sau chimice: FM-200 (eficient, standard), Novec 1230 (ecologic, premium), IG-541 (natural, sigur). Concentrația de stingere nu depășește NOAEL (nivel fără efecte adverse), fiind sigură pentru personal cu premierga de 30 secunde. Timpul de descărcare trebuie să fie sub 10 secunde.',
                keywords: ['FM-200', 'Novec', 'IG-541', 'gaz', 'stingere']
            },
            {
                id: 'p118-compartment',
                title: 'Compartimentare antifoc datacenter',
                content: 'Sala serverelor trebuie separată de restul clădirii prin pereți REI 60 (rezistență la foc 60 minute). Camera bateriilor necesită REI 90. Toate străpungerile pentru cabluri se obturează cu materiale intumescente certificate. Ușile între compartimente trebuie să fie EI 60 cu autoînchidere.',
                keywords: ['compartimentare', 'REI', 'perete', 'intumescent', 'ușă']
            }
        ]
    },
    {
        id: 'np015-hvac',
        code: 'NP 015-1997 + SR EN 16798-3/2017',
        title: 'Proiectarea instalațiilor de ventilare, climatizare și condiționare',
        source: 'Romanian',
        category: 'hvac',
        year: 2017,
        keywords: ['ventilare', 'climatizare', 'aer', 'debit', 'filtrare', 'CRAC', 'răcire', 'HVAC', 'confort', 'tubulatură', 'chiller', 'free-cooling', 'in-row', 'precision'],
        summary: 'Normativ complet pentru instalații HVAC cu focus pe climatizarea de precizie pentru centre de date și răcire echipamente IT.',
        content: `NP 015-1997 + SR EN 16798-3/2017 - VENTILARE ȘI CLIMATIZARE

═══════════════════════════════════════════════════════════
CAP. 1 - CLASIFICARE SPAȚII ȘI CERINȚE CLIMATICE
═══════════════════════════════════════════════════════════

1.1 Clasificare spații (Art. 2.1):
┌─────────────────┬───────────────────┬───────────────────────┐
│ Categorie       │ Cerințe           │ Exemple               │
├─────────────────┼───────────────────┼───────────────────────┤
│ Spații ocupate  │ Confort uman      │ Birouri, NOC          │
│ Spații proces   │ Precizie         │ Săli servere, labs    │
│ Spații tehnice  │ Ventilare minim   │ Camere UPS, generator │
│ Spații speciale │ Control strict    │ Clean rooms           │
└─────────────────┴───────────────────┴───────────────────────┘

1.2 Clase de calitate aer interior (IDA):
┌──────────┬────────────────────────────────────────────────────┐
│ Clasă    │ Descriere                                          │
├──────────┼────────────────────────────────────────────────────┤
│ IDA 1    │ Calitate ridicată - spitale, laboratoare           │
│ IDA 2    │ Calitate medie - birouri, datacenter NOC          │
│ IDA 3    │ Calitate moderată - magazine, depozite            │
│ IDA 4    │ Calitate redusă - spații industriale              │
└──────────┴────────────────────────────────────────────────────┘

Datacenter sala servere: IDA 3 (fără ocupație permanentă)
Datacenter NOC: IDA 2 (ocupație permanentă)

═══════════════════════════════════════════════════════════
CAP. 2 - PARAMETRI CLIMATIZARE DATACENTER
═══════════════════════════════════════════════════════════

2.1 Clase ASHRAE (referință internațională):

Clasa A1 - Cea mai strictă:
┌────────────────────┬───────────────────────────────────────┐
│ Parametru          │ Valori admisibile                     │
├────────────────────┼───────────────────────────────────────┤
│ Temperatură        │ 18-27°C (recomandat 20-25°C)         │
│ Umiditate relativă │ 40-55% (punct rouă 5-15°C)           │
│ Variație T/h       │ < 5°C/h                               │
│ Gradienți T        │ < 2°C între rack-uri adiacente       │
└────────────────────┴───────────────────────────────────────┘

Clasa A2 - Standard datacenter:
┌────────────────────┬───────────────────────────────────────┐
│ Parametru          │ Valori admisibile                     │
├────────────────────┼───────────────────────────────────────┤
│ Temperatură        │ 10-35°C (recomandat 18-27°C)         │
│ Umiditate relativă │ 35-80% (punct rouă 21°C max)         │
│ Variație T/h       │ < 10°C/h                              │
│ Rata schimb aer    │ Minim 6-12 schimburi/oră             │
└────────────────────┴───────────────────────────────────────┘

2.2 Parametri recomandați România:
- Temperatura recepție aer (la rack): 22-24°C
- Umiditate relativă: 45-50%
- Punct de rouă: 12-14°C
- Presiune pozitivă: 10-25 Pa în sală
- Viteza aer în culoar rece: 0.5-1.5 m/s

2.3 Sarcini termice tipice:
┌────────────────────────┬─────────────────────────────────────┐
│ Componentă             │ Sarcină termică                     │
├────────────────────────┼─────────────────────────────────────┤
│ Rack standard          │ 3-5 kW (birouri)                   │
│ Rack virtualizare      │ 8-12 kW                            │
│ Rack GPU/HPC           │ 20-40 kW                           │
│ Rack AI/ML             │ 50+ kW (răcire lichidă)            │
│ Iluminat               │ 5-10 W/m²                          │
│ Personal               │ 100-120 W/persoană                 │
│ Pierderi HVAC          │ 5-10% din sarcina IT               │
└────────────────────────┴─────────────────────────────────────┘

═══════════════════════════════════════════════════════════
CAP. 3 - TIPURI DE CLIMATIZARE DATACENTER
═══════════════════════════════════════════════════════════

3.1 Comparație sisteme de răcire:

┌──────────────────┬────────────┬────────────────────────────────┐
│ Sistem           │ Eficiență  │ Aplicare                       │
├──────────────────┼────────────┼────────────────────────────────┤
│ CRAC perimetral  │ Moderată   │ Densitate <5 kW/rack           │
│ CRAC in-row      │ Bună       │ Densitate 5-15 kW/rack         │
│ Chillers + AHU   │ Variabilă  │ Orice densitate, flexibil      │
│ Rear-door HX     │ Foarte bună│ Densitate 15-30 kW/rack        │
│ Direct-to-chip   │ Excelentă  │ Densitate >30 kW/rack          │
│ Imersie          │ Maximă     │ Densitate >50 kW/rack          │
└──────────────────┴────────────┴────────────────────────────────┘

3.2 CRAC (Computer Room Air Conditioner):

Componente:
- Compresor scroll sau inverter
- Baterie de răcire DX sau apă răcită
- Ventilator EC cu turație variabilă
- Umidificator cu electrozi sau ultrason
- Filtru G4+F7

Dimensionare:
- Capacitate nominală: sarcina IT × 1.15-1.25
- Debit aer: 150-200 m³/h per kW sarcină
- Presiune statică: 200-400 Pa (sub podea)

Amplasare:
- Perimetral: pe marginea sălii, flux descendent
- In-row: între rack-uri, flux orizontal

3.3 Chillers (grupuri de răcire cu apă):

Tipuri:
┌────────────────────┬──────────────────────────────────────────┐
│ Tip                │ Caracteristici                           │
├────────────────────┼──────────────────────────────────────────┤
│ Răcit cu aer       │ Simplu, fără turn, ESEER 3.0-4.5        │
│ Răcit cu apă       │ Eficient, necesită turn, ESEER 5.0-7.0  │
│ Free-cooling int.  │ Economizor aer/apă integrat             │
│ Adiabatic          │ Pre-răcire evaporativă ext. +10% efic.  │
│ Magnetic bearing   │ Fără ulei, ESEER 6.0-8.0, fiabil        │
└────────────────────┴──────────────────────────────────────────┘

ESEER = European Seasonal Energy Efficiency Ratio

Temperaturi de lucru:
- Apă răcită ieșire: 7-12°C (tipic 10°C)
- Apă răcită retur: 12-18°C (tipic 16°C)
- Delta T: 5-6°C optimal

Free-cooling disponibilitate România:
- Zona București: ~3500-4000 ore/an (T ext <10°C)
- Zona montană: ~4500-5000 ore/an
- Pragul free-cooling: T ext < T retur apă - 3°C

3.4 Containment (izolare culoar cald/rece):

Beneficii:
- Reducere by-pass aer: 25-30% economie
- Temperaturi mai uniforme
- Permite temperaturi retur mai mari (eficiență)

Tipuri:
- Cold aisle containment (recomandată)
- Hot aisle containment
- Rack-level containment (blade chassis)

═══════════════════════════════════════════════════════════
CAP. 4 - FILTRARE AER
═══════════════════════════════════════════════════════════

4.1 Clasificare filtre (ISO 16890 și EN 779):

┌─────────────────┬──────────────┬───────────────────────────────┐
│ Clasă ISO 16890 │ Reținere     │ Aplicare                      │
├─────────────────┼──────────────┼───────────────────────────────┤
│ ISO Coarse      │ >50% praf    │ Prefiltru protecție           │
│ ePM10 ≥50%      │ PM10         │ Ventilație generală           │
│ ePM2.5 ≥65%     │ PM2.5        │ Datacenter standard           │
│ ePM1 ≥55%       │ PM1          │ Datacenter premium            │
│ HEPA H13-H14    │ 99.95-99.995%│ Clean rooms, zone speciale    │
└─────────────────┴──────────────┴───────────────────────────────┘

4.2 Scheme filtrare pentru datacenter:

Standard (recomandat):
Stadiu 1: ISO Coarse (G4) - prefiltru
Stadiu 2: ePM2.5 ≥65% (F7) - filtru principal

Premium (contaminare ridicată):
Stadiu 1: ISO Coarse (G4) - prefiltru
Stadiu 2: ePM2.5 ≥80% (F8) - filtru intermediar
Stadiu 3: ePM1 ≥65% (F9) - filtru fin

4.3 Schimb filtre:
- Pierdere sarcină maximă: conform producător
- Interval maxim: 12 luni (sau la ΔP max)
- Filtre HEPA: 24-36 luni
- Monitorizare ΔP: obligatorie la BMS

═══════════════════════════════════════════════════════════
CAP. 5 - TUBULATURĂ ȘI DISTRIBUȚIE AER
═══════════════════════════════════════════════════════════

5.1 Viteze aer în canale (pierderi vs zgomot):
┌────────────────────────┬─────────────────────────────────────┐
│ Locație                │ Viteză maximă                       │
├────────────────────────┼─────────────────────────────────────┤
│ Canal principal        │ 10-12 m/s                           │
│ Canal secundar         │ 6-8 m/s                             │
│ Ramificații            │ 4-6 m/s                             │
│ Guri de refulare       │ 2-3 m/s (turbulenți)               │
│ Sub podea tehnică      │ 2-4 m/s (datacenter)               │
│ În culoar rece         │ 0.5-1.5 m/s                        │
└────────────────────────┴─────────────────────────────────────┘

5.2 Distribuție sub podea tehnică:

Cerințe:
- Înălțime liberă sub podea: 400-600 mm minim
- Presiune statică: 20-50 Pa
- Plăci perforate: 25% deschidere standard
- Plăci directoare: flux dirijat către rack-uri HPC

5.3 Izolație termică canale:
┌─────────────────────────┬───────────────────────────────────┐
│ Situație                │ Grosime izolație                  │
├─────────────────────────┼───────────────────────────────────┤
│ Canal aer rece interior │ 25 mm vată minerală + BV          │
│ Canal aer rece exterior │ 40-50 mm + protecție exterioară   │
│ Canal recirculare       │ 20 mm (opțional)                  │
│ Canal evacuare          │ Fără izolație (dacă nu condensează)│
└─────────────────────────┴───────────────────────────────────┘
BV = barieră vapori (obligatorie la exterior izolație)

═══════════════════════════════════════════════════════════
CAP. 6 - UMIDIFICARE ȘI DEZUMIDIFICARE
═══════════════════════════════════════════════════════════

6.1 Tipuri de umidificatoare:

┌─────────────────┬────────────────────────────────────────────┐
│ Tip             │ Caracteristici                             │
├─────────────────┼────────────────────────────────────────────┤
│ Electrozi       │ Simplu, mentenanță frecventă, ieftin       │
│ Rezistiv        │ Fiabil, consum mare, apă normală           │
│ Ultrason        │ Precizie, consum mic, apă demineralizată   │
│ Evaporativ      │ Fără electricitate, răcire adiabatică      │
│ Abur din central│ Cea mai igienică, cost ridicat             │
└─────────────────┴────────────────────────────────────────────┘

6.2 Calcul debit umidificare:
G = V × ρ × n × (x2 - x1) / 1000

Unde:
- G = debit vapori [kg/h]
- V = volum încăpere [m³]
- ρ = densitate aer ≈ 1.2 kg/m³
- n = rata schimb aer [1/h]
- x1, x2 = conținut umiditate [g/kg aer uscat]

6.3 Dezumidificare:
- Prin răcire sub punct de rouă
- Baterie DX la 4-7°C
- Reîncălzire pentru a nu suprarăci

═══════════════════════════════════════════════════════════
CAP. 7 - SISTEME DE CONTROL ȘI AUTOMATIZARE
═══════════════════════════════════════════════════════════

7.1 Parametri monitorizați (BMS):
- Temperatura: la fiecare CRAC + senzori sală
- Umiditate: în culoar rece și la retur
- Presiune diferențială: sub/deasupra podea
- Stare echipamente: on/off, alarme, ore funcționare
- Consum energie: per CRAC și total

7.2 Strategii de control:

Nivel 1 - Control local:
- Fiecare CRAC cu termostat propriu
- Risc conflicte (unul răcește, altul încălzește)

Nivel 2 - Control coordonat:
- Termostat master comun
- Toate CRAC-urile pe aceeași setare

Nivel 3 - Control inteligent (recomandat):
- Senzori multipli în sală
- Ajustare turație ventilatoare pe densitate termică
- Rotație automată lead/lag
- Free-cooling automat

7.3 Redundanță și mentenanță:
- N+1 minim pentru datacenter (un CRAC rezervă)
- N+2 sau 2N pentru Tier III/IV
- Rotație automată pentru uzură uniformă
- Alarme: temperatură >27°C, umiditate <30% sau >70%`,
        articles: [
            {
                id: 'np015-containment',
                title: 'Containment culoar cald/rece',
                content: 'Containment-ul constă în izolarea fizică a culoarului rece sau cald pentru a preveni amestecarea aerului și by-pass-ul. Reduce consumul de energie cu 25-30%. Cold aisle containment (izolare culoar rece) este cea mai frecventă soluție. Se realizează cu uși la capetele culoarelor și panouri deasupra rack-urilor.',
                keywords: ['containment', 'culoar', 'by-pass', 'rece', 'cald', 'izolare']
            },
            {
                id: 'np015-freecooling',
                title: 'Free-cooling în România',
                content: 'Free-cooling utilizează aerul exterior sau apa răcită natural când temperatura este sub un anumit prag. În România, disponibilitatea free-cooling este de 3500-5000 ore/an în funcție de zonă. Pragul de activare: temperatura exterioară < temperatura retur apă - 3°C. Economie 30-50% la energia de răcire.',
                keywords: ['free-cooling', 'economizor', 'temperatură', 'economie', 'natural']
            },
            {
                id: 'np015-crac',
                title: 'Dimensionarea CRAC',
                content: 'CRAC (Computer Room Air Conditioner) se dimensionează cu factor de siguranță 1.15-1.25 față de sarcina IT. Debitul de aer tipic: 150-200 m³/h per kW sarcină termică. Amplasarea poate fi perimetrală (flux vertical descendent) sau in-row (flux orizontal scurt). In-row este mai eficient pentru densități mari.',
                keywords: ['CRAC', 'dimensionare', 'capacitate', 'in-row', 'perimetral']
            }
        ]
    },
    {
        id: 'c107-thermal',
        code: 'C107/2010 (actualizat 2020)',
        title: 'Normativ privind calculul termotehnic al elementelor de construcție',
        source: 'Romanian',
        category: 'infrastructure',
        year: 2020,
        keywords: ['izolație', 'termic', 'conductivitate', 'rezistență', 'perete', 'acoperiș', 'coeficient', 'transfer', 'căldură', 'nZEB', 'anvelopă', 'energie'],
        summary: 'Normativ actualizat pentru calculul termotehnic și cerințe nZEB (clădiri cu consum aproape zero de energie) - aplicabil și data center.',
        content: `C107/2010 (actualizat 2020) - CALCULUL TERMOTEHNIC
        
NOTĂ: C107/2005 a fost înlocuit de C107/2010, ultima actualizare 2020.

═══════════════════════════════════════════════════════════
CAP. 1 - DOMENIU DE APLICARE
═══════════════════════════════════════════════════════════

1.1 Aplicabilitate:
- Clădiri noi și reabilitate termic
- Clădiri publice, industriale, rezidențiale
- Centre de date: categoria "clădiri non-rezidențiale cu sarcini termice interne mari"

1.2 Excluderi:
- Clădiri temporare (< 2 ani)
- Clădiri industriale neclimatizate

═══════════════════════════════════════════════════════════
CAP. 2 - CERINȚE GENERALE (Zone climatice România 2020)
═══════════════════════════════════════════════════════════

2.1 Coeficienți de transfer termic U [W/m²K]:

ZONA I (sud, București, Constanța):
┌─────────────────────────┬───────────────┬───────────────┐
│ Element                 │ Maxim admis   │ Recomandat    │
├─────────────────────────┼───────────────┼───────────────┤
│ Pereți exteriori        │ 0.56          │ 0.35          │
│ Planșeu terasă          │ 0.35          │ 0.20          │
│ Planșeu pod neîncălzit  │ 0.35          │ 0.25          │
│ Planșeu sol/subsoluri   │ 0.45          │ 0.35          │
│ Ferestre cu ramă PVC    │ 1.30          │ 1.00          │
│ Uși exterioare          │ 2.00          │ 1.80          │
└─────────────────────────┴───────────────┴───────────────┘

ZONA II (centru, vest):
- Pereți exteriori: U ≤ 0.50 W/m²K
- Terasă: U ≤ 0.30 W/m²K

ZONA III (munte):
- Pereți exteriori: U ≤ 0.40 W/m²K
- Terasă: U ≤ 0.25 W/m²K

═══════════════════════════════════════════════════════════
CAP. 3 - CERINȚE nZEB (2021+)
═══════════════════════════════════════════════════════════

3.1 Clădiri noi începând cu 2021:
Cerință consum energie primară:
- Rezidențiale: ≤ 100 kWh/m²an
- Non-rezidențiale (birouri): ≤ 95 kWh/m²an
- Centre de date: EXCLUSE din calculul nZEB standard
  (se aplică metodologie separată - PUE)

3.2 Anvelopă pentru nZEB:
- Pereți: U ≤ 0.28 W/m²K (grosime izolație ~15-20cm)
- Acoperiș: U ≤ 0.18 W/m²K
- Ferestre: U ≤ 1.10 W/m²K, g ≤ 0.5 (factor solar)
- Etanșeitate: n50 ≤ 0.6 h⁻¹ (test Blower Door)

═══════════════════════════════════════════════════════════
CAP. 4 - SPECIFIC PENTRU CENTRE DE DATE
═══════════════════════════════════════════════════════════

4.1 Particularități:
- Sarcină termică internă: 200-1000 W/m² (vs. 20-50 W/m² birouri)
- Prioritate: EVACUARE CĂLDURĂ, nu reținere
- Izolația excesivă poate fi CONTRAPRODUCTIVĂ

4.2 Recomandări datacenter:
- Analiză termică dinamică: simulare cu software dedicat
- Free cooling: evaluare ore/an disponibile
- Masă termică: benefică pentru moderare vârfuri
- Acoperiș: reflexiv (cool roof) pentru reducere sarcină
  - SRI (Solar Reflectance Index) ≥ 78

4.3 Excepții admise pentru datacenter:
- Cerințe nZEB NU se aplică obligatoriu
- Se aplică metodologia PUE (Power Usage Effectiveness)
- Target PUE < 1.4 pentru clădiri noi 2021+

═══════════════════════════════════════════════════════════
CAP. 5 - MATERIALE IZOLANTE (λ = conductivitate termică)
═══════════════════════════════════════════════════════════

5.1 Materiale comune:
┌─────────────────────────┬───────────────┬───────────────┐
│ Material                │ λ [W/mK]      │ Obs.          │
├─────────────────────────┼───────────────┼───────────────┤
│ Vată minerală bazaltică │ 0.035-0.040   │ RF A1         │
│ Vată sticlă             │ 0.032-0.040   │ RF A1         │
│ Polistiren EPS          │ 0.036-0.044   │ RF E, F       │
│ Polistiren XPS          │ 0.028-0.036   │ RF E          │
│ Spumă PIR               │ 0.022-0.024   │ RF B/C        │
│ Spumă PUR               │ 0.020-0.028   │ RF E          │
│ Aerogel                 │ 0.013-0.019   │ Premium       │
└─────────────────────────┴───────────────┴───────────────┘
RF = Reacție la foc (Euroclasă)

5.2 Alegere pentru datacenter:
- Pereți: vată minerală (incombustibilă - RF A1)
- Acoperiș: PIR sau vată minerală rigidă
- Podea tehnică: nu se izolează termic
- Materiale: LSZH (low smoke zero halogen) în proximitate IT

═══════════════════════════════════════════════════════════
CAP. 6 - PUNȚI TERMICE ȘI CONDENSARE
═══════════════════════════════════════════════════════════

6.1 Punte termică:
- Coeficient liniar: ψ [W/mK]
- Tratare obligatorie la:
  - Colțuri de clădire
  - Glafuri ferestre
  - Streașină/atic
  - Balcoane și console

6.2 Verificare condensare:
- Condensare superficială: fRsi ≥ 0.72
- Condensare interstițială: metoda Glaser
- Datacenter: risc SCĂZUT datorită ventilației continue

═══════════════════════════════════════════════════════════
CAP. 7 - DOCUMENTE NECESARE
═══════════════════════════════════════════════════════════

7.1 Proiect:
- Fișă de calcul termotehnic pt. fiecare element
- Bilanț termic clădire
- Certificat energetic (auditor atestat)

7.2 Specificații tehnice:
- Confirmări de conformitate materiale
- Fișe tehnice produse izolante
- Calcul condensare detaliat`,
        articles: [
            {
                id: 'c107-nzeb',
                title: 'Cerințe nZEB pentru clădiri noi',
                content: 'Din 2021, toate clădirile noi trebuie să îndeplinească standardul nZEB (nearly Zero Energy Buildings). Centrele de date sunt exceptate de la cerințele standard nZEB, aplicându-se metodologia PUE în schimb. Target-ul este PUE < 1.4 pentru construcții noi.',
                keywords: ['nZEB', 'energie', 'zero', 'PUE', 'datacenter']
            },
            {
                id: 'c107-datacenter-thermal',
                title: 'Particularități termice datacenter',
                content: 'Centrele de date au sarcină termică internă de 200-1000 W/m², comparativ cu 20-50 W/m² pentru birouri. Izolația excesivă poate fi contraproductivă, prioritatea fiind evacuarea căldurii, nu reținerea ei. Se recomandă analiză dinamică și evaluare free cooling.',
                keywords: ['datacenter', 'sarcină termică', 'free cooling', 'răcire']
            }
        ]
    },
    {
        id: 'pe134-ups',
        code: 'PE 134/2013',
        title: 'Normativ pentru proiectarea și execuția rețelelor electrice de joasă tensiune',
        source: 'Romanian',
        category: 'electrical',
        year: 2013,
        keywords: ['UPS', 'generator', 'alimentare', 'neîntreruptibilă', 'baterie', 'bypass', 'STS', 'transfer', 'comutare'],
        summary: 'Cerințe pentru sisteme de alimentare neîntreruptibilă.',
        content: `PE 134/2013 - ALIMENTARE ELECTRICĂ ȘI UPS

Cap. 3 - Clasificare consumatori:
Categoria I - Foarte importanți:
- Întrerupere maximă admisă: 0 (zero)
- Exemple: centre de date, spitale
- Cerință: UPS + generator + alimentare duală

Categoria II - Importanți:
- Întrerupere maximă: 15-30 minute
- Cerință: generator sau alimentare rezervă

Cap. 4 - Sisteme UPS:
4.1 Topologii:
- Off-line: nu pentru IT critic
- Line-interactive: acceptabil pentru aplicații minore
- On-line dubla conversie: OBLIGATORIU pentru datacenter

4.2 Autonomie baterii:
- Minim: 5 minute (pentru pornire generator)
- Recomandat: 10-15 minute
- Pentru datacenter Tier IV: 15+ minute

4.3 Bypass:
- Bypass automat intern: obligatoriu
- Bypass de mentenanță extern: obligatoriu
- STS (Static Transfer Switch): pentru sisteme 2N

Cap. 5 - Grupuri electrogene:
5.1 Pornire automată (ATS):
- Timp detecție avarie: <1s
- Timp pornire și preluare: <10s (Tier IV)
- Timp pornire: <15s (Tier III)

5.2 Combustibil:
- Rezervor instalație: minim 12h autonomie la sarcină nominală
- Reîncărcare automată sau contract cu furnizor

5.3 Teste obligatorii:
- Test săptămânal la gol: 10 minute
- Test lunar la sarcină: 30 minute minim`
    },
    {
        id: 'sr-en-1997',
        code: 'SR EN 1997',
        title: 'Eurocod 7 - Proiectare geotehnică',
        source: 'Romanian',
        category: 'infrastructure',
        year: 2007,
        keywords: ['fundație', 'sol', 'structură', 'încărcare', 'teren', 'geotehnic', 'construcție', 'tasare'],
        summary: 'Cerințe pentru calculul fundațiilor, relevant pentru sarcini mari de rack-uri.',
        content: `SR EN 1997 - PROIECTARE GEOTEHNICĂ

Relevant pentru datacenter:

Cap. 2 - Studiu geotehnic obligatoriu:
- Foraje și sondaje conform amplasament
- Determinare capacitate portantă teren
- Analiza nivelului freatic

Cap. 5 - Sarcini specifice datacenter:
Sarcini concentrate de la rack-uri:
- Rack populat complet: 1000-2000 kg
- Distribuție pe 4 puncte sau traverse
- Presiune pe m²: până la 12-15 kN/m²

Cap. 6 - Fundații:
Pentru clădiri datacenter:
- Radier general recomandat
- Grosime minimă: calcul structural
- Armătură pentru sarcini punctiforme

Cap. 7 - Tasări admisibile:
- Tasare diferențială maximă: L/500
- Central pentru echipamente sensibile: L/750
- Monitorizare tasări în timp recomandata

Cap. 8 - Considerații seismice (P100):
- Datacenter = Clasa de importanță III
- Coeficient de importanță: γI = 1.2
- Zone seismice: verificare ag conform hartă`
    },
    {
        id: 'gdpr-security',
        code: 'GDPR + Legea 190/2018',
        title: 'Cerințe de securitate pentru date personale',
        source: 'Romanian',
        category: 'security',
        year: 2018,
        keywords: ['gdpr', 'date', 'personale', 'securitate', 'protecție', 'confidențialitate', 'audit', 'risc', 'breach'],
        summary: 'Cerințe legale pentru protecția datelor care afectează infrastructura datacenter.',
        content: `GDPR ȘI LEGEA 190/2018 - PROTECȚIA DATELOR

Art. 32 GDPR - Securitatea prelucrării:
Măsuri tehnice și organizatorice:

a) Pseudonimizarea și criptarea datelor:
- Criptare la repaus (rest): AES-256
- Criptare în tranzit: TLS 1.2/1.3
- Criptare end-to-end pentru date sensibile

b) Confidențialitate, integritate, disponibilitate:
- Control acces bazat pe roluri (RBAC)
- Audit logs pentru toate operațiunile
- Backup și disaster recovery

c) Capacitatea de restabilire:
- RTO (Recovery Time Objective): definit per clasă date
- RPO (Recovery Point Objective): backup incremental
- Test restore periodic: minim anual

d) Verificare eficacitate:
- Audituri interne: anual minim
- Penetration testing: anual recomandatț
- DPIA (Data Protection Impact Assessment)

Cerințe infrastructură datacenter:
- Control acces fizic: logare și monitorizare
- CCTV cu retenție minim 30 zile
- Distrugere securizată media: conform EN 15713
- Separate fizic sau logic pentru tenanti diferiți

Breach notification:
- Notificare ANSPDCP: 72 ore de la detectareț
- Notificare persoane afectate: fără întârziere
- Documentare obligatorie a tuturor incidentelor`
    },
    {
        id: 'legea-10-construction',
        code: 'Legea 10/1995',
        title: 'Legea privind calitatea în construcții',
        source: 'Romanian',
        category: 'infrastructure',
        year: 1995,
        keywords: ['construcție', 'autorizație', 'recepție', 'calitate', 'verificator', 'proiect', 'ISC', 'ISCIR'],
        summary: 'Cadrul legal pentru calitatea construcțiilor în România.',
        content: `LEGEA 10/1995 - CALITATEA ÎN CONSTRUCȚII

Art. 5 - Cerințe fundamentale:
A - Rezistență mecanică și stabilitate
B - Securitate la incendiu (P118)
C - Igienă, sănătate și mediu
D - Siguranță în exploatare
E - Protecție împotriva zgomotului
F - Economie de energie (C107)

Art. 10 - Obligații pentru datacenter:
- Autorizație de construire obligatorie
- Verificator de proiecte atestat (A, B, C, D, E, F)
- Diriginte de șantier autorizat
- Responsabil tehnic cu execuția (RTE)

Art. 13 - Recepția lucrărilor:
- Recepție la terminarea lucrărilor
- Proces verbal cu comisie
- Cartea tehnică a construcției

Art. 17 - Urmărirea comportării:
- Urmărire curentă: proprietar
- Expertiză tehnică la modificări
- Monitorizare seismică (pentru construcții speciale)

Art. 22 - Documentații obligatorii:
- Proiect pentru autorizație (PAC/DTAC)
- Proiect tehnic (PT)
- Detalii de execuție (DE)
- Caiete de sarcini`
    },
    {
        id: 'ieee-grounding',
        code: 'IEEE 1100 (Emerald Book)',
        title: 'Recommended Practice for Powering and Grounding Electronic Equipment',
        source: 'IEEE',
        category: 'electrical',
        year: 2005,
        keywords: ['împământare', 'grounding', 'electronic', 'EMC', 'armonică', 'power', 'quality', 'transient'],
        summary: 'Best practices pentru alimentarea și împământarea echipamentelor electronice.',
        content: `IEEE 1100 (EMERALD BOOK) - GROUNDING

Cap. 3 - Sisteme de împământare pentru IT:

3.1 Tipuri de referință:
- Signal Reference Grid (SRG): grilă sub podea tehnică
- Common Bonding Network (CBN): rețea egalizare
- Isolated Bonding Network (IBN): pentru zone sensibile

3.2 Configurări recomandate:
- Single-Point Ground: toate referințele la un punct
- Star topology pentru rack-uri
- Conductoare verzi exclusiv pentru PE

3.3 Practici pentru datacenter:
- Bare de cupru sub podea: grilă 600x600mm
- Toate rack-urile conectate la SRG
- Ecranare cabluri de date la un singur capăt

Cap. 4 - Calitatea alimentării:

4.1 Toleranțe (conform CBEMA/ITIC):
- ±10% tensiune pentru regim permanent
- Cădere scurtă (0.5 ciclu): până la 0V acceptabil
- Sag de 0.5s: minim 70% tensiune

4.2 Protecție la supratensiuni:
- SPD Tip 1: la intrare clădire
- SPD Tip 2: la tablou principal
- SPD Tip 3: la tablou PDU/rack

Cap. 5 - Armonici și EMC:
- THD tensiune: <5% total, <3% per armonică
- Neutru supradimensionat: 170% pentru sarcini nelineare
- Separare trasee putere/date: minim 150mm`,
        articles: [
            {
                id: 'ieee-srg',
                title: 'Signal Reference Grid',
                content: 'Grila de referință semnal (SRG) este o rețea de bare de cupru instalată sub podeaua tehnică, formând o structură de grilă cu ochiuri de 600x600mm. Toate rack-urile și echipamentele se conectează la cele mai apropiate noduri ale grilei pentru referință de semnal comună.',
                keywords: ['SRG', 'grilă', 'referință', 'cupru', 'podea']
            }
        ]
    },

    // ============================================================================
    // NORMATIVE ROMÂNEȘTI SUPLIMENTARE
    // ============================================================================
    {
        id: 'p100-seismic',
        code: 'P100-1/2013 + A1/2022',
        title: 'Cod de proiectare seismică',
        source: 'Romanian',
        category: 'infrastructure',
        year: 2022,
        keywords: ['seismic', 'cutremur', 'fundație', 'structură', 'clădire', 'vrancea', 'accelerație', 'risc', 'consolidare', 'beton'],
        summary: 'Codul de proiectare seismică pentru clădiri - esențial pentru centre de date în România.',
        content: `P100-1/2013 + AMENDAMENT A1/2022 - PROIECTARE SEISMICĂ

═══════════════════════════════════════════════════════════
CAP. 1 - ZONE SEISMICE ROMÂNIA
═══════════════════════════════════════════════════════════

1.1 Accelerații de proiectare ag [g]:

┌─────────────────────────┬───────────────┬───────────────┐
│ Zonă / Localitate       │ ag            │ Perioadă Tc   │
├─────────────────────────┼───────────────┼───────────────┤
│ București               │ 0.30g         │ 1.6s          │
│ Brăila, Galați          │ 0.35g         │ 1.6s          │
│ Iași                    │ 0.25g         │ 1.6s          │
│ Constanța               │ 0.20g         │ 0.7s          │
│ Cluj-Napoca             │ 0.10g         │ 0.7s          │
│ Timișoara               │ 0.08g         │ 0.7s          │
└─────────────────────────┴───────────────┴───────────────┘

1.2 Sursa principală: Vrancea (profunzime 80-200km)
- Afectează 2/3 din teritoriul României
- Perioada caracteristică Tc = 1.6s (efect amplificat pe sedimente)

═══════════════════════════════════════════════════════════
CAP. 2 - CLASIFICARE IMPORTANȚĂ
═══════════════════════════════════════════════════════════

2.1 Clase de importanță pentru datacenter:

Centre de date critice (bancă, Tier IV):
- Clasa de importanță: I (vitală)
- Coeficient γI = 1.40
- Perioadă referință: 100 ani

Centre de date enterprise:
- Clasa de importanță: II (importantă) 
- Coeficient γI = 1.20
- Perioadă referință: 50 ani

Centre de date obișnuite:
- Clasa de importanță: III (normală)
- Coeficient γI = 1.00

═══════════════════════════════════════════════════════════
CAP. 3 - CERINȚE STRUCTURALE
═══════════════════════════════════════════════════════════

3.1 Sistem structural recomandat:
- Cadre de beton armat cu ductilitate medie (DCM) sau mare (DCH)
- Pereți structurali pentru clădiri > 3 etaje
- Ductilitate DCH obligatorie în zone cu ag > 0.25g

3.2 Fundații:
- Radier general: recomandat pentru sarcini uniforme mari
- Lățime minimă fundație: 0.8m
- Adâncime îngheț: 0.8-1.2m conform zonă

3.3 Tipuri de structuri pentru datacenter:
- Hala metalică cu zidărie neportantă
- Cadre de beton cu închideri ușoare
- Structură prefabricată cu noduri ductile

═══════════════════════════════════════════════════════════
CAP. 4 - ECHIPAMENTE ȘI INSTALAȚII
═══════════════════════════════════════════════════════════

4.1 Elemente nestructurale critice:
Datacenter-urile au multe componente sensibile:
- Rack-uri și servere: ancorare la podea cu șuruburi M12
- UPS și baterii: platforme antiseismice
- Generatoare: amortizoare și ancorare specială
- Conducte și canale: conexiuni flexibile

4.2 Cerințe ancorare echipamente (conform Anexa E):
- Forță seismică orizontală: Fa = Sa × Wa × γa
- Sa = coeficient seismic echipament (0.5-1.0)
- Wa = greutatea echipamentului
- γa = factor de importanță echipament (1.0-1.5)

4.3 Podea tehnică:
- Ancorare la structura principală
- Suporți telescopici cu blocare
- Fără obstacole la dilatare
- Gratar metalic preferat în zone Tier IV

═══════════════════════════════════════════════════════════
CAP. 5 - DOCUMENTE NECESARE
═══════════════════════════════════════════════════════════

5.1 Pentru clădire nouă:
- Studiu geotehnic cu clasificare teren
- Calcul structural cu verificare seismică
- Verificare de către expert atestat MLPAT (cerința A)
- Aviz ISC pentru construcții speciale

5.2 Pentru datacenter în clădire existentă:
- Expertiză tehnică obligatorie
- Evaluare seismică conform P100-3
- Consolidare structurală dacă necesar`,
        articles: [
            {
                id: 'p100-ancorare',
                title: 'Ancorarea echipamentelor IT',
                content: 'Rack-urile trebuie ancorate la podeaua structurală cu șuruburi minimum M12, cu rezistență la forțe seismice de 0.3-0.5g orizontal. Bateriile UPS necesită platforme antiseismice certificate. Generatoarele diesel necesită amortizoare și ancoraje speciale.',
                keywords: ['ancorare', 'rack', 'seismic', 'UPS', 'baterie']
            }
        ]
    },
    {
        id: 'i18-heating',
        code: 'I18/1-2018 + I18/2-2023',
        title: 'Normativ pentru instalații de încălzire',
        source: 'Romanian',
        category: 'hvac',
        year: 2023,
        keywords: ['încălzire', 'agent termic', 'pompă', 'căldură', 'radiator', 'expansiune', 'vas', 'presiune'],
        summary: 'Normativ pentru dimensionarea instalațiilor de încălzire și răcire cu apă/glicolat.',
        content: `I18/1-2018 + I18/2-2023 - INSTALAȚII DE ÎNCĂLZIRE

═══════════════════════════════════════════════════════════
CAP. 1 - GENERALITĂȚI
═══════════════════════════════════════════════════════════

1.1 Domeniu aplicare:
- Instalații de încălzire centrală cu apă caldă
- Sisteme cu agent termic < 6 bar, < 110°C
- Aplicabil și pentru sisteme de răcire cu apă/glicolat

1.2 Specific datacenter:
- Circuite răcire servere (chilled water)
- Circuite free cooling
- Circuite condensator / turn răcire

═══════════════════════════════════════════════════════════
CAP. 2 - DIMENSIONARE CONDUCTE
═══════════════════════════════════════════════════════════

2.1 Viteze recomandate (apă):
┌─────────────────────────┬───────────────┐
│ Tip circuit             │ Viteză [m/s]  │
├─────────────────────────┼───────────────┤
│ Coloane principale      │ 1.0 - 2.0     │
│ Distribuție orizontală  │ 0.8 - 1.5     │
│ Racorduri echipamente   │ 0.5 - 1.0     │
│ Circuite chilled water  │ 1.5 - 3.0     │
└─────────────────────────┴───────────────┘

2.2 Pierderi de sarcină:
- Liniar: R = 50-200 Pa/m (recomandat < 100 Pa/m)
- Calculate cu formula Darcy-Weisbach
- Coeficient rugozitate: 0.05mm (oțel nou)

2.3 Materiale:
- Oțel carbon negru/zincat: standard
- Cupru: pentru circuite mici
- PPR/PE-X: interzis în sală datacenter
- Oțel inox: premium pentru free cooling

═══════════════════════════════════════════════════════════
CAP. 3 - ECHIPAMENTE
═══════════════════════════════════════════════════════════

3.1 Pompe de circulație:
- Debit: conform calcul termic
- Înălțime pompare: Σ pierderi circuit + rezerva 20%
- Pompe cu turație variabilă (VFD): obligatorii 2021+
- Redundanță: 2 pompe (1+1) pentru circuite critice

3.2 Vas de expansiune:
- Volum: Ve = Vt × e × 1/(1 - Pmin/Pmax)
  - Vt = volum total instalație
  - e = coef. dilatare (0.029 pentru Δt=20°C)
  - Pmin/Pmax = presiuni absolute

3.3 Specific glicolat:
- Factor corecție debit: ×1.05-1.10 (vs. apă)
- Factor corecție pierderi: ×1.10-1.20
- Capacitate termică: 0.85 × apă (pt 30% glicol)

═══════════════════════════════════════════════════════════
CAP. 4 - IZOLAȚIE TERMICĂ CONDUCTE
═══════════════════════════════════════════════════════════

4.1 Grosimi minime izolație:

Circuit apă răcită (5-12°C):
┌────────────────┬──────────────────────────────┐
│ DN conductă    │ Grosime izolație (λ≈0.035)   │
├────────────────┼──────────────────────────────┤
│ ≤ DN40         │ 20mm                         │
│ DN50-DN100     │ 25mm                         │
│ DN125-DN300    │ 32mm                         │
│ > DN300        │ 40mm                         │
└────────────────┴──────────────────────────────┘

4.2 Barieră de vapori:
- OBLIGATORIE pentru circuite <15°C
- Material: folie aluminiu sau polietilenă
- Lipire etanșă la toate îmbinările
- Prevenire condensare/coroziune sub izolație`,
        articles: [
            {
                id: 'i18-glicol',
                title: 'Proprietăți glicol în instalații',
                content: 'Glicolul (etilenic sau propilenic) reduce capacitatea de transfer termic cu 15-20% față de apă pură. Debitele trebuie majorate cu 5-10%, iar pierderile de sarcină cresc cu 10-20%. Concentrația tipică este 30-40% pentru protecție până la -20°C.',
                keywords: ['glicol', 'etilenglicol', 'propilenglicol', 'transfer termic']
            }
        ]
    },
    {
        id: 'npi7-lightning',
        code: 'NP I7-2022',
        title: 'Normativ privind proiectarea paratrăsnetelor',
        source: 'Romanian',
        category: 'electrical',
        year: 2022,
        keywords: ['trăsnet', 'paratrasnet', 'descărcare', 'atmosferică', 'LPS', 'SPD', 'protecție', 'împământare'],
        summary: 'Normativ pentru proiectarea sistemelor de protecție la trăsnet (LPS) - esențial pentru centre de date.',
        content: `NP I7-2022 - PROTECȚIE LA TRĂSNET (conform IEC 62305)

═══════════════════════════════════════════════════════════
CAP. 1 - CLASIFICARE RISC
═══════════════════════════════════════════════════════════

1.1 Centre de date = nivel ridicat de protecție

Risc considerabil datorită:
- Echipamente electronice sensibile
- Pierderi economice mari la avarie
- Siguranța datelor și continuitatea serviciilor
- Sisteme de răcire critice

1.2 Nivel de protecție (NPL) recomandat:

┌─────────────────────────┬───────────────┬───────────────┐
│ Tip datacenter          │ NPL           │ Eficiență     │
├─────────────────────────┼───────────────┼───────────────┤
│ Tier IV / Critic        │ I             │ 99%           │
│ Tier III / Enterprise   │ I sau II      │ 95-99%        │
│ Tier II                 │ II            │ 95%           │
│ Tier I / Mic            │ III           │ 90%           │
└─────────────────────────┴───────────────┴───────────────┘

═══════════════════════════════════════════════════════════
CAP. 2 - SISTEM EXTERN (LPS)
═══════════════════════════════════════════════════════════

2.1 Captor (receptor trăsnet):

Tipuri admise:
- Tijă simplă Franklin
- Conductor orizontal pe acoperiș
- Plasă de captare (mesh)

Dimensiuni conform NPL:
┌───────┬───────────────┬───────────────┬───────────────┐
│ NPL   │ Rază sferă    │ Ochi plasă    │ Unghi protec. │
├───────┼───────────────┼───────────────┼───────────────┤
│ I     │ 20m           │ 5×5m          │ 25°           │
│ II    │ 30m           │ 10×10m        │ 35°           │
│ III   │ 45m           │ 15×15m        │ 45°           │
│ IV    │ 60m           │ 20×20m        │ 55°           │
└───────┴───────────────┴───────────────┴───────────────┘

2.2 Coborâri:
- Material: cupru 50mm² sau oțel zincat 50mm²
- Nr. minim coborâri: 2 (pe laturi opuse)
- Distanța între coborâri: max 10-25m (funcție NPL)
- Traseu: vertical, fără bucle

2.3 Priză de pământ:
- Rezistență: <10Ω (cerință minimă)
- Recomandat pentru datacenter: <4Ω
- Tip: fundație + artificial (electrozi verticali)
- Conectare la sistemul de egalizare potențial

═══════════════════════════════════════════════════════════
CAP. 3 - SISTEM INTERN (PROTECȚIE ECHIPAMENTE)
═══════════════════════════════════════════════════════════

3.1 SPD (Surge Protective Devices):

Dispozitive de protecție la supratensiuni:

┌──────────────────────┬───────────────┬───────────────────┐
│ Locație              │ Tip SPD       │ In (curent nom.)  │
├──────────────────────┼───────────────┼───────────────────┤
│ Tablou general TGBT  │ Tip 1 + 2     │ ≥25kA             │
│ Tablou secundar      │ Tip 2         │ ≥20kA             │
│ Tablou PDU           │ Tip 2 + 3     │ ≥15kA             │
│ La echipament        │ Tip 3         │ ≥5kA              │
└──────────────────────┴───────────────┴───────────────────┘

3.2 Up (Nivel protecție tensiune):
- Tip 1+2: Up ≤ 2.5 kV
- Tip 2+3: Up ≤ 1.5 kV
- Tip 3: Up ≤ 1.0 kV (pentru IT sensibil)

3.3 Distanțe de izolare:
- Între LPS și instalații metalice: calcul conform masă
- Minim 0.5m pentru NPL III-IV
- Sau conexiune la sistemul LPS (bonding)

═══════════════════════════════════════════════════════════
CAP. 4 - SISTEM DE EGALIZARE POTENȚIAL
═══════════════════════════════════════════════════════════

4.1 Bară principală de egalizare (MEB):
- Amplasare: cameră tehnică electrică
- Material: cupru, min 25×3mm
- Conectări obligatorii:
  - Priza de pământ LPS
  - Conductoare coborâre
  - PE tablou principal
  - Mase metalice mari (generatoare, UPS carcasă)
  - Jgheaburi cabluri

4.2 Egalizare echipamente IT:
- Bare locale în fiecare rack
- Conectare la SRG (Signal Reference Grid)
- Conductor egalizare: min 16mm² Cu`,
        articles: [
            {
                id: 'npi7-spd',
                title: 'SPD pentru echipamente IT',
                content: 'Protecția completă necesită SPD în cascadă: Tip 1+2 la intrare, Tip 2 la distribuție, Tip 3 înainte de echipamente sensibile. Pentru servere și storage, nivelul de protecție Up trebuie să fie ≤ 1.0 kV.',
                keywords: ['SPD', 'supratensiune', 'protecție', 'server', 'storage']
            }
        ]
    },
    {
        id: 'nte007-cables',
        code: 'NTE 007/08/22',
        title: 'Normativ pentru proiectarea cablurilor electrice',
        source: 'Romanian',
        category: 'cabling',
        year: 2022,
        keywords: ['cablu', 'electric', 'jgheab', 'traseu', 'dimensionare', 'secțiune', 'curent', 'cădere tensiune'],
        summary: 'Normativ pentru dimensionarea și instalarea cablurilor electrice în clădiri.',
        content: `NTE 007/08/22 - CABLAJE ELECTRICE (actualizat 2022)

═══════════════════════════════════════════════════════════
CAP. 1 - TIPURI DE CABLURI PENTRU DATACENTER
═══════════════════════════════════════════════════════════

1.1 Cabluri recomandate:

Alimentare principală:
- N2XH (XLPE cu manta LSZH)
- NHXH (fără halogen, rezistent foc)

Distribuție internă:
- N2XCH (Cu ecranat, LSZH)
- NYCWY (armat pentru trasee exterioare)

Caracteristici obligatorii pentru datacenter:
- LSZH (Low Smoke Zero Halogen)
- Clasificare foc: minim Cca-s1b,d1,a1
- Pentru Tier III+: B2ca sau mai bun

1.2 Clasificare reacție la foc (EN 50575):
┌──────────────┬───────────────────────────────────────┐
│ Clasa        │ Descriere                             │
├──────────────┼───────────────────────────────────────┤
│ Aca          │ Incombustibil (nu există pt cabluri)  │
│ B1ca         │ Contribuție foarte mică la foc        │
│ B2ca         │ Contribuție mică la foc               │
│ Cca          │ Contribuție moderată                  │
│ Dca          │ Contribuție acceptabilă               │
│ Eca          │ Contribuție ridicată                  │
│ Fca          │ Netestat / interzis în datacenter     │
└──────────────┴───────────────────────────────────────┘

═══════════════════════════════════════════════════════════
CAP. 2 - DIMENSIONARE
═══════════════════════════════════════════════════════════

2.1 Criterii de dimensionare:
1. Curent de sarcină (Ib)
2. Capacitate de transport (Iz) cu factori corecție
3. Cădere de tensiune (ΔU)
4. Curent de scurtcircuit (Ik)

2.2 Factori de corecție capacitate:

Temperatura ambiantă (referință 30°C):
- 35°C: f = 0.94
- 40°C: f = 0.87
- 45°C: f = 0.79

Grupare cabluri:
- 2 cabluri: f = 0.85
- 3 cabluri: f = 0.79
- 4-6 cabluri: f = 0.75
- 7-9 cabluri: f = 0.70

2.3 Cădere de tensiune maximă:
┌──────────────────────────┬───────────────────┐
│ Traseu                   │ ΔU% maxim         │
├──────────────────────────┼───────────────────┤
│ TGBT → Tablou secundar   │ 2%                │
│ Tablou → PDU             │ 1.5%              │
│ PDU → Rack               │ 1%                │
│ TOTAL de la TGBT         │ 5%                │
└──────────────────────────┴───────────────────┘

2.4 Secțiuni tipice datacenter:
- Alimentare TGBT: 3x240mm² + 120mm² N (per fază)
- Circuit UPS 200kVA: 3x95mm² + 50mm² N
- PDU 63A: 5x16mm²
- Racord rack 32A: 5x6mm²

═══════════════════════════════════════════════════════════
CAP. 3 - CĂILE DE CABLURI
═══════════════════════════════════════════════════════════

3.1 Jgheaburi metalice (standard datacenter):

Materiale:
- Oțel zincat la cald: standard
- Oțel inox 304: medii corozive
- Aluminiu: aplicații speciale

Dimensionare:
- Umplere inițială: max 40%
- Umplere maximă: 60%
- Factor creștere 1.5x pentru dezvoltare viitoare

3.2 Separare trasee:

┌─────────────────────────┬───────────────────────────┐
│ Tip separator           │ Distanță minimă           │
├─────────────────────────┼───────────────────────────┤
│ Putere - Date (neecr.)  │ 200mm                     │
│ Putere - Date (ecranat) │ 100mm                     │
│ Cu separator metalic    │ 50mm                      │
│ Circuite diferite AC    │ 50mm sau ecranare         │
└─────────────────────────┴───────────────────────────┘

3.3 Raze de curbură:
- Cabluri de putere: min 12 × diametru exterior
- Cabluri de date: min 8 × diametru exterior (sau conform producător)

═══════════════════════════════════════════════════════════
CAP. 4 - PROTECȚII ȘI TERMENII
═══════════════════════════════════════════════════════════

4.1 Contorizare:
- Contoare de energie la TGBT
- Subcontorizare pe circuite mari (UPS, HVAC)
- Monitorizare PUE: obligatoriu pentru datacenter nou

4.2 Etichete obligatorii:
- La ambele capete ale fiecărui cablu
- Inscripții permanente (gravate sau tipărite durabil)
- Cod: Tablou sursă - Circuit - Tablou destinație`,
        articles: [
            {
                id: 'nte-lszh',
                title: 'Cabluri LSZH pentru datacenter',
                content: 'Cablurile LSZH (Low Smoke Zero Halogen) sunt obligatorii în sălile de echipamente IT. În caz de incendiu, emit fum redus și fără gaze halogene toxice, protejând echipamentele și personalul. Clasificarea minimă pentru datacenter este Cca-s1b,d1,a1.',
                keywords: ['LSZH', 'fum', 'halogen', 'incendiu', 'cablu']
            }
        ]
    },
    {
        id: 'ntpee-fire-electrical',
        code: 'NTPEE/2022',
        title: 'Norme tehnice pentru echipamente electrice în zone periculoase',
        source: 'Romanian',
        category: 'fire',
        year: 2022,
        keywords: ['baterie', 'acumulator', 'explozie', 'hidrogen', 'ventilare', 'ATEX', 'risc'],
        summary: 'Normativ pentru camerele de baterii UPS și zonele cu risc de explozie.',
        content: `NTPEE/2022 - CAMERE BATERII ȘI ZONE CU RISC

═══════════════════════════════════════════════════════════
CAP. 1 - CAMERELE DE BATERII UPS
═══════════════════════════════════════════════════════════

1.1 Risc specific:
Bateriile cu plumb-acid (VRLA) și Ni-Cd degajă hidrogen:
- LEL (Lower Explosive Limit) H2: 4%
- UEL (Upper Explosive Limit) H2: 75%
- Risc explozie la concentrații 4-75%

1.2 Cerințe ventilare cameră baterii:

Debit minim aer proaspăt:
Q = v × q × n × Igas × CN × 0.05 [m³/h]

Unde:
- v = 24 vol/mol H2 la 25°C
- q = 0.42 × 10⁻³ [l/Ah] pt VRLA
- n = număr elemente
- Igas = curent gazare
- CN = capacitate nominală [Ah]

Simplificat pentru VRLA:
Q = 0.0005 × CN × n [m³/h]

1.3 Instalație electrică în camera baterii:
┌─────────────────────────┬───────────────────────────┐
│ Zonă baterii vechi      │ Zona 1 (doar în funcție)  │
│ Zonă baterii VRLA       │ Zona 2 (la încărcare)     │
│ Restul camerei          │ Nepericuloasă (cu ventil) │
└─────────────────────────┴───────────────────────────┘

Echipamente admise:
- Zona 1/2: certificate ATEX/Ex
- Cu ventilare adecvată: echipamente normale

═══════════════════════════════════════════════════════════
CAP. 2 - BATERII LITIU-ION (Li-ion)
═══════════════════════════════════════════════════════════

2.1 Riscuri specifice:
- Thermal runaway (fugă termică)
- Degajare gaze toxice și inflamabile
- Temperatura autoaprindere: ~150°C

2.2 Cerințe suplimentare pentru Li-ion:
- Sistem detecție incendiu foarte timpurie (VESDA)
- Stingere cu aerogel sau apă atomizată (NU halon)
- Monitorizare temperatura fiecare celulă (BMS)
- Ventilare forțată în caz de alarmă termică

2.3 Distanțe de siguranță:
- Între rack-uri baterii Li-ion: min 0.5m
- Min 3m față de echipamente IT critice
- Compartimentare REI 60 față de sala servere

═══════════════════════════════════════════════════════════
CAP. 3 - ALTE ZONE CU RISC
═══════════════════════════════════════════════════════════

3.1 Camera generator diesel:
- Risc: vapori combustibil
- Clasificare: Zona 2 (lângă rezervor)
- Ventilare: 0.5 schimburi/min (urgență)

3.2 Stația de transformatoare cu ulei:
- Risc incendiu (nu explozie)
- Cuvă de retenție: 110% volum ulei
- Separator hidrocarburii pentru scurgeri

═══════════════════════════════════════════════════════════
CAP. 4 - SISTEME DE SIGURANȚĂ
═══════════════════════════════════════════════════════════

4.1 Detecție gaze pentru cameră baterii:
- Detector H2: prag alarmă la 20% LEL (0.8%)
- Poziționare: în partea superioară (H2 ușor)
- Acțiune automată: pornire ventilare de urgență

4.2 Oprire de urgență:
- Buton EPO (Emergency Power Off) la intrare
- Deconectare baterii în caz de alarmă termică/H2
- Semnalizare stare la dispecerat 24/7`
    },
    {
        id: 'i9-plumbing',
        code: 'I9/2022',
        title: 'Normativ pentru instalații sanitare interioare',
        source: 'Romanian',
        category: 'infrastructure',
        year: 2022,
        keywords: ['sanitare', 'apă', 'canalizare', 'conducte', 'pompă', 'debit', 'presiune', 'rezervor', 'scurgere'],
        summary: 'Normativ pentru instalații de alimentare cu apă și canalizare - include cerințe pentru sisteme de răcire și detecție scurgeri în datacenter.',
        content: `I9/2022 - INSTALAȚII SANITARE INTERIOARE

═══════════════════════════════════════════════════════════
CAP. 1 - ALIMENTARE CU APĂ
═══════════════════════════════════════════════════════════

1.1 Tipuri de apă în datacenter:
┌─────────────────────────┬───────────────────────────────────┐
│ Tip                     │ Utilizare                         │
├─────────────────────────┼───────────────────────────────────┤
│ Apă potabilă            │ Personal, igienă                  │
│ Apă tehnologică         │ Make-up turn răcire, umidificare  │
│ Apă dedurizată          │ Umidificatoare, răcire adiabatică │
│ Apă demineralizată      │ Stingere ceață, water-mist        │
│ Apă răcită circulată    │ Circuit chilled water             │
└─────────────────────────┴───────────────────────────────────┘

1.2 Debite și presiuni:
- Presiune minimă la contor: 1.5 bar
- Presiune maximă la robinete: 4 bar
- Reducător de presiune obligatoriu dacă P>4 bar

1.3 Materiale conducte (recomandate datacenter):
- Oțel zincat: alimentare generală
- Oțel inox: apă tratată / sisteme critice
- PPR/PE-X: INTERZIS în sala servere (risc fisurare)
- Cupru: permis, evitat pentru apă tratată

═══════════════════════════════════════════════════════════
CAP. 2 - CANALIZARE
═══════════════════════════════════════════════════════════

2.1 Cerințe pentru sala datacenter:
- Evacuare podea tehnică: obligatorie la margini
- Pantă podea: 1-2% spre sifoane
- Sifoane cu gardă hidraulică sau membrana
- Pompe submersibile în bazin colector

2.2 Dimensionare canalizare:
- Debit estimat: deversare chiller + condensat CRAC
- DN minim scurgere: 75mm
- DN colector principal: 110mm
- Pantă minim: 2% pentru DN<110, 1% pentru DN>110

═══════════════════════════════════════════════════════════
CAP. 3 - DETECȚIE SCURGERI (Leak Detection)
═══════════════════════════════════════════════════════════

3.1 Zone monitorizate obligatoriu:
□ Sub podea tehnică (zona cea mai critică)
□ În jurul CRAC-urilor
□ La baza rack-urilor în rânduri
□ Sub conducte apă răcită
□ Camera UPS (condensare, scurgeri baterii)

3.2 Tipuri de senzori:
┌─────────────────────────┬───────────────────────────────────┐
│ Tip                     │ Descriere                         │
├─────────────────────────┼───────────────────────────────────┤
│ Cablu sensor           │ Detectează oriunde pe lungime     │
│ Spot sensor            │ Punct fix, economic               │
│ Cablu zonare           │ Indică poziția exactă scurgere    │
└─────────────────────────┴───────────────────────────────────┘

3.3 Acțiuni la alarmă scurgere:
- Alarmă sonoră și vizuală la NOC
- Notificare SMS/email echipă mentenanță
- Închidere automată valve sectorizare (optional)
- Pornire pompe evacuare

═══════════════════════════════════════════════════════════
CAP. 4 - SISTEME STINGERE CU APĂ
═══════════════════════════════════════════════════════════

4.1 Pre-action sprinklere (pentru datacenter):
- Dublu interlock: detecție fum + căldură
- Conductă sub presiune aer (verificare integritate)
- Descărcare doar la confirmare incendiu real
- Zonare pe compartimente

4.2 Water mist:
- Picături <1000 μm
- Presiune 35-120 bar
- Debit: 0.5-1.5 l/min/m²
- Daune echipamente: minime dacă secat rapid`,
        articles: [
            {
                id: 'i9-leak',
                title: 'Detecție scurgeri în datacenter',
                content: 'Sistemele de detecție scurgeri sunt critice pentru datacenter. Cablul sensor linear poate detecta scurgeri oriunde pe lungimea sa și este recomandat pentru sub podea tehnică. Se amplasează pe perimetrul sălii, sub CRAC-uri și conducte. Răspunsul la alarmă trebuie să fie sub 5 minute.',
                keywords: ['scurgere', 'leak', 'water', 'detecție', 'cablu sensor']
            }
        ]
    },
    {
        id: 'np062-security',
        code: 'NP 062/2020',
        title: 'Normativ privind securitatea fizică a clădirilor',
        source: 'Romanian',
        category: 'infrastructure',
        year: 2020,
        keywords: ['securitate', 'acces', 'control', 'supraveghere', 'CCTV', 'badge', 'antiefracție', 'perimetru', 'gardă'],
        summary: 'Normativ pentru securitatea fizică a construcțiilor - include cerințe pentru centre de date, control acces și supraveghere video.',
        content: `NP 062/2020 - SECURITATE FIZICĂ

═══════════════════════════════════════════════════════════
CAP. 1 - CLASIFICARE NIVEL DE SECURITATE
═══════════════════════════════════════════════════════════

1.1 Centre de date = Nivel ridicat de securitate

Factori de risc pentru datacenter:
- Valoare echipamente: foarte mare
- Valoare date: critică / incalculabilă
- Continuitate servicii: 24/7/365
- Ținte potențiale: sabotaj, furt, spionaj

1.2 Clase de securitate (RC - Resistance Class):
┌─────────────────────────┬───────────────────────────────────┐
│ Clasă                   │ Aplicare                          │
├─────────────────────────┼───────────────────────────────────┤
│ RC1                     │ Rezidențial                       │
│ RC2                     │ Birouri normale                   │
│ RC3                     │ Magazine, depozite               │
│ RC4                     │ Datacenter standard (Tier II)    │
│ RC5                     │ Datacenter enterprise (Tier III) │
│ RC6                     │ Datacenter critic (Tier IV)      │
└─────────────────────────┴───────────────────────────────────┘

═══════════════════════════════════════════════════════════
CAP. 2 - SECURITATE PERIMETRALĂ
═══════════════════════════════════════════════════════════

2.1 Gard perimetral:
- Înălțime minimă: 2.4m (top cu sârmă ghimpată sau concertina)
- Material: oțel zincat, anti-tăiere
- Fundație: beton 60×60cm anti-săpare
- Detecție escaladare: senzori vibrație pe gard

2.2 Bariere vehicule:
┌─────────────────────────┬───────────────────────────────────┐
│ Tip barieră             │ Rezistență (vehicul rampage)      │
├─────────────────────────┼───────────────────────────────────┤
│ Barieră auto simplă     │ N/A (doar control)               │
│ Bolard fix              │ 40-80 km/h (1.5-5 tone)          │
│ Bolard retractabil      │ 50-80 km/h (3-7.5 tone)          │
│ Road blocker            │ 80+ km/h (7.5+ tone)             │
│ Plantare anti-ram       │ 30-50 km/h (design peisagistic)  │
└─────────────────────────┴───────────────────────────────────┘

2.3 Iluminare perimetrală:
- Nivel minim: 50 lux pe gard
- Surse: LED, senzor crepuscular
- Backup: UPS minim 4 ore

═══════════════════════════════════════════════════════════
CAP. 3 - CONTROL ACCES
═══════════════════════════════════════════════════════════

3.1 Zone de securitate în datacenter:

┌─────────────────────────┬───────────────────────────────────┐
│ Zonă                    │ Control acces                     │
├─────────────────────────┼───────────────────────────────────┤
│ L1 - Perimetru          │ Gard + recepție                  │
│ L2 - Recepție           │ Identificare vizuală             │
│ L3 - Coridoare          │ Card HID/Mifare                  │
│ L4 - Sala datacenter    │ Card + PIN sau biometric         │
│ L5 - Cage/rack dedicat  │ Biometric + autorizație specială │
└─────────────────────────┴───────────────────────────────────┘

3.2 Tehnologii control acces:
- Card proximitate (125kHz): nivel scăzut, clonable
- Card smart (13.56MHz, Mifare): nivel mediu
- Card DESFire EV2/3: nivel ridicat, recomandat
- Biometric amprente: nivel ridicat
- Biometric facial/iris: nivel foarte ridicat
- Multi-factor (card+PIN+bio): obligatoriu L4-L5

3.3 Sas de securitate (mantrap/airlock):
- Obligatoriu pentru accesul în sala servere (L4+)
- Uși antipanicardice interlock
- Cântar pentru detectare tailgating
- CCTV în interior sas

═══════════════════════════════════════════════════════════
CAP. 4 - SUPRAVEGHERE VIDEO (CCTV)
═══════════════════════════════════════════════════════════

4.1 Amplasare camere:
□ Toate intrările (15-20 px/cm rezoluție facială)
□ Perimetru (vedere panoramică + PTZ)
□ Coridoare interioare (identificare persoane)
□ Interior sală servere (acoperire 100%)
□ Zone sensibile: UPS, generator, TGBT

4.2 Specificații tehnice minime:
┌─────────────────────────┬───────────────────────────────────┐
│ Parametru               │ Cerință minimă                    │
├─────────────────────────┼───────────────────────────────────┤
│ Rezoluție               │ 2MP (Full HD) minim              │
│ FPS                     │ 15 fps minim, 25-30 recomandat   │
│ Iluminare               │ IR pentru 0 lux                  │
│ Analiză video           │ Motion detection, face detection │
│ Stocare                 │ 30 zile minim, 90 recomandat     │
│ Redundanță              │ RAID în NVR/VMS                  │
└─────────────────────────┴───────────────────────────────────┘

4.3 Monitorizare:
- NOC 24/7 pentru vizualizare live
- Sistem de management video (VMS)
- Alarmă la mișcare neautorizată
- Export rapid pentru investigații

═══════════════════════════════════════════════════════════
CAP. 5 - DETECȚIE EFRACȚIE
═══════════════════════════════════════════════════════════

5.1 Senzori de intruziune:
┌─────────────────────────┬───────────────────────────────────┐
│ Tip                     │ Amplasare                         │
├─────────────────────────┼───────────────────────────────────┤
│ Contact magnetic        │ Uși și ferestre                  │
│ PIR (mișcare)           │ Interior încăperi                │
│ Dual tech (PIR+MW)      │ Zone critice, evitare fals       │
│ Vibrație                │ Pereți, tavan, gard              │
│ Seismic                 │ Seifuri, pardoseli              │
│ Beam IR                 │ Coridoare, perimetru interior    │
└─────────────────────────┴───────────────────────────────────┘

5.2 Sistem de alarmare:
- Grad 3-4 EN 50131 pentru datacenter
- Comunicare dublă: IP + GSM
- Monitorizare dispecerat extern sau intern
- Timp răspuns gardă: <5 minute`,
        articles: [
            {
                id: 'np062-mantrap',
                title: 'Sas de securitate (mantrap)',
                content: 'Sas-ul de securitate (mantrap sau airlock) este obligatoriu pentru accesul în sala datacenter. Constă din două uși interlocked - a doua ușă nu se deschide până când prima nu s-a închis. Include cântar pentru a detecta intrarea simultană a mai multor persoane (tailgating). Cameră CCTV în interior.',
                keywords: ['mantrap', 'airlock', 'sas', 'tailgating', 'interlock']
            },
            {
                id: 'np062-access',
                title: 'Control acces multi-factor',
                content: 'Pentru sala datacenter (Level 4+) se impune autentificare multi-factor: card smart (DESFire) + PIN + biometric. Cardurile 125kHz simple sunt vulnerabile la clonare și nu sunt recomandate. Logurile de acces se păstrează minim 1 an și sunt parte din audit trail.',
                keywords: ['acces', 'card', 'biometric', 'PIN', 'multi-factor']
            }
        ]
    },
    {
        id: 'pe132-generators',
        code: 'PE 132/2017',
        title: 'Normativ privind proiectarea grupurilor electrogene',
        source: 'Romanian',
        category: 'electrical',
        year: 2017,
        keywords: ['generator', 'diesel', 'electrogen', 'grup', 'putere', 'pornire', 'combustibil', 'autonomie', 'ATS'],
        summary: 'Normativ pentru proiectarea și instalarea grupurilor electrogene diesel - critice pentru alimentarea de rezervă a centrelor de date.',
        content: `PE 132/2017 - GRUPURI ELECTROGENE

═══════════════════════════════════════════════════════════
CAP. 1 - GENERALITĂȚI
═══════════════════════════════════════════════════════════

1.1 Aplicabilitate:
- Grupuri electrogene cu motoare cu ardere internă
- Puteri: 10 kW - 5000 kW
- Tensiuni: 400V, 690V, medie tensiune

1.2 Clasificare pentru datacenter:

Cerințe în funcție de Tier:
┌─────────────────────────┬───────────────────────────────────┐
│ Tier                    │ Cerințe generator                 │
├─────────────────────────┼───────────────────────────────────┤
│ Tier I                  │ 1×N, optional                     │
│ Tier II                 │ 1×N, obligatoriu                  │
│ Tier III                │ N+1 (sau 2N în paralel)          │
│ Tier IV                 │ 2N sau 2(N+1)                     │
└─────────────────────────┴───────────────────────────────────┘

═══════════════════════════════════════════════════════════
CAP. 2 - DIMENSIONARE
═══════════════════════════════════════════════════════════

2.1 Tipuri de sarcină:

Sarcină tip 1 - Rezistivă:
- PF = 1.0
- Încălzitoare, iluminat incandescent
- Fără curent de pornire suplimentar

Sarcină tip 2 - Inductivă:
- PF = 0.8
- Motoare, transformatoare, compresoare
- Curent pornire: 5-7 × In

Sarcină tip 3 - Nelineară:
- PF = 0.7-0.9, THD ridicat
- UPS, VFD, servere
- Necesită supradimensionare 20-30%

2.2 Calcul putere generator pentru datacenter:

P_gen = (P_IT × 1.2) + P_cooling + P_lighting + P_misc

Unde:
- P_IT = sarcină totală IT (kW)
- Factor 1.2 = rezervă pentru UPS și pierderi
- P_cooling = CRAC + chillere + pompe
- P_lighting = iluminat + prize
- P_misc = sisteme securitate, lift, etc.

2.3 Factori de corecție:
- Altitudine >1000m: -3% per 300m
- Temperatură >25°C: -2% per 5°C
- Factor neprevăzute: +10-15%

═══════════════════════════════════════════════════════════
CAP. 3 - PORNIRE ȘI TRANSFER
═══════════════════════════════════════════════════════════

3.1 Timpii de reacție:
┌─────────────────────────┬───────────────────────────────────┐
│ Parametru               │ Cerință datacenter                │
├─────────────────────────┼───────────────────────────────────┤
│ Detecție cădere rețea   │ <1 secundă                       │
│ Pornire generator       │ <10 secunde (Tier IV)            │
│                         │ <15 secunde (Tier III)           │
│ Preluare sarcină        │ <30 secunde total                │
│ Sincronizare rețea      │ <60 secunde                      │
└─────────────────────────┴───────────────────────────────────┘

3.2 Sistem de transfer automat (ATS):
- Întrerupătoare automate cu interblocare mecanică
- Comandă electronică cu logică prioritate
- Mod test pentru transfer în sarcină
- Monitorizare parametri ambele surse

3.3 Scheme de transfer:
- Open transition: break-before-make (standard)
- Closed transition: make-before-break (minim <100ms)
- Soft load transfer: transfer gradual la rețea

═══════════════════════════════════════════════════════════
CAP. 4 - COMBUSTIBIL ȘI STOCARE
═══════════════════════════════════════════════════════════

4.1 Autonomie combustibil:
┌─────────────────────────┬───────────────────────────────────┐
│ Tier                    │ Autonomie minimă                  │
├─────────────────────────┼───────────────────────────────────┤
│ Tier I                  │ 4 ore                             │
│ Tier II                 │ 12 ore                            │
│ Tier III                │ 24 ore                            │
│ Tier IV                 │ 48-72 ore                         │
└─────────────────────────┴───────────────────────────────────┘

4.2 Calcul consum combustibil:
C = P × 0.21 × factor_sarcină [litri/oră]

Unde:
- P = putere la arbore [kW]
- 0.21 = consum specific motorase diesel moderne
- factor_sarcină = 0.7-1.0

4.3 Rezervoare:
- Rezervor de zi: 4-8 ore, integrat sau adiacent
- Rezervor principal: exterior, subteran sau suprateran
- Cuvă de retenție: 110% volum rezervor
- Alimentare automată: pompă transfer cu nivel

4.4 Calitate motorină:
- EN 590 standard, low-sulfur
- Aditivare pentru stocare >6 luni
- Filtrare periodică (separator de apă)
- Testare anuală: conform ASTM D975

═══════════════════════════════════════════════════════════
CAP. 5 - AMPLASARE ȘI INSTALARE
═══════════════════════════════════════════════════════════

5.1 Amplasare preferată:
- Exterior în container insonorizat: ideal
- Încăpere dedicată interior: acceptabil
- Acoperiș: cu precauții structurale

5.2 Cerințe pentru camera generator (interior):
- Rezistență la foc: REI 120
- Ventilație: radiator + aer ardere
- Debit aer: 10-15 m³/s per 500kVA
- Atenuatoare zgomot pe admisie/evacuare
- Acces pentru mentenanță: min 1m pe 3 laturi

5.3 Conexiuni flexibile:
- Evacuare gaze: expansiune termică
- Combustibil: racord flexibil antivibrație
- Cabluri electrică: conexiuni flexibile
- Fundație antivibratoare: plută de beton flotantă

═══════════════════════════════════════════════════════════
CAP. 6 - MENTENANȚĂ ȘI TESTE
═══════════════════════════════════════════════════════════

6.1 Program teste:
┌─────────────────────────┬───────────────────────────────────┐
│ Frecvență               │ Tip test                          │
├─────────────────────────┼───────────────────────────────────┤
│ Zilnic                  │ Verificare vizuală automată       │
│ Săptămânal              │ Pornire la gol 10-15 minute       │
│ Lunar                   │ Funcționare la sarcină 30+ min    │
│ Trimestrial             │ Test ATS și transfer complet      │
│ Anual                   │ Test durată 4-8 ore la sarcină    │
└─────────────────────────┴───────────────────────────────────┘

6.2 Mentenanță preventivă:
- Schimb ulei: la 250-500 ore sau anual
- Filtre (aer, combustibil, ulei): conform producător
- Lichid răcire: verificare concentrație antigel
- Baterie pornire: testare capacitate semestrială`,
        articles: [
            {
                id: 'pe132-sizing',
                title: 'Dimensionare generator datacenter',
                content: 'Pentru datacenter, puterea generatorului = (sarcina IT × 1.2) + răcire + iluminat + diverse. UPS-urile au factor de putere 0.9 și creează distorsiuni armonice, necesitând supradimensionare cu 20-30%. Se adaugă rezervă de 10-15% pentru dezvoltare.',
                keywords: ['generator', 'dimensionare', 'putere', 'UPS', 'calcul']
            },
            {
                id: 'pe132-fuel',
                title: 'Autonomie combustibil',
                content: 'Autonomia combustibil pentru Tier IV este 48-72 ore la sarcină nominală. Consumul tipic diesel modern: 0.21 l/kW×h. Pentru un generator de 1000kVA la sarcină 80%, consumul este ~170 l/h, adică ~12.000 litri pentru 72 ore. Rezervor de zi: min 8 ore.',
                keywords: ['combustibil', 'diesel', 'autonomie', 'rezervor', 'consum']
            }
        ]
    },
    {
        id: 'gp041-commissioning',
        code: 'GP 041/2021',
        title: 'Ghid privind punerea în funcțiune a construcțiilor',
        source: 'Romanian',
        category: 'infrastructure',
        year: 2021,
        keywords: ['recepție', 'punere', 'funcțiune', 'teste', 'verificare', 'ISC', 'comisionare', 'FAT', 'SAT'],
        summary: 'Ghid pentru punerea în funcțiune și recepția construcțiilor - include proceduri de comisionare specifice pentru centre de date.',
        content: `GP 041/2021 - PUNEREA ÎN FUNCȚIUNE (COMISIONARE)

═══════════════════════════════════════════════════════════
CAP. 1 - ETAPE COMISIONARE DATACENTER
═══════════════════════════════════════════════════════════

1.1 Fazele de comisionare:
┌─────────────────────────┬───────────────────────────────────┐
│ Fază                    │ Descriere                         │
├─────────────────────────┼───────────────────────────────────┤
│ FAT (Factory)           │ Teste la producător               │
│ Delivery & Install      │ Livrare și instalare              │
│ SAT (Site)              │ Teste individuale pe amplasament  │
│ Integration             │ Teste integrate sisteme           │
│ IST (Integrated Sys.)   │ Teste scenarii critice            │
│ Handover                │ Predare și instruire              │
└─────────────────────────┴───────────────────────────────────┘

1.2 Documente necesare pentru fiecare fază:
- Proceduri de testare
- Checklist-uri de verificare
- Rapoarte de teste (semnate)
- Punch list (neconformități)
- Certificat de finalizare fază

═══════════════════════════════════════════════════════════
CAP. 2 - TESTE SISTEME ELECTRICE
═══════════════════════════════════════════════════════════

2.1 TGBT și tablouri:
□ Verificare montaj și etichetare
□ Măsurători rezistență izolație (>1 MΩ)
□ Teste continuitate PE
□ Verificare secvență faze
□ Teste funcționale întrerupătoare
□ Măsurare puteri de rupere (certificat)

2.2 UPS:
□ Verificare baterii (impedanță, capacitate)
□ Test autonomie reală (la sarcină)
□ Test bypass automat și manual
□ Test sincronizare cu generator
□ Test EPO (Emergency Power Off)
□ Verificare armonice (THD)

2.3 Generator:
□ Test pornire automată (<10s)
□ Test preluare sarcină în etape
□ Test funcționare 4+ ore la sarcină
□ Test transfer retur la rețea
□ Măsurare emisii și zgomot
□ Verificare nivel vibrații

2.4 Teste integrate electrică:
□ Simulare cădere rețea completă
□ Verificare secvență: rețea → UPS → generator → rețea
□ Test simultaneitate generator + UPS
□ Verificare selectivitate protecții

═══════════════════════════════════════════════════════════
CAP. 3 - TESTE SISTEME MECANICE
═══════════════════════════════════════════════════════════

3.1 HVAC / CRAC:
□ Echilibrare debite (±10% din nominal)
□ Verificare temperatură și umiditate
□ Test pornire/oprire și alarme
□ Verificare funcționare free-cooling
□ Măsurare nivel zgomot
□ Verificare presiune diferențială

3.2 Chillere:
□ Test pornire și oprire controlată
□ Verificare temperature apă
□ Test rotație lead/lag
□ Verificare redundanță (N+1)
□ Măsurare consum și COP

3.3 Protecție la incendiu:
□ Test detecție VESDA (fum artificial)
□ Verificare zonare și alarmă
□ Test prealarmă și countdownn
□ Test manual abort
□ Test integrare cu BMS (oprire HVAC)

═══════════════════════════════════════════════════════════
CAP. 4 - TESTE SCENARII CRITICE (IST)
═══════════════════════════════════════════════════════════

4.1 Scenarii obligatorii pentru datacenter:

Scenariu 1 - Cădere rețea:
- Simulare pierdere completă rețea electrică
- Verificare: UPS preia instant, generator pornește, transfer
- Durată test: 4+ ore pe generator

Scenariu 2 - Defect UPS:
- Simulare defect UPS principal
- Verificare: transfer automat pe bypass sau UPS redundant
- Nu se pierde alimentarea IT

Scenariu 3 - Defect CRAC:
- Simulare defect unitate CRAC
- Verificare: pornire automată CRAC rezervă
- Temperatura nu depășește 27°C în sala

Scenariu 4 - Defect chiller:
- Simulare defect chiller principal
- Verificare: pornire automată chiller rezervă
- Temperatura apă răcită în limite

Scenariu 5 - Incendiu simulat:
- Declanșare detectoare cu fum test
- Verificare: oprire HVAC, prealarmă, abort posibil
- Nu se descarcă gaz (test sec)

4.2 Documentare IST:
- Video înregistrare toate testele
- Raport detaliat cu timings
- Punch list pentru remedieri
- Semnături reprezentanți beneficiar/constructor/ISC

═══════════════════════════════════════════════════════════
CAP. 5 - RECEPȚIE LEGALĂ
═══════════════════════════════════════════════════════════

5.1 Documente pentru recepția la terminarea lucrărilor:
- Cărțile tehnice ale construcției
- Certificate de calitate materiale
- Procese verbale lucrări ascunse
- Rapoarte de încercare (beton, suduri, etc.)
- Certificate echipamente (CE, ISO)
- Rapoarte comisionare toate sistemele

5.2 Comisie de recepție:
- Reprezentant ISC (obligatoriu pentru speciale)
- Proiectant sau verificator
- Beneficiar
- Constructor

5.3 După recepție:
- Perioada de garanție: 12-24 luni
- Mentenanță contractuală
- Instruire personal operare`,
        articles: [
            {
                id: 'gp041-ist',
                title: 'Teste scenarii integrate (IST)',
                content: 'Testele de sisteme integrate (IST) sunt critice pentru validarea datacenter-ului. Se simulează scenarii de avarie: cădere rețea (4+ ore), defect UPS, defect CRAC, defect chiller, incendiu. Fiecare scenariu verifică răspunsul automat și timpii de reacție. Se documentează cu video și rapoarte detaliate.',
                keywords: ['IST', 'test', 'scenariu', 'integrare', 'avarie', 'simulare']
            },
            {
                id: 'gp041-handover',
                title: 'Predarea datacenter-ului',
                content: 'La predare se furnizează: cărțile tehnice, certificatele de conformitate, rapoartele de comisionare, as-built drawings, manuale de operare, și se face instruirea personalului. Perioada de garanție este de 12-24 luni. Se recomandă contract de mentenanță cu instalatorul.',
                keywords: ['predare', 'handover', 'recepție', 'garanție', 'documentație']
            }
        ]
    },
    {
        id: 'cr0-concrete',
        code: 'CR 0/2021',
        title: 'Cod de proiectare pentru structuri din beton, beton armat și beton precomprimat',
        source: 'Romanian',
        category: 'infrastructure',
        year: 2021,
        keywords: ['beton', 'armat', 'structură', 'armătură', 'rezistență', 'fundație', 'radier', 'pilori'],
        summary: 'Codul de proiectare pentru structuri din beton armat - esențial pentru fundații și suprastructura datacenter.',
        content: `CR 0/2021 - STRUCTURI DIN BETON ARMAT

═══════════════════════════════════════════════════════════
CAP. 1 - APLICABILITATE PENTRU DATACENTER
═══════════════════════════════════════════════════════════

1.1 Elemente de beton tipice:
- Radier general (fundație întreagă)
- Fundații izolate cu grinzi de echilibrare
- Stâlpi și grinzi cadru
- Pereți de compartimentare structurali
- Planseu pentru podea tehnică

1.2 Clase de beton pentru datacenter:
┌─────────────────────────┬───────────────────────────────────┐
│ Element                 │ Clasă minimă beton                │
├─────────────────────────┼───────────────────────────────────┤
│ Radier                  │ C25/30                            │
│ Fundații izolate        │ C25/30                            │
│ Stâlpi, grinzi          │ C30/37 - C40/50                   │
│ Pereți structurali      │ C25/30                            │
│ Planseu                 │ C25/30                            │
└─────────────────────────┴───────────────────────────────────┘

═══════════════════════════════════════════════════════════
CAP. 2 - SARCINI SPECIFICE
═══════════════════════════════════════════════════════════

2.1 Sarcini de la echipamente IT:
- Rack standard: 10-15 kN (1000-1500 kg)
- Rack high-density: 20-30 kN (2000-3000 kg)
- UPS modular: 50-100 kN
- Baterii: 500-1000 kg/m²
- Generator: 10-20 kN/m²

2.2 Rezistență podea:
- Minimum general: 12 kN/m² (1200 kg/m²)
- Zone echipamente grele: 25-35 kN/m²
- Verificare sarcini punctiforme pe picioarele rack

2.3 Fundații pentru echipamente vibrante:
- Generator: fundație separată, izolată de structură
- Chillere compresoare: amortizoare, masă suplimentară
- Transformatoare: cuvă de retenție, separare

═══════════════════════════════════════════════════════════
CAP. 3 - CERINȚE CONSTRUCTIVE
═══════════════════════════════════════════════════════════

3.1 Radier general:
- Grosime tipică: 400-600 mm
- Armare: minim Ø12/15 ambele direcții, două straturi
- Beton: C25/30 minim, impermeabil (W8)
- Hidroizolație: obligatorie (bentonitică sau membrana)

3.2 Toleranțe planitate:
- Generală: ±10 mm pe 3m
- Pentru podea tehnică: ±5 mm pe 3m
- Pentru rack-uri înalte: ±3 mm pe 3m

3.3 Protecție împotriva umezelii:
- Barieră vapori sub radier
- Drenaj perimetral
- Pompare apă subterană dacă este cazul`,
        articles: [
            {
                id: 'cr0-loads',
                title: 'Sarcini pe podeaua datacenter',
                content: 'Podeaua datacenter trebuie proiectată pentru sarcini de minim 12 kN/m² (1200 kg/m²), iar în zonele cu echipamente grele (UPS, baterii) până la 35 kN/m². Rack-urile se ancorează cu șuruburi M12 în placa de beton sau în suporturile podelei tehnice ancorate structural.',
                keywords: ['sarcină', 'podea', 'beton', 'rack', 'greutate']
            }
        ]
    }
];

// ============================================================================
// Funcții de căutare
// ============================================================================

export interface SearchResult {
    entry: NormativeEntry;
    relevanceScore: number;
    matchedKeywords: string[];
    matchedArticles?: NormativeArticle[];
}

/**
 * Normalizează textul pentru căutare (lowercase, elimină diacritice)
 */
function normalizeText(text: string): string {
    return text
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '') // Elimină diacritice
        .replace(/[^\w\s]/g, ' ') // Înlocuiește punctuație cu spații
        .trim();
}

/**
 * Caută în registry după cuvinte cheie
 */
export function searchNormatives(
    query: string,
    filters?: {
        sources?: NormativeSource[];
        categories?: NormativeCategory[];
    }
): SearchResult[] {
    if (!query.trim()) return [];

    const normalizedQuery = normalizeText(query);
    const queryWords = normalizedQuery.split(/\s+/).filter(w => w.length > 2);

    if (queryWords.length === 0) return [];

    const results: SearchResult[] = [];

    for (const entry of normativeRegistry) {
        // Aplicăm filtre
        if (filters?.sources && filters.sources.length > 0) {
            if (!filters.sources.includes(entry.source)) continue;
        }
        if (filters?.categories && filters.categories.length > 0) {
            if (!filters.categories.includes(entry.category)) continue;
        }

        // Calculăm scorul de relevanță
        let score = 0;
        const matchedKeywords: string[] = [];
        const matchedArticles: NormativeArticle[] = [];

        // Căutare în keywords (scor mare)
        for (const keyword of entry.keywords) {
            const normalizedKeyword = normalizeText(keyword);
            for (const word of queryWords) {
                if (normalizedKeyword.includes(word) || word.includes(normalizedKeyword)) {
                    score += 10;
                    if (!matchedKeywords.includes(keyword)) {
                        matchedKeywords.push(keyword);
                    }
                }
            }
        }

        // Căutare în titlu (scor mediu)
        const normalizedTitle = normalizeText(entry.title);
        for (const word of queryWords) {
            if (normalizedTitle.includes(word)) {
                score += 5;
            }
        }

        // Căutare în cod (scor mediu)
        const normalizedCode = normalizeText(entry.code);
        for (const word of queryWords) {
            if (normalizedCode.includes(word)) {
                score += 7;
            }
        }

        // Căutare în conținut (scor mic)
        const normalizedContent = normalizeText(entry.content);
        for (const word of queryWords) {
            if (normalizedContent.includes(word)) {
                score += 2;
            }
        }

        // Căutare în articole (scor mediu și le adaugă la rezultate)
        if (entry.articles) {
            for (const article of entry.articles) {
                let articleMatch = false;
                const normalizedArticleContent = normalizeText(article.title + ' ' + article.content);

                for (const word of queryWords) {
                    if (normalizedArticleContent.includes(word)) {
                        articleMatch = true;
                        score += 3;
                    }
                }

                for (const kw of article.keywords) {
                    const normalizedKw = normalizeText(kw);
                    for (const word of queryWords) {
                        if (normalizedKw.includes(word)) {
                            articleMatch = true;
                            score += 5;
                        }
                    }
                }

                if (articleMatch) {
                    matchedArticles.push(article);
                }
            }
        }

        if (score > 0) {
            results.push({
                entry,
                relevanceScore: score,
                matchedKeywords,
                matchedArticles: matchedArticles.length > 0 ? matchedArticles : undefined
            });
        }
    }

    // Sortare după relevanță
    return results.sort((a, b) => b.relevanceScore - a.relevanceScore);
}

/**
 * Obține toate sursele unice
 */
export function getAllSources(): NormativeSource[] {
    const sources = new Set<NormativeSource>();
    for (const entry of normativeRegistry) {
        sources.add(entry.source);
    }
    return Array.from(sources);
}

/**
 * Obține toate categoriile unice
 */
export function getAllCategories(): NormativeCategory[] {
    const categories = new Set<NormativeCategory>();
    for (const entry of normativeRegistry) {
        categories.add(entry.category);
    }
    return Array.from(categories);
}

/**
 * Traduceri pentru categorii
 */
export const categoryTranslations: Record<NormativeCategory, string> = {
    thermal: 'Termic',
    electrical: 'Electric',
    fire: 'Incendiu',
    infrastructure: 'Infrastructură',
    cabling: 'Cablaje',
    redundancy: 'Redundanță',
    hvac: 'HVAC',
    security: 'Securitate',
    power: 'Alimentare',
    cooling: 'Răcire'
};

/**
 * Traduceri pentru surse
 */
export const sourceTranslations: Record<NormativeSource, string> = {
    'ASHRAE': 'ASHRAE',
    'TIA-942': 'TIA-942',
    'EN-50600': 'EN 50600',
    'Uptime': 'Uptime Institute',
    'Romanian': 'Normative RO',
    'IEEE': 'IEEE'
};
