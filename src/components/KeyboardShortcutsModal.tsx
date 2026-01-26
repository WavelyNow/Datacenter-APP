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
    { keys: ['⌘', 'K'], description: 'Open Command Palette', category: 'Navigation' },
    { keys: ['/'], description: 'Quick Search', category: 'Navigation' },
    { keys: ['?'], description: 'Show Keyboard Shortcuts', category: 'Navigation' },

    // Project
    { keys: ['⌘', 'S'], description: 'Save Project', category: 'Project' },
    { keys: ['⌘', 'E'], description: 'Export Report', category: 'Project' },
    { keys: ['⌘', ','], description: 'Open Settings', category: 'Project' },

    // Editing
    { keys: ['⌘', 'Z'], description: 'Undo', category: 'Editing' },
    { keys: ['⌘', '⇧', 'Z'], description: 'Redo', category: 'Editing' },
    { keys: ['⌘', 'N'], description: 'New Item', category: 'Editing' },

    // Modal
    { keys: ['Esc'], description: 'Close Modal / Cancel', category: 'Modal' },
    { keys: ['Enter'], description: 'Confirm / Submit', category: 'Modal' },
    { keys: ['Tab'], description: 'Next Field', category: 'Modal' },
];

interface KeyboardShortcutsModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const KeyboardShortcutsModal: React.FC<KeyboardShortcutsModalProps> = ({ isOpen, onClose }) => {
    const categories = [...new Set(SHORTCUTS.map(s => s.category))];

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Keyboard Shortcuts" size="md">
            <div className="p-6 space-y-6">
                <div className="flex items-center gap-3 text-muted-foreground">
                    <Keyboard className="w-5 h-5" />
                    <p className="text-sm">Use these shortcuts to navigate faster.</p>
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
                        On Windows, use <kbd className="text-[10px] px-1 bg-muted rounded">Ctrl</kbd> instead of <kbd className="text-[10px] px-1 bg-muted rounded">⌘</kbd>
                    </p>
                </div>
            </div>
        </Modal>
    );
};
