'use client';

import React from 'react';
import { useHelp } from './HelpContext';
import { HelpCircle } from 'lucide-react';

interface HelpBeaconProps {
    id: string;
    className?: string;
    position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'center';
}

export const HelpBeacon: React.FC<HelpBeaconProps> = ({ id, className = '', position = 'top-right' }) => {
    const { isHelpMode, openHelp } = useHelp();

    if (!isHelpMode) return null;

    const positionClasses = {
        'top-right': '-top-2 -right-2',
        'top-left': '-top-2 -left-2',
        'bottom-right': '-bottom-2 -right-2',
        'bottom-left': '-bottom-2 -left-2',
        'center': 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2'
    };

    return (
        <button
            onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                openHelp(id);
            }}
            className={`absolute z-[90] ${positionClasses[position]} ${className} group`}
        >
            <span className="relative flex h-6 w-6">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary/50 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-6 w-6 bg-primary items-center justify-center shadow-lg border-2 border-white dark:border-gray-900 ring-2 ring-primary/20 transition-transform group-hover:scale-110">
                    <HelpCircle className="w-3.5 h-3.5 text-white" />
                </span>
            </span>
        </button>
    );
};
