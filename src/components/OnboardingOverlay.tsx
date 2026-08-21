'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Ruler, Droplets, ShoppingCart, X, ArrowRight } from 'lucide-react';
import { usePreferences } from '@/context/PreferencesContext';
import { useUI } from '@/context/UIContext';

const STEPS = [
    {
        icon: Ruler,
        title: 'Alege diametrele corecte',
        desc: 'Standardele de țeavă (GF COOL-FIT, Uponor, Pipelife, Valrom) sunt pre-setați cu dimensiunile verificate din librăriile oficiale — găsești totul în „Standarde Țevi".',
    },
    {
        icon: Droplets,
        title: 'Sistemul tău, calculat exact',
        desc: 'Adaugă segmente + echipamente, iar aplicația calculează volumul din diametrul interior, cu pierderi prin fittinguri și marja aleasă de tine.',
    },
    {
        icon: ShoppingCart,
        title: 'Comanda, gata de trimis',
        desc: 'Dashboard-ul îți arată cât glicol cumperi (în canistre de 10 L), iar „Export Comandă" îți dă PDF-ul curat cu site, țeavă și listă de cumpărat.',
    },
];

/** Onboarding minimal la prima vizită — 3 pași, dismissibil permanent. */
export const OnboardingOverlay: React.FC = () => {
    const { preferences, updatePreference } = usePreferences();
    const { setActiveTab } = useUI();
    const [step, setStep] = useState(0);
    const [closing, setClosing] = useState(false);

    const show = preferences.showWelcomeOnStartup && !closing;

    const finish = (goTo?: 'config') => {
        updatePreference('showWelcomeOnStartup', false);
        setClosing(true);
        if (goTo === 'config') setActiveTab('config');
    };

    return (
        <AnimatePresence>
            {show && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
                    role="dialog"
                    aria-modal="true"
                >
                    <motion.div
                        initial={{ opacity: 0, scale: 0.96, y: 12 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.98 }}
                        transition={{ duration: 0.3, ease: 'easeOut' }}
                        className="w-full max-w-2xl bg-card rounded-3xl border border-border shadow-2xl overflow-hidden"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between px-8 pt-6">
                            <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-muted-foreground">
                                Datacenter Engineering Suite
                            </span>
                            <button
                                onClick={() => finish()}
                                className="p-2 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                                aria-label="Închide"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Body */}
                        <div className="px-8 py-6">
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={step}
                                    initial={{ opacity: 0, x: 24 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -24 }}
                                    transition={{ duration: 0.25 }}
                                    className="flex flex-col items-center text-center py-4"
                                >
                                    <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-5">
                                        {React.createElement(STEPS[step].icon, { className: 'w-8 h-8 text-primary' })}
                                    </div>
                                    <h2 className="text-2xl font-semibold tracking-tight text-foreground mb-2">
                                        {STEPS[step].title}
                                    </h2>
                                    <p className="text-sm text-muted-foreground max-w-md leading-relaxed">
                                        {STEPS[step].desc}
                                    </p>
                                </motion.div>
                            </AnimatePresence>

                            {/* Dots */}
                            <div className="flex items-center justify-center gap-2 mt-2">
                                {STEPS.map((_, i) => (
                                    <span
                                        key={i}
                                        className={`h-1.5 rounded-full transition-all duration-300 ${i === step ? 'w-6 bg-primary' : 'w-1.5 bg-muted-foreground/30'}`}
                                    />
                                ))}
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="flex items-center justify-between px-8 pb-6">
                            <button
                                onClick={() => finish()}
                                className="text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
                            >
                                Sari peste
                            </button>
                            <div className="flex items-center gap-2">
                                {step < STEPS.length - 1 ? (
                                    <button
                                        onClick={() => setStep(s => s + 1)}
                                        className="btn btn-primary btn-md gap-2"
                                    >
                                        Continuă <ArrowRight className="w-4 h-4" />
                                    </button>
                                ) : (
                                    <button
                                        onClick={() => finish('config')}
                                        className="btn btn-primary btn-md gap-2"
                                    >
                                        Începe dimensionarea <ArrowRight className="w-4 h-4" />
                                    </button>
                                )}
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};
