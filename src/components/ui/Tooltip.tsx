import React, { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { HelpCircle } from 'lucide-react';

interface TooltipProps {
    content: React.ReactNode;
    children: React.ReactNode;
    side?: 'top' | 'right' | 'bottom' | 'left';
    delay?: number;
    className?: string;
    maxWidth?: number;
    showIcon?: boolean;
    disabled?: boolean;
}

export const Tooltip: React.FC<TooltipProps> = ({
    content,
    children,
    side = 'top',
    delay = 300,
    className = '',
    maxWidth = 280,
    showIcon = false,
    disabled = false
}) => {
    const [isVisible, setIsVisible] = useState(false);
    const [coords, setCoords] = useState<{ top: number; left: number }>({ top: 0, left: 0 });
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);
    const triggerRef = useRef<HTMLSpanElement>(null);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        // Cleanup timeout on unmount
        return () => {
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
        };
    }, []);

    const updatePosition = useCallback(() => {
        if (!triggerRef.current) return;

        const rect = triggerRef.current.getBoundingClientRect();
        const scrollX = window.scrollX;
        const scrollY = window.scrollY;

        // Basic anchoring logic
        let top = 0;
        let left = 0;
        const gap = 8; // gap between trigger and tooltip

        switch (side) {
            case 'top':
                top = rect.top + scrollY - gap;
                left = rect.left + scrollX + (rect.width / 2);
                break;
            case 'bottom':
                top = rect.bottom + scrollY + gap;
                left = rect.left + scrollX + (rect.width / 2);
                break;
            case 'left':
                top = rect.top + scrollY + (rect.height / 2);
                left = rect.left + scrollX - gap;
                break;
            case 'right':
                top = rect.top + scrollY + (rect.height / 2);
                left = rect.right + scrollX + gap;
                break;
        }

        setCoords({ top, left });
    }, [side]);

    const showTooltip = () => {
        // console.log('Tooltip trigger:', { disabled, content, side });
        if (disabled || !content) return;
        updatePosition();
        timeoutRef.current = setTimeout(() => {
            updatePosition(); // Recalculate just before showing
            // console.log('Tooltip showing:', coords);
            setIsVisible(true);
        }, delay);
    };

    const hideTooltip = () => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
        }
        setIsVisible(false);
    };

    // Update position on scroll/resize if visible
    useEffect(() => {
        if (!isVisible) return;

        const handleUpdate = () => requestAnimationFrame(updatePosition);
        window.addEventListener('scroll', handleUpdate, { passive: true });
        window.addEventListener('resize', handleUpdate);

        return () => {
            window.removeEventListener('scroll', handleUpdate);
            window.removeEventListener('resize', handleUpdate);
        };
    }, [isVisible, updatePosition]);

    // Close on Escape
    useEffect(() => {
        if (!isVisible) return;
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') hideTooltip();
        };
        document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
    }, [isVisible]);

    const getTransform = () => {
        switch (side) {
            case 'top': return 'translate(-50%, -100%)';
            case 'bottom': return 'translate(-50%, 0)';
            case 'left': return 'translate(-100%, -50%)';
            case 'right': return 'translate(0, -50%)';
            default: return 'translate(-50%, -100%)';
        }
    };

    const getAnimationClass = () => {
        switch (side) {
            case 'top': return 'slide-in-from-bottom-1';
            case 'bottom': return 'slide-in-from-top-1';
            case 'left': return 'slide-in-from-right-1';
            case 'right': return 'slide-in-from-left-1';
            default: return 'zoom-in-95';
        }
    };

    // Using inverted colors (foreground bg) for better visibility by default, 
    // or standard popover colors. Let's use darker theme for tooltips as they look premium.
    const tooltipClasses = `
        relative bg-zinc-900 text-zinc-50 dark:bg-zinc-50 dark:text-zinc-900 
        text-xs px-3 py-2 rounded-lg shadow-xl shadow-black/10 border border-white/10 
        font-medium leading-relaxed z-[99999]
        animate-in fade-in ${getAnimationClass()} duration-200
    `;

    // Arrow logic - difficult to match bg exactly with simple classes, skipping arrow for cleaner "floating" look
    // or adding simple CSS arrow

    if (!content) return <>{children}</>;

    return (
        <>
            <span
                ref={triggerRef}
                className={`relative inline-flex items-center ${className}`}
                onMouseEnter={showTooltip}
                onMouseLeave={hideTooltip}
                onFocus={showTooltip}
                onBlur={hideTooltip}
            >
                {children}
                {showIcon && (
                    <HelpCircle className="w-3.5 h-3.5 ml-1 text-muted-foreground/50 hover:text-muted-foreground transition-colors cursor-help" />
                )}
            </span>

            {mounted && isVisible && createPortal(
                <div
                    className="fixed pointer-events-none z-[99999]"
                    style={{
                        top: coords.top,
                        left: coords.left,
                        transform: getTransform()
                    }}
                    role="tooltip"
                >
                    <div
                        className={tooltipClasses}
                        style={{ maxWidth: `${maxWidth}px` }}
                    >
                        {content}
                    </div>
                </div>,
                document.body
            )}
        </>
    );
};

export const HelpTooltip: React.FC<{ text: string; side?: 'top' | 'right' | 'bottom' | 'left'; className?: string }> = ({ text, side = 'top', className = '' }) => (
    <Tooltip content={text} side={side} className={className}>
        <HelpCircle className="w-4 h-4 text-muted-foreground/40 hover:text-primary/70 transition-colors cursor-help" />
    </Tooltip>
);
