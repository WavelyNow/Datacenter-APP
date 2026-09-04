export type HelpCategory = 'general' | 'bim' | 'engineering' | 'export';

export interface HelpItem {
    id: string;
    title: string;
    description: string;
    tips: string[];
    category: HelpCategory;
}

export const helpRegistry: Record<string, HelpItem> = {
    'global-export': {
        id: 'global-export',
        title: 'Export & Raportare',
        description: 'Generează rapoarte profesionale în format PDF sau Excel pentru proiectul curent.',
        category: 'export',
        tips: [
            'Previzualizează raportul PDF înainte de descărcare.',
            'Raportul PDF include automat sigla companiei tale dacă este configurată.',
            'Exportul Excel conține date tabelare pentru prelucrare externă.'
        ]
    },
    'bim-upload': {
        id: 'bim-upload',
        title: 'Galerie 3D — Modele producători & import GLB',
        description: 'Explorarea modelelor 3D ale producătorilor sau importul propriilor fișiere .glb/.gltf (ex. modele GF descărcate de pe cad.georgfischer.com).',
        category: 'bim',
        tips: [
            'Butonul "Import GLB" acceptă fișiere .glb / .gltf descărcate de la producători.',
            'Modelele Sketchfab din librărie sunt verificate (nu conțin id-uri inventate).',
            'Producătorii care nu publică pe Sketchfab (STULZ, Delta, CoolIT, Rittal, nVent) oferă BIM/CAD pe site-urile lor.'
        ]
    },
    'bim-checklist': {
        id: 'bim-checklist',
        title: 'Standarde Țevi — datele oficiale',
        description: 'Pagina "Standarde Țevi" conține dimensiunile verificate (Ø exterior/interior, grosime, greutate) pentru GF COOL-FIT, Uponor, Pipelife, Valrom ș.a. — editabile local.',
        category: 'bim',
        tips: [
            'Ø interior = Ø exterior − 2 × grosime (apăsă butonul de auto-corectare dacă diferă).',
            'Modificările salvate se aplică instant în toate calculele proiectului.',
            '"Date Oficiale" readuce valorile verificate din librăria aplicației.'
        ]
    },
    'nav-dashboard': {
        id: 'nav-dashboard',
        title: 'Panou de Control (Dashboard)',
        description: 'Privire de ansamblu asupra proiectului: statistici rapide, volume totale și grafice de eficiență.',
        category: 'general',
        tips: [
            'Cardurile de sus se actualizează în timp real când modifici parametrii.',
            'Secțiunea "Project Health" îți arată dacă ești gata de export.'
        ]
    },
    'hydraulic-calc': {
        id: 'hydraulic-calc',
        title: 'Calcul Hidraulic & Viteze',
        description: 'Modulul principal pentru dimensionarea conductelor și calculul pierderilor de sarcină.',
        category: 'engineering',
        tips: [
            'Viteza ideală pentru transportul agentului termic este între 0.5 și 1.5 m/s.',
            'Căderile de presiune sunt calculate folosind formula Colebrook-White.',
            'Poți schimba tipul de fluid și concentrația de glicol pentru calcule precise la temperaturi scăzute.'
        ]
    },
    'support-engineering': {
        id: 'support-engineering',
        title: 'Sisteme de Suport & Montaj',
        category: 'engineering',
        description: 'Configurează distanța dintre suporți și tipul de prindere (suspendat sau pardoseală).',
        tips: [
            'Distanța maximă recomandată între suporți pentru țevi de oțel este de obicei 2.5m - 3.0m.',
            'Aplicația calculează greutatea totală (țeavă + fluid + izolație) pentru fiecare punct de sprijin.',
            'Poți activa/dezactiva consolele laterale sau șina superioară din meniul de configurare.'
        ]
    },
    'weight-distribution': {
        id: 'weight-distribution',
        title: 'Distribuția Greutății & Încărcări',
        category: 'engineering',
        description: 'Analiză statică pentru structura de rezistență a clădirii.',
        tips: [
            'Tabelul de greutăți exportă valorile punctuale necesare inginerului de structură.',
            'Sunt luate în calcul densitățile specifice pentru apă, etilen-glicol și propilen-glicol.',
            'Atenție la factorul de siguranță (implicit 5%) care adaugă o rezervă pentru fitinguri și prinderi.'
        ]
    },
    'catalog-management': {
        id: 'catalog-management',
        title: 'Gestiune Cataloage & Echipamente',
        category: 'general',
        description: 'Baza de date cu echipamente reale (Pompe, Chillere, Aeroterme) de la diverși producători.',
        tips: [
            'Poți adăuga echipamente custom dacă nu le găsești în baza de date standard.',
            'Fiecare echipament poate avea fișă tehnică (PDF) și imagini atașate.',
            'Selecția se face automat pe baza punctului de funcționare (Debit/Înălțime de pompare).'
        ]
    }
};
