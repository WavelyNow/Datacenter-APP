'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { helpRegistry } from '@/lib/helpContent';
import { X, GraduationCap, Lightbulb } from 'lucide-react';

interface HelpContextType {
    isHelpMode: boolean;
    toggleHelpMode: () => void;
    openHelp: (id: string) => void;
    closeHelp: () => void;
}

const HelpContext = createContext<HelpContextType | undefined>(undefined);

export const useHelp = () => {
    const context = useContext(HelpContext);
    if (!context) {
        throw new Error('useHelp must be used within a HelpProvider');
    }
    return context;
};

export const HelpProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [isHelpMode, setIsHelpMode] = useState(false);
    const [activeHelpId, setActiveHelpId] = useState<string | null>(null);

    const toggleHelpMode = () => setIsHelpMode(prev => !prev);
    const openHelp = (id: string) => {
        if (helpRegistry[id]) {
            setActiveHelpId(id);
        }
    };
    const closeHelp = () => setActiveHelpId(null);

    const activeContent = activeHelpId ? helpRegistry[activeHelpId] : null;

    return (
        <HelpContext.Provider value={{ isHelpMode, toggleHelpMode, openHelp, closeHelp }}>
            {children}

            {/* Help Modal Overlay */}
            {activeContent && (
                <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200" onClick={closeHelp}>
                    <div
                        className="bg-card w-full max-w-lg rounded-2xl shadow-2xl border-2 border-primary overflow-hidden animate-in zoom-in-95 duration-300"
                        onClick={e => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div className="bg-primary/10 p-6 flex items-start justify-between border-b border-primary/20">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-primary rounded-xl shadow-lg shadow-primary/30">
                                    <GraduationCap className="w-8 h-8 text-white" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-foreground">{activeContent.title}</h3>
                                    <span className="text-xs font-bold text-primary uppercase tracking-wider bg-primary/10 px-2 py-0.5 rounded-full">
                                        Mod de instruire
                                    </span>
                                </div>
                            </div>
                            <button onClick={closeHelp} className="text-muted-foreground hover:text-foreground">
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="p-6 space-y-6">
                            <p className="text-base text-foreground leading-relaxed">
                                {activeContent.description}
                            </p>

                            {activeContent.tips.length > 0 && (
                                <div className="bg-primary/10 border border-primary/20 rounded-xl p-4">
                                    <div className="flex items-center gap-2 mb-3 text-primary font-bold">
                                        <Lightbulb className="w-5 h-5" />
                                        <span>Sfaturi utile</span>
                                    </div>
                                    <ul className="space-y-2">
                                        {activeContent.tips.map((tip, idx) => (
                                            <li key={idx} className="flex items-start gap-2 text-sm text-foreground/80">
                                                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                                                <span>{tip}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="p-4 bg-muted/50 text-center border-t border-border">
                            <p className="text-xs text-muted-foreground">
                                Click oriunde în afara ferestrei pentru a închide.
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </HelpContext.Provider>
    );
};
