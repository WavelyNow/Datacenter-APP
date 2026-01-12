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
            'Poți selecta ce secțiuni să incluzi (ex: doar volume, sau și fișe tehnice).',
            'Raportul PDF include automat sigla companiei tale dacă este configurată.',
            'Exportul "Sustainability" include calculul PUE și amprenta de carbon.'
        ]
    },
    'pue-gauge': {
        id: 'pue-gauge',
        title: 'Indicator PUE (Power Usage Effectiveness)',
        description: 'Măsoară eficiența energetică a centrului de date. Un PUE de 1.0 este ideal (eficiență perfectă).',
        category: 'engineering',
        tips: [
            'Valori sub 1.5 sunt considerate "Bune".',
            'Valori peste 2.0 indică ineficiență majoră.',
            'Scăderea PUE se face prin optimizarea răcirii (ex: Free Cooling).'
        ]
    },
    'bim-upload': {
        id: 'bim-upload',
        title: 'Import Fișiere BIM (IFC)',
        description: 'Încarcă modelul 3D al instalației pentru a extrage automat cantitățile de materiale.',
        category: 'bim',
        tips: [
            'Sunt suportate fișiere .ifc standard (IFC2x3, IFC4).',
            'Aplicația detectează automat sistemele (Tur/Retur) și conexiunile.',
            'Dacă un echipament nu este recunoscut, poți folosi "Wizard-ul" pentru mapare manuală.'
        ]
    },
    'bim-checklist': {
        id: 'bim-checklist',
        title: 'Sumar Echipamente BIM',
        description: 'Lista completă a obiectelor detectate în fișierul importat.',
        category: 'bim',
        tips: [
            'Folosește "Group by System" pentru a organiza lista.',
            'Elementele cu "Roșu" necesită atenție (nu sunt mapate la un produs din catalog).',
            'Poți exporta această listă separat folosind butonul "Export BOM".'
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

