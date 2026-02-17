'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { BimObject } from '@/lib/bim/types';
import { RevitElement } from '@/lib/bim/revit';

interface BimContextState {
    // BIM Global State
    foundPipes: BimObject[];
    setFoundPipes: React.Dispatch<React.SetStateAction<BimObject[]>>;
    bimStatus: 'idle' | 'uploading' | 'parsing' | 'extracted' | 'error';
    setBimStatus: (status: 'idle' | 'uploading' | 'parsing' | 'extracted' | 'error') => void;
    parsingProgress: number;
    setParsingProgress: (progress: number) => void;
    // Revit Sync
    revitElements: RevitElement[];
    setRevitElements: (elements: RevitElement[]) => void;
    isSyncingRevit: boolean;
    setIsSyncingRevit: (state: boolean) => void;
}

const BimContext = createContext<BimContextState | undefined>(undefined);

export const BimProvider = ({ children }: { children: ReactNode }) => {
    const [foundPipes, setFoundPipes] = useState<BimObject[]>([]);
    const [bimStatus, setBimStatus] = useState<'idle' | 'uploading' | 'parsing' | 'extracted' | 'error'>('idle');
    const [parsingProgress, setParsingProgress] = useState<number>(0);
    const [revitElements, setRevitElements] = useState<RevitElement[]>([]);
    const [isSyncingRevit, setIsSyncingRevit] = useState(false);

    const value: BimContextState = {
        foundPipes,
        setFoundPipes,
        bimStatus,
        setBimStatus,
        parsingProgress,
        setParsingProgress,
        revitElements,
        setRevitElements,
        isSyncingRevit,
        setIsSyncingRevit
    };

    return (
        <BimContext.Provider value={value}>
            {children}
        </BimContext.Provider>
    );
};

export const useBim = () => {
    const context = useContext(BimContext);
    if (!context) {
        throw new Error('useBim must be used within a BimProvider');
    }
    return context;
};
