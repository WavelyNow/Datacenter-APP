'use client';

import React from 'react';
import { Modal } from '@/components/ui/Modal';
import { Keyboard, Command } from 'lucide-react';

interface ShortcutItem {
    keys: string[];
    description: string;
    category: string;
}

const SHORTCUTS: ShortcutItem[] = [
    // Navigation
    { keys: ['⌘', 'K'], description: 'Deschide paleta de comenzi', category: 'Navigare' },
    { keys: ['/'], description: 'Căutare rapidă', category: 'Navigare' },
    { keys: ['?'], description: 'Afișează scurtăturile', category: 'Navigare' },

    // Project
    { keys: ['⌘', 'S'], description: 'Salvează proiectul', category: 'Proiect' },
    { keys: ['⌘', 'E'], description: 'Exportă raportul', category: 'Proiect' },
    { keys: ['⌘', ','], description: 'Deschide setările', category: 'Proiect' },

    // Editing
    { keys: ['⌘', 'Z'], description: 'Anulează', category: 'Editare' },
    { keys: ['⌘', '⇧', 'Z'], description: 'Refă', category: 'Editare' },
    { keys: ['⌘', 'N'], description: 'Element nou', category: 'Editare' },

    // Modal
    { keys: ['Esc'], description: 'Închide fereastra / Anulează', category: 'Fereastră' },
    { keys: ['Enter'], description: 'Confirmă / Trimite', category: 'Fereastră' },
    { keys: ['Tab'], description: 'Câmpul următor', category: 'Fereastră' },
];

interface KeyboardShortcutsModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const KeyboardShortcutsModal: React.FC<KeyboardShortcutsModalProps> = ({ isOpen, onClose }) => {
    const categories = [...new Set(SHORTCUTS.map(s => s.category))];

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Scurtături de la tastatură" size="md">
            <div className="p-6 space-y-6">
                <div className="flex items-center gap-3 text-muted-foreground">
                    <Keyboard className="w-5 h-5" />
                    <p className="text-sm">Folosește aceste scurtături pentru a naviga mai rapid.</p>
                </div>

                {categories.map(category => (
                    <div key={category}>
                        <h4 className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-3">
                            {category}
                        </h4>
                        <div className="space-y-2">
                            {SHORTCUTS.filter(s => s.category === category).map((shortcut, i) => (
                                <div key={i} className="flex items-center justify-between py-2 px-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                                    <span className="text-sm text-foreground">{shortcut.description}</span>
                                    <div className="flex items-center gap-1">
                                        {shortcut.keys.map((key, j) => (
                                            <kbd
                                                key={j}
                                                className="inline-flex items-center justify-center min-w-[24px] h-6 px-1.5 text-xs font-semibold bg-background border border-border rounded shadow-sm"
                                            >
                                                {key}
                                            </kbd>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}

                <div className="pt-4 border-t border-border text-center">
                    <p className="text-xs text-muted-foreground">
                        <Command className="w-3 h-3 inline mr-1" />
                        Pe Windows, folosește <kbd className="text-[10px] px-1 bg-muted rounded">Ctrl</kbd> în loc de <kbd className="text-[10px] px-1 bg-muted rounded">⌘</kbd>
                    </p>
                </div>
            </div>
        </Modal>
    );
};
