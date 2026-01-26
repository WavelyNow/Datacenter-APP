import React, { useState } from 'react';

interface TooltipProps {
    content: React.ReactNode;
    children: React.ReactNode;
    side?: 'top' | 'right' | 'bottom' | 'left';
    delay?: number;
    className?: string;
}

export const Tooltip: React.FC<TooltipProps> = ({
    content,
    children,
    side = 'right',
    delay = 200,
    className = ''
}) => {
    const [isVisible, setIsVisible] = useState(false);
    const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null);

    const showoffset = {
        top: '-translate-y-full -mt-2 left-1/2 -translate-x-1/2',
        right: 'translate-x-full ml-2 top-1/2 -translate-y-1/2',
        bottom: 'translate-y-full mt-2 left-1/2 -translate-x-1/2',
        left: '-translate-x-full -ml-2 top-1/2 -translate-y-1/2'
    };

    const arrowPosition = {
        top: 'bottom-[-4px] left-1/2 -translate-x-1/2 border-t-foreground/80 border-l-transparent border-r-transparent border-b-transparent',
        right: 'left-[-4px] top-1/2 -translate-y-1/2 border-r-foreground/80 border-t-transparent border-b-transparent border-l-transparent',
        bottom: 'top-[-4px] left-1/2 -translate-x-1/2 border-b-foreground/80 border-l-transparent border-r-transparent border-t-transparent',
        left: 'right-[-4px] top-1/2 -translate-y-1/2 border-l-foreground/80 border-t-transparent border-b-transparent border-r-transparent'
    };

    const handleMouseEnter = () => {
        const id = setTimeout(() => setIsVisible(true), delay);
        setTimeoutId(id);
    };

    const handleMouseLeave = () => {
        if (timeoutId) clearTimeout(timeoutId);
        setIsVisible(false);
    };

    return (
        <div
            className={`relative flex items-center ${className}`}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            {children}

            {isVisible && (
                <div className={`absolute z-50 ${showoffset[side]} animate-in fade-in zoom-in-95 duration-200`}>
                    <div className="relative bg-foreground/90 text-background text-xs px-2.5 py-1.5 rounded-lg shadow-xl whitespace-nowrap backdrop-blur-sm font-medium">
                        {content}
                        <div className={`absolute w-0 h-0 border-[4px] ${arrowPosition[side]}`} />
                    </div>
                </div>
            )}
        </div>
    );
};
