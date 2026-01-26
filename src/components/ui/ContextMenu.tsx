'use client';

import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LucideIcon } from 'lucide-react';

export interface ContextMenuAction {
    label: string;
    icon?: LucideIcon;
    onClick: () => void;
    variant?: 'default' | 'danger' | 'warning';
}

interface ContextMenuProps {
    x: number;
    y: number;
    isOpen: boolean;
    onClose: () => void;
    actions: ContextMenuAction[];
}

export const ContextMenu: React.FC<ContextMenuProps> = ({
    x,
    y,
    isOpen,
    onClose,
    actions
}) => {
    const menuRef = useRef<HTMLDivElement>(null);

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
            document.addEventListener('contextmenu', (e) => {
                // Close if another right click happens outside, but allow the new one to trigger (handled by parent usually)
                if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
                    onClose();
                }
            });
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('contextmenu', handleClickOutside); // Clean up both
        };
    }, [isOpen, onClose]);

    // Prevent scrolling when menu is open? Maybe not needed for context menu typically.

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    ref={menuRef}
                    initial={{ opacity: 0, scale: 0.95, y: -10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -10 }}
                    transition={{ duration: 0.15, ease: "easeOut" }}
                    style={{
                        position: 'fixed',
                        top: y,
                        left: x,
                        zIndex: 50
                    }}
                    className="min-w-[200px] bg-card/95 backdrop-blur-xl border border-primary/20 shadow-2xl rounded-xl overflow-hidden p-1.5 flex flex-col gap-0.5 ring-1 ring-black/5 dark:ring-white/10"
                    onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside
                    onContextMenu={(e) => e.preventDefault()} // Prevent native menu inside
                >
                    {actions.map((action, index) => {
                        const Icon = action.icon;
                        const isDanger = action.variant === 'danger';

                        return (
                            <motion.button
                                key={action.label}
                                whileHover={{ x: 2 }}
                                onClick={() => {
                                    action.onClick();
                                    onClose();
                                }}
                                className={`
                                    flex items-center gap-3 w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium transition-colors
                                    ${isDanger
                                        ? 'text-red-500 hover:bg-red-500/10 hover:text-red-600'
                                        : 'text-foreground/80 hover:bg-primary/10 hover:text-primary'
                                    }
                                `}
                            >
                                {Icon && <Icon className="w-4 h-4 opacity-70" />}
                                {action.label}
                            </motion.button>
                        );
                    })}
                </motion.div>
            )}
        </AnimatePresence>
    );
};
