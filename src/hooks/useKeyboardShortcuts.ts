'use client';

import { useEffect, useCallback } from 'react';

interface KeyboardShortcut {
    key: string;
    ctrl?: boolean;
    meta?: boolean;
    shift?: boolean;
    alt?: boolean;
    action: () => void;
    description: string;
}

export const useKeyboardShortcuts = (shortcuts: KeyboardShortcut[]) => {
    const handleKeyDown = useCallback((event: KeyboardEvent) => {
        // Don't trigger shortcuts when typing in inputs
        const target = event.target as HTMLElement;
        if (
            target.tagName === 'INPUT' ||
            target.tagName === 'TEXTAREA' ||
            target.tagName === 'SELECT' ||
            target.isContentEditable
        ) {
            // Still allow Escape to work
            if (event.key !== 'Escape') {
                return;
            }
        }

        for (const shortcut of shortcuts) {
            const keyMatches = event.key.toLowerCase() === shortcut.key.toLowerCase();
            const ctrlMatches = shortcut.ctrl ? (event.ctrlKey || event.metaKey) : true;
            const metaMatches = shortcut.meta ? event.metaKey : true;
            const shiftMatches = shortcut.shift ? event.shiftKey : !event.shiftKey;
            const altMatches = shortcut.alt ? event.altKey : !event.altKey;

            // Special handling for Cmd/Ctrl shortcuts
            if (shortcut.ctrl && keyMatches && (event.ctrlKey || event.metaKey)) {
                event.preventDefault();
                shortcut.action();
                return;
            }

            if (keyMatches && ctrlMatches && metaMatches && shiftMatches && altMatches) {
                event.preventDefault();
                shortcut.action();
                return;
            }
        }
    }, [shortcuts]);

    useEffect(() => {
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [handleKeyDown]);
};

// Common shortcut configurations
export const createStandardShortcuts = (handlers: {
    onSave?: () => void;
    onExport?: () => void;
    onNew?: () => void;
    onSearch?: () => void;
    onHelp?: () => void;
    onSettings?: () => void;
    onUndo?: () => void;
    onRedo?: () => void;
}): KeyboardShortcut[] => {
    const shortcuts: KeyboardShortcut[] = [];

    if (handlers.onSave) {
        shortcuts.push({
            key: 's',
            ctrl: true,
            action: handlers.onSave,
            description: 'Save project'
        });
    }

    if (handlers.onExport) {
        shortcuts.push({
            key: 'e',
            ctrl: true,
            action: handlers.onExport,
            description: 'Export'
        });
    }

    if (handlers.onNew) {
        shortcuts.push({
            key: 'n',
            ctrl: true,
            action: handlers.onNew,
            description: 'New item'
        });
    }

    if (handlers.onSearch) {
        shortcuts.push({
            key: 'k',
            ctrl: true,
            action: handlers.onSearch,
            description: 'Search'
        });
        shortcuts.push({
            key: '/',
            action: handlers.onSearch,
            description: 'Search'
        });
    }

    if (handlers.onHelp) {
        shortcuts.push({
            key: '?',
            shift: true,
            action: handlers.onHelp,
            description: 'Help'
        });
    }

    if (handlers.onSettings) {
        shortcuts.push({
            key: ',',
            ctrl: true,
            action: handlers.onSettings,
            description: 'Settings'
        });
    }

    if (handlers.onUndo) {
        shortcuts.push({
            key: 'z',
            ctrl: true,
            action: handlers.onUndo,
            description: 'Undo'
        });
    }

    if (handlers.onRedo) {
        shortcuts.push({
            key: 'y',
            ctrl: true,
            action: handlers.onRedo,
            description: 'Redo'
        });
        shortcuts.push({
            key: 'z',
            ctrl: true,
            shift: true,
            action: handlers.onRedo,
            description: 'Redo'
        });
    }

    return shortcuts;
};
