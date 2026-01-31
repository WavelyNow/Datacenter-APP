'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { BimObject } from '@/lib/bim/types';

interface BimContextState {
    // BIM Global State
    foundPipes: BimObject[];
    setFoundPipes: React.Dispatch<React.SetStateAction<BimObject[]>>;
    bimStatus: 'idle' | 'uploading' | 'parsing' | 'extracted' | 'error';
    setBimStatus: (status: 'idle' | 'uploading' | 'parsing' | 'extracted' | 'error') => void;
    parsingProgress: number;
    setParsingProgress: (progress: number) => void;
}

const BimContext = createContext<BimContextState | undefined>(undefined);

export const BimProvider = ({ children }: { children: ReactNode }) => {
    const [foundPipes, setFoundPipes] = useState<BimObject[]>([]);
    const [bimStatus, setBimStatus] = useState<'idle' | 'uploading' | 'parsing' | 'extracted' | 'error'>('idle');
    const [parsingProgress, setParsingProgress] = useState(0);

    const value: BimContextState = {
        foundPipes,
        setFoundPipes,
        bimStatus,
        setBimStatus,
        parsingProgress,
        setParsingProgress
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
