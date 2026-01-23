import React from 'react';
import { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
    icon: LucideIcon;
    title: string;
    description: string;
    action?: {
        label: string;
        onClick: () => void;
        variant?: 'primary' | 'secondary' | 'outline';
    };
    className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
    icon: Icon,
    title,
    description,
    action,
    className = ''
}) => {
    return (
        <div className={`flex flex-col items-center justify-center p-8 md:p-12 text-center rounded-2xl border border-dashed border-border/60 bg-muted/5 ${className}`}>
            <div className="w-16 h-16 rounded-3xl bg-primary/5 flex items-center justify-center mb-4 ring-1 ring-primary/10">
                <Icon className="w-8 h-8 text-primary/60" />
            </div>

            <h3 className="text-xl font-bold text-foreground mb-2">{title}</h3>
            <p className="text-muted-foreground max-w-sm mb-6 leading-relaxed">
                {description}
            </p>

            {action && (
                <button
                    onClick={action.onClick}
                    className={`
                        btn btn-md
                        ${action.variant === 'outline' ? 'btn-outline' :
                            action.variant === 'secondary' ? 'bg-secondary text-secondary-foreground hover:bg-secondary/80' :
                                'btn-primary'}
                    `}
                >
                    {action.label}
                </button>
            )}
        </div>
    );
};
