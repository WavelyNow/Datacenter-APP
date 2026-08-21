import React, { useEffect, useState, useRef, useId } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Module-level registries shared by ALL Modal instances
const openModals: string[] = [];
let scrollLockCount = 0;

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    description?: string;
    children: React.ReactNode;
    className?: string;
    size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
}

export const Modal: React.FC<ModalProps> = ({
    isOpen,
    onClose,
    title,
    description,
    children,
    className = '',
    size = 'md'
}) => {
    // SSR-safety: track mounted state to ensure portal renders only on client
     
    const [mounted, setMounted] = useState(false);
    const modalRef = useRef<HTMLDivElement>(null);
    const previousActiveElement = useRef<HTMLElement | null>(null);
    // Use React's useId for stable unique IDs (avoids hydration mismatch)
    const uniqueId = useId();
    const id = uniqueId;
    const titleId = `modal-title-${uniqueId}`;
    const descId = `modal-desc-${uniqueId}`;

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect -- Required for SSR hydration
        setMounted(true);
    }, []);

    // Focus management
    useEffect(() => {
        if (isOpen) {
            previousActiveElement.current = document.activeElement as HTMLElement;
            // Focus first focusable element in modal
            setTimeout(() => {
                const focusable = modalRef.current?.querySelectorAll<HTMLElement>(
                    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
                );
                if (focusable && focusable.length > 0) {
                    focusable[0].focus();
                }
            }, 50);
        } else if (previousActiveElement.current) {
            previousActiveElement.current.focus();
        }
    }, [isOpen]);

    // Handle ESC key — close ONLY the TOPMOST open modal (module-level registry).
    // Previously EVERY open modal registered its own listener, so Escape closed
    // ALL stacked modals at once (data loss in nested flows).
    useEffect(() => {
        if (!isOpen) return;

        const handleEscape = (e: KeyboardEvent) => {
            if (e.key !== 'Escape') return;
            const top = openModals[openModals.length - 1];
            if (top === id) {
                onClose();
            }
        };
        openModals.push(id);
        window.addEventListener('keydown', handleEscape);
        return () => {
            const idx = openModals.lastIndexOf(id);
            if (idx >= 0) openModals.splice(idx, 1);
            window.removeEventListener('keydown', handleEscape);
        };
    }, [isOpen, onClose, id]);

    // Lock body scroll — ref-counted so closing one nested modal never
    // unlocks the scroll while another modal is still open.
    useEffect(() => {
        if (!isOpen) return;
        scrollLockCount++;
        document.body.style.overflow = 'hidden';
        return () => {
            scrollLockCount = Math.max(0, scrollLockCount - 1);
            if (scrollLockCount === 0) document.body.style.overflow = '';
        };
    }, [isOpen]);

    // Focus trap
    useEffect(() => {
        if (!isOpen) return;

        const handleTab = (e: KeyboardEvent) => {
            if (e.key !== 'Tab') return;
            const focusable = modalRef.current?.querySelectorAll<HTMLElement>(
                'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
            );
            if (!focusable || focusable.length === 0) return;

            const first = focusable[0];
            const last = focusable[focusable.length - 1];

            if (e.shiftKey && document.activeElement === first) {
                e.preventDefault();
                last.focus();
            } else if (!e.shiftKey && document.activeElement === last) {
                e.preventDefault();
                first.focus();
            }
        };
        window.addEventListener('keydown', handleTab);
        return () => window.removeEventListener('keydown', handleTab);
    }, [isOpen]);

    if (!mounted) return null;

    const sizeClasses = {
        sm: 'max-w-sm',
        md: 'max-w-lg',
        lg: 'max-w-2xl',
        xl: 'max-w-4xl',
        '2xl': 'max-w-6xl',
        full: 'max-w-[95vw] h-[95vh]'
    };

    return createPortal(
        <AnimatePresence>
            {isOpen && (
                <div
                    className="fixed inset-0 z-100 flex items-center justify-center p-4 sm:p-6"
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby={title ? titleId : undefined}
                    aria-describedby={description ? descId : undefined}
                >
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        onClick={onClose}
                        aria-hidden="true"
                    />

                    {/* Content */}
                    <motion.div
                        ref={modalRef}
                        initial={{ opacity: 0, scale: 0.95, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 10 }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                        className={`relative w-full ${sizeClasses[size]} bg-card rounded-2xl shadow-2xl border border-border flex flex-col overflow-hidden max-h-[90vh] ${className}`}
                    >
                        {/* Header (Optional) */}
                        {(title || description) && (
                            <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-muted/20">
                                <div>
                                    {title && <h3 id={titleId} className="text-lg font-bold text-foreground">{title}</h3>}
                                    {description && <p id={descId} className="text-sm text-muted-foreground">{description}</p>}
                                </div>
                                <button
                                    onClick={onClose}
                                    className="p-2 rounded-lg hover:bg-muted/50 text-muted-foreground hover:text-foreground transition-colors focus:outline-none focus:ring-2 focus:ring-primary/50"
                                    aria-label="Close dialog"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                        )}
                        {!title && !description && (
                            <button
                                onClick={onClose}
                                className="absolute top-4 right-4 z-10 p-2 rounded-lg bg-background/50 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors focus:outline-none focus:ring-2 focus:ring-primary/50"
                                aria-label="Close dialog"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        )}

                        {/* Body */}
                        <div className="flex-1 overflow-y-auto">
                            {children}
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>,
        document.body
    );
};
