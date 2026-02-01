import {
    Zap,
    Plug,
    Flame,
    Building2,
    Network,
    RefreshCw,
    Wind,
    Lock,
    Snowflake,
    LucideIcon
} from 'lucide-react';
import { NormativeCategory, NormativeSource } from './normativeRegistry';

// Iconițe pentru categorii
export const categoryIcons: Record<NormativeCategory, LucideIcon> = {
    thermal: Zap,
    electrical: Plug,
    fire: Flame,
    infrastructure: Building2,
    cabling: Network,
    redundancy: RefreshCw,
    hvac: Wind,
    security: Lock,
    power: Plug,
    cooling: Snowflake
};

// Culori pentru surse
export const sourceColors: Record<NormativeSource, string> = {
    'ASHRAE': 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    'TIA-942': 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    'EN-50600': 'bg-green-500/20 text-green-400 border-green-500/30',
    'Uptime': 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    'Romanian': 'bg-red-500/20 text-red-400 border-red-500/30',
    'IEEE': 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30'
};
