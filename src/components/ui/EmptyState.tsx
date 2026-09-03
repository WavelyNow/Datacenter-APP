import React from 'react';
import { LucideIcon } from 'lucide-react';
import { motion } from 'framer-motion';
import { itemVariants, containerVariants } from '@/lib/animations';

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
    steps?: string[];
    tipsLabel?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
    icon: Icon,
    title,
    description,
    action,
    className = '',
    steps,
    tipsLabel
}) => {
    return (
        <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit={{ opacity: 0, scale: 0.95 }}
            className={`
                relative overflow-hidden
                flex flex-col items-center justify-center 
                p-8 md:p-16 text-center 
                rounded-3xl border border-border/40 
                bg-card/40 backdrop-blur-md
                shadow-2xl shadow-black/10
                group
                ${className}
            `}
        >
            {/* Background Decor */}
            <div className="absolute inset-0 bg-grid-white/5 mask-image-linear-gradient-to-b" />
            <div className="absolute -top-24 -right-24 w-64 h-64 bg-primary/10 rounded-full blur-3xl group-hover:bg-primary/20 transition-all duration-1000" />
            <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl group-hover:bg-indigo-500/20 transition-all duration-1000" />

            {/* Icon / Illustration */}
            <motion.div 
                variants={itemVariants}
                className="relative mb-8 transform group-hover:scale-110 transition-transform duration-700 ease-out"
            >
                <div className="absolute inset-0 bg-primary/30 blur-3xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                <div className="w-24 h-24 rounded-3xl bg-card border border-white/20 shadow-2xl flex items-center justify-center relative z-10 ring-1 ring-white/10">
                    <Icon className="w-10 h-10 text-primary" />
                </div>

                {/* Floating Elements */}
                <motion.div 
                    animate={{ y: [0, -10, 0] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute -right-4 -top-4 p-3 rounded-2xl bg-card/80 backdrop-blur-md border border-white/20 shadow-xl"
                >
                    <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                </motion.div>
            </motion.div>

            {/* Content */}
            <div className="relative z-10 max-w-md mx-auto space-y-4">
                <motion.h3 
                    variants={itemVariants}
                    className="text-2xl font-black tracking-tight bg-clip-text text-transparent bg-linear-to-br from-foreground to-muted-foreground/70"
                >
                    {title}
                </motion.h3>
                <motion.p 
                    variants={itemVariants}
                    className="text-muted-foreground text-base leading-relaxed"
                >
                    {description}
                </motion.p>

                {/* Optional Steps/Tips */}
                {steps && steps.length > 0 && (
                    <motion.div 
                        variants={itemVariants}
                        className="mt-8 text-left bg-muted/20 backdrop-blur-sm rounded-xl p-5 border border-white/10"
                    >
                        <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-3">
                            {tipsLabel || 'Ghid de pornire rapidă'}
                        </p>
                        <ul className="space-y-3">
                            {steps.map((step, i) => (
                                <li key={i} className="flex gap-3 text-sm text-muted-foreground/80 items-start">
                                    <span className="shrink-0 w-5 h-5 rounded-full bg-primary/20 text-primary flex items-center justify-center text-[10px] font-bold mt-0.5">
                                        {i + 1}
                                    </span>
                                    <span>{step}</span>
                                </li>
                            ))}
                        </ul>
                    </motion.div>
                )}
            </div>

            {/* Actions */}
            {action && (
                <motion.div 
                    variants={itemVariants}
                    className="mt-10 relative z-10"
                >
                    <button
                        onClick={action.onClick}
                        className={`
                            group/btn relative px-8 py-3 rounded-xl font-bold text-sm transition-all duration-300 active:scale-95
                            ${action.variant === 'outline'
                                ? 'bg-transparent border border-border/50 hover:border-primary text-foreground'
                                : action.variant === 'secondary'
                                    ? 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                                    : 'bg-primary text-primary-foreground shadow-xl shadow-primary/30 hover:shadow-primary/50 hover:-translate-y-1'
                            }
                        `}
                    >
                        <span className="relative z-10 flex items-center gap-2">
                            {action.label}
                            {action.variant !== 'outline' && (
                                <svg className="w-4 h-4 transition-transform group-hover/btn:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                </svg>
                            )}
                        </span>
                    </button>
                </motion.div>
            )}
        </motion.div>
    );
};
