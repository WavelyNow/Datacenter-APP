
export interface SupportProfile {
    id: string;
    name: string;
    description: string;
    maxLoadKg: number; // Maximum safe working load in kg per point
    category: 'clamp' | 'rail_light' | 'rail_medium' | 'rail_heavy';
    profileRef?: string; // Reference to a structural profile name (e.g. "UNP 100") if applicable

}

export const SUPPORT_PROFILES: SupportProfile[] = [
    {
        id: 'clamp_m8',
        name: 'Colier M8/M10 (Simplu)',
        description: 'Prindere simplă în tavan (tijă filetată)',
        maxLoadKg: 50,
        category: 'clamp'
    },
    {
        id: 'rail_us3',
        name: 'Profil US3 (20x30) / Muepro Light',
        description: 'Profil ușor pentru țevi mici',
        maxLoadKg: 100,
        category: 'rail_light'
    },
    {
        id: 'rail_us5',
        name: 'Profil US5 (41x41) / Muepro Medium',
        description: 'Profil standard universal (Strut 41x41)',
        maxLoadKg: 250,
        category: 'rail_medium'
    },
    {
        id: 'rail_us7',
        name: 'Profil US7 (41x62) / Heavy Duty',
        description: 'Profil dublu sau ranforsat pentru sarcini mari',
        maxLoadKg: 500,
        category: 'rail_heavy'
    },
    {
        id: 'rail_heavy',
        name: 'Structură Metalică Dedicată (HEA/HEB)',
        description: 'Necesită proiect de rezistență separat',
        maxLoadKg: 9999,
        category: 'rail_heavy'
    }
];

export const getRecommendedSupport = (pointLoadKg: number): SupportProfile => {
    // Find the first profile that can handle the load
    const profile = SUPPORT_PROFILES.find(p => p.maxLoadKg >= pointLoadKg);
    return profile || SUPPORT_PROFILES[SUPPORT_PROFILES.length - 1]; // Return heaviest if none match
};
