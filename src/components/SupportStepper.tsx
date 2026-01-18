import React from 'react';
import { Settings, Activity, Check, LucideIcon } from 'lucide-react';

interface Step {
    id: 'config' | 'summary';
    label: string;
    icon: LucideIcon;
    description: string;
}

interface SupportStepperProps {
    currentStep: 'config' | 'summary';
    onStepChange: (step: 'config' | 'summary') => void;
}

export const SupportStepper: React.FC<SupportStepperProps> = ({ currentStep, onStepChange }) => {
    const steps: Step[] = [
        { id: 'config', label: 'Configurare', icon: Settings, description: 'Parametri montaj' },
        { id: 'summary', label: 'Rezumat Comandă', icon: Activity, description: 'Calcul cantități' },
    ];

    const stepOrder = ['config', 'summary'];
    const currentIndex = stepOrder.indexOf(currentStep);

    return (
        <div className="w-full bg-secondary/30 border-b border-border/50 mb-8 backdrop-blur-md">
            <div className="max-w-6xl mx-auto px-4">
                <div className="flex flex-col md:flex-row justify-between items-center py-4 gap-4">
                    {steps.map((step, idx) => {
                        const isActive = step.id === currentStep;
                        const isCompleted = stepOrder.indexOf(step.id) < currentIndex;
                        const isClickable = idx <= currentIndex + 1;

                        const Icon = step.icon;

                        return (
                            <React.Fragment key={step.id}>
                                <button
                                    onClick={() => isClickable && onStepChange(step.id)}
                                    disabled={!isClickable}
                                    className={`group flex items-center gap-4 relative transition-all ${!isClickable ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                                        }`}
                                >
                                    {/* Icon Circle */}
                                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500 relative overflow-hidden ${isActive
                                        ? 'bg-primary shadow-[0_0_20px_rgba(var(--primary-rgb),0.3)] text-primary-foreground scale-110'
                                        : isCompleted
                                            ? 'bg-primary/10 text-primary border border-primary/20'
                                            : 'bg-secondary/50 text-muted-foreground border border-border/50 group-hover:bg-secondary'
                                        }`}>
                                        {isCompleted ? <Check className="w-6 h-6" /> : <Icon className={`w-6 h-6 ${isActive ? 'animate-pulse' : ''}`} />}

                                        {/* Activity glow for active step */}
                                        {isActive && <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent animate-shimmer" />}
                                    </div>

                                    {/* Text Content */}
                                    <div className="text-left">
                                        <p className={`text-xs uppercase tracking-wider font-bold mb-0.5 transition-colors ${isActive ? 'text-primary' : isCompleted ? 'text-primary/70' : 'text-muted-foreground'
                                            }`}>
                                            Pasul {idx + 1}
                                        </p>
                                        <h4 className={`font-bold transition-colors ${isActive || isCompleted ? 'text-foreground' : 'text-muted-foreground'
                                            }`}>
                                            {step.label}
                                        </h4>
                                        <p className="text-[10px] text-muted-foreground/60 hidden md:block">
                                            {step.description}
                                        </p>
                                    </div>
                                </button>

                                {/* Connector Line (Desktop only) */}
                                {idx < steps.length - 1 && (
                                    <div className="hidden md:block w-full h-[2px] bg-secondary/50 relative mx-4 flex-1 max-w-[100px]">
                                        <div className={`absolute left-0 top-0 h-full bg-primary transition-all duration-700 ${isCompleted ? 'w-full' : 'w-0'
                                            }`} />
                                    </div>
                                )}
                            </React.Fragment>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};
