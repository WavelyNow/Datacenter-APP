
export interface CatalogEquipment {
    id: string;
    category: string;
    model: string;
    volume: number; // L
    weight: number; // kg (empty)
    description: string;
}

export const EQUIPMENT_CATALOG: CatalogEquipment[] = [
    // Chillers
    {
        id: 'ch-m-30',
        category: 'Chiller',
        model: 'Chiller Mono-bloc 30kW',
        volume: 45,
        weight: 320,
        description: 'Unitate de răcire compactă pentru exterior.'
    },
    {
        id: 'ch-m-60',
        category: 'Chiller',
        model: 'Chiller Mono-bloc 60kW',
        volume: 85,
        weight: 580,
        description: 'Unitate de răcire compactă, 2 circuite.'
    },
    {
        id: 'ch-m-100',
        category: 'Chiller',
        model: 'Chiller Mono-bloc 100kW',
        volume: 140,
        weight: 950,
        description: 'Unitate de răcire industrială.'
    },
    // CRAH / CCU
    {
        id: 'crah-025',
        category: 'CRAH / CCU',
        model: 'CRAH Unit 25kW',
        volume: 12,
        weight: 180,
        description: 'Unitate climatizare de precizie pentru Data Center.'
    },
    {
        id: 'crah-050',
        category: 'CRAH / CCU',
        model: 'CRAH Unit 50kW',
        volume: 24,
        weight: 350,
        description: 'Unitate climatizare de precizie 50kW.'
    },
    // Buffers
    {
        id: 'buffer-500',
        category: 'Puffer / Rezervor Tampon',
        model: 'Buffer Tank 500L',
        volume: 500,
        weight: 120,
        description: 'Rezervor de acumulare fără izolație.'
    },
    {
        id: 'buffer-1000',
        category: 'Puffer / Rezervor Tampon',
        model: 'Buffer Tank 1000L',
        volume: 1000,
        weight: 210,
        description: 'Rezervor de acumulare 1000L.'
    }
];
