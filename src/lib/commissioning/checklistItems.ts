/**
 * Commissioning Checklist Items
 * Defines categories and checklist items for system commissioning
 */

export interface ChecklistItem {
    id: string;
    category: string;
    title: string;
    description: string;
    priority: 'critical' | 'high' | 'medium' | 'low';
    requiresSignoff: boolean;
}

export interface ChecklistCategory {
    id: string;
    name: string;
    icon: string;  // Lucide icon name
    color: string; // Tailwind color class
}

export const CHECKLIST_CATEGORIES: ChecklistCategory[] = [
    { id: 'pre-start', name: 'Pre-Start Checks', icon: 'ClipboardCheck', color: 'blue' },
    { id: 'hydraulic', name: 'Hydraulic Balance', icon: 'Droplets', color: 'cyan' },
    { id: 'safety', name: 'Safety Systems', icon: 'Shield', color: 'red' },
    { id: 'controls', name: 'Controls & Automation', icon: 'Cpu', color: 'purple' },
    { id: 'performance', name: 'Performance Testing', icon: 'Activity', color: 'green' },
    { id: 'documentation', name: 'Documentation', icon: 'FileText', color: 'amber' },
];

export const CHECKLIST_ITEMS: ChecklistItem[] = [
    // =========================================================================
    // PRE-START CHECKS
    // =========================================================================
    {
        id: 'pre-1',
        category: 'pre-start',
        title: 'Verificare Completitudine Instalație',
        description: 'Toate conductele, armăturile și echipamentele sunt montate conform proiectului.',
        priority: 'critical',
        requiresSignoff: true,
    },
    {
        id: 'pre-2',
        category: 'pre-start',
        title: 'Verificare Vizuală Suduri',
        description: 'Inspectie vizuală a tuturor sudurilor pentru defecte sau neconformități.',
        priority: 'critical',
        requiresSignoff: true,
    },
    {
        id: 'pre-3',
        category: 'pre-start',
        title: 'Proba de Presiune (Hidrostatică)',
        description: 'Proba de presiune 1.5x presiunea de lucru, menținere minim 2 ore.',
        priority: 'critical',
        requiresSignoff: true,
    },
    {
        id: 'pre-4',
        category: 'pre-start',
        title: 'Spălare Sistem',
        description: 'Spălarea conductelor pentru îndepărtarea impurităților din instalare.',
        priority: 'high',
        requiresSignoff: false,
    },
    {
        id: 'pre-5',
        category: 'pre-start',
        title: 'Verificare Suporți și Dilatări',
        description: 'Toate punctele fixe și compensatoarele de dilatare sunt corect montate.',
        priority: 'high',
        requiresSignoff: false,
    },
    {
        id: 'pre-6',
        category: 'pre-start',
        title: 'Izolație Termică Completă',
        description: 'Verificare izolație pe toate conductele conform specificațiilor.',
        priority: 'medium',
        requiresSignoff: false,
    },

    // =========================================================================
    // HYDRAULIC BALANCE
    // =========================================================================
    {
        id: 'hyd-1',
        category: 'hydraulic',
        title: 'Umplere Circuit și Dezaerare',
        description: 'Umplerea circuitului cu apă/glicol și evacuarea aerului din sistem.',
        priority: 'critical',
        requiresSignoff: true,
    },
    {
        id: 'hyd-2',
        category: 'hydraulic',
        title: 'Verificare Concentrație Glicol',
        description: 'Măsurare refractometrică pentru confirmarea procentului de glicol.',
        priority: 'high',
        requiresSignoff: true,
    },
    {
        id: 'hyd-3',
        category: 'hydraulic',
        title: 'Pornire Pompe Principal',
        description: 'Prima pornire a pompelor, verificare rotație și vibrații.',
        priority: 'critical',
        requiresSignoff: true,
    },
    {
        id: 'hyd-4',
        category: 'hydraulic',
        title: 'Echilibrare Circuite',
        description: 'Reglarea robinetelor de echilibrare pentru debite conforme proiectului.',
        priority: 'high',
        requiresSignoff: true,
    },
    {
        id: 'hyd-5',
        category: 'hydraulic',
        title: 'Verificare Presiune Diferențială',
        description: 'Măsurare ΔP pe chiliere, schimbătoare și consumatori.',
        priority: 'medium',
        requiresSignoff: false,
    },
    {
        id: 'hyd-6',
        category: 'hydraulic',
        title: 'Setare Vas Expansiune',
        description: 'Verificare presiune preîncărcare și volum vas expansiune.',
        priority: 'medium',
        requiresSignoff: false,
    },

    // =========================================================================
    // SAFETY SYSTEMS
    // =========================================================================
    {
        id: 'safe-1',
        category: 'safety',
        title: 'Test Supape de Siguranță',
        description: 'Verificare funcționare supape siguranță la presiunea de setare.',
        priority: 'critical',
        requiresSignoff: true,
    },
    {
        id: 'safe-2',
        category: 'safety',
        title: 'Test Flow Switch',
        description: 'Verificare declanșare flow switch și interblocare echipamente.',
        priority: 'high',
        requiresSignoff: true,
    },
    {
        id: 'safe-3',
        category: 'safety',
        title: 'Test Low Pressure Switch',
        description: 'Verificare declanșare la presiune minimă.',
        priority: 'high',
        requiresSignoff: true,
    },
    {
        id: 'safe-4',
        category: 'safety',
        title: 'Test High Pressure Switch',
        description: 'Verificare declanșare la presiune maximă.',
        priority: 'high',
        requiresSignoff: true,
    },
    {
        id: 'safe-5',
        category: 'safety',
        title: 'Verificare Leak Detection',
        description: 'Test senzori de scurgere și alarme asociate.',
        priority: 'medium',
        requiresSignoff: false,
    },

    // =========================================================================
    // CONTROLS & AUTOMATION
    // =========================================================================
    {
        id: 'ctrl-1',
        category: 'controls',
        title: 'Calibrare Senzori Temperatură',
        description: 'Verificare și calibrare senzori de temperatură.',
        priority: 'high',
        requiresSignoff: true,
    },
    {
        id: 'ctrl-2',
        category: 'controls',
        title: 'Calibrare Senzori Presiune',
        description: 'Verificare și calibrare traductoare de presiune.',
        priority: 'high',
        requiresSignoff: true,
    },
    {
        id: 'ctrl-3',
        category: 'controls',
        title: 'Test Valve Actuate',
        description: 'Verificare funcționare și poziționare vane motorizate.',
        priority: 'high',
        requiresSignoff: true,
    },
    {
        id: 'ctrl-4',
        category: 'controls',
        title: 'Comunicație BMS',
        description: 'Verificare comunicație și puncte cu sistemul BMS.',
        priority: 'medium',
        requiresSignoff: false,
    },
    {
        id: 'ctrl-5',
        category: 'controls',
        title: 'Secvențiere Pornire/Oprire',
        description: 'Verificare secvență automată de pornire și oprire.',
        priority: 'medium',
        requiresSignoff: false,
    },

    // =========================================================================
    // PERFORMANCE TESTING
    // =========================================================================
    {
        id: 'perf-1',
        category: 'performance',
        title: 'Test Capacitate Răcire 100%',
        description: 'Verificare capacitate nominală la sarcină maximă.',
        priority: 'critical',
        requiresSignoff: true,
    },
    {
        id: 'perf-2',
        category: 'performance',
        title: 'Test Tranziție Sarcini',
        description: 'Comportare sistem la variații rapide de sarcină.',
        priority: 'high',
        requiresSignoff: true,
    },
    {
        id: 'perf-3',
        category: 'performance',
        title: 'Test Redundanță N+1',
        description: 'Oprire echipament și verificare preluare automată.',
        priority: 'critical',
        requiresSignoff: true,
    },
    {
        id: 'perf-4',
        category: 'performance',
        title: 'Test Free Cooling',
        description: 'Verificare tranziție la răcire liberă și eficiență.',
        priority: 'high',
        requiresSignoff: true,
    },
    {
        id: 'perf-5',
        category: 'performance',
        title: 'Măsurare PUE',
        description: 'Măsurare eficiență energetică pentru benchmarking.',
        priority: 'medium',
        requiresSignoff: false,
    },

    // =========================================================================
    // DOCUMENTATION
    // =========================================================================
    {
        id: 'doc-1',
        category: 'documentation',
        title: 'As-Built Drawings',
        description: 'Scheme hidraulice actualizate conform execuție.',
        priority: 'high',
        requiresSignoff: true,
    },
    {
        id: 'doc-2',
        category: 'documentation',
        title: 'Rapoarte Calibrare',
        description: 'Certificate calibrare echipamente de măsură.',
        priority: 'high',
        requiresSignoff: true,
    },
    {
        id: 'doc-3',
        category: 'documentation',
        title: 'Manuale Operare',
        description: 'Manuale O&M pentru toate echipamentele majore.',
        priority: 'medium',
        requiresSignoff: false,
    },
    {
        id: 'doc-4',
        category: 'documentation',
        title: 'Training Operatori',
        description: 'Instruire personal operare și întreținere.',
        priority: 'medium',
        requiresSignoff: false,
    },
    {
        id: 'doc-5',
        category: 'documentation',
        title: 'Proces Verbal Recepție',
        description: 'Document final semnare recepție lucrări.',
        priority: 'critical',
        requiresSignoff: true,
    },
];

/**
 * Get items by category
 */
export function getItemsByCategory(categoryId: string): ChecklistItem[] {
    return CHECKLIST_ITEMS.filter(item => item.category === categoryId);
}

/**
 * Get category by ID
 */
export function getCategoryById(id: string): ChecklistCategory | undefined {
    return CHECKLIST_CATEGORIES.find(cat => cat.id === id);
}

/**
 * Count items by priority in a category
 */
export function countByPriority(categoryId: string): Record<string, number> {
    const items = getItemsByCategory(categoryId);
    return items.reduce((acc, item) => {
        acc[item.priority] = (acc[item.priority] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);
}
