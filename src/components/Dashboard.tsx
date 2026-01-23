
"use client";

import React from 'react';
import { useProject } from '@/context/ProjectContext';
import { useTranslation } from '@/context/PreferencesContext';
import { motion } from 'framer-motion';
import { EmptyState } from '@/components/ui/EmptyState';
import {
    Activity,
    Zap,
    TrendingUp,
    Leaf,
    Plus,
    FileBox,
    Sparkles,
    Package,
    Cloud,
    ArrowRight
} from 'lucide-react';
import { BimImportModal } from './bim/BimImportModal';
import { TemplateSelector } from './TemplateSelector';
import { calculateSystemResources, SystemResources } from '@/lib/calc/resources';

export const Dashboard = () => {
    const {
        projectDetails,
        segments,
        equipmentList,
        setActiveTab,
        glycolPercentage,
        safetyMargin,
        safetyMarginPercentage
    } = useProject();
    const { t } = useTranslation();

    const [isBimOpen, setIsBimOpen] = React.useState(false);
    const [isTemplateOpen, setIsTemplateOpen] = React.useState(false);

    const resources = calculateSystemResources(
        segments,
        equipmentList,
        glycolPercentage,
        { enabled: safetyMargin, percentage: safetyMarginPercentage }
    );
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1
        }
    };

    return (
        <motion.div
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="max-w-[1600px] mx-auto p-8 space-y-12"
        >
            {/* Hero Section */}
            <motion.div variants={itemVariants} className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative">
                <div className="relative z-10">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                        className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold mb-4"
                    >
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                        </span>
                        {t('common.systemActive')}
                    </motion.div>
                    <h1 className="text-5xl font-bold tracking-tight text-foreground mb-2">
                        Engineering <span className="text-primary">Workspace</span>
                    </h1>
                    <p className="text-muted-foreground text-lg max-w-2xl">
                        {t('dashboard.welcomeSubtitle')}
                    </p>
                </div>

                <div className="flex gap-3 relative z-10">
                    <button
                        onClick={() => setIsTemplateOpen(true)}
                        className="btn btn-secondary h-12 px-6 border-primary/30 hover:border-primary/60 gap-2 text-foreground bg-primary/5 hover:bg-primary/10"
                    >
                        <Sparkles className="w-4 h-4 text-primary" />
                        {t('header.quickStart')}
                    </button>

                    <button
                        onClick={() => setIsBimOpen(true)}
                        className="btn btn-secondary h-12 px-6 gap-2"
                    >
                        <FileBox className="w-4 h-4 text-primary" />
                        {t('header.scanBim')}
                    </button>

                    <button
                        onClick={() => setActiveTab('config')}
                        className="btn btn-primary h-12 px-6 gap-2 group"
                    >
                        <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform" />
                        {t('header.newProject')}
                    </button>
                </div>

                {/* Background Decoration */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[300px] bg-primary/5 blur-[100px] rounded-full pointer-events-none -z-0" />
            </motion.div>

            {/* Quick Stats Grid */}
            <motion.div variants={containerVariants} className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <motion.div variants={itemVariants} className="card-premium p-6 flex flex-col justify-between hover:border-primary/30 group cursor-pointer h-[160px]" onClick={() => setActiveTab('config')}>
                    <div className="flex justify-between items-start">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                            <Activity className="w-5 h-5" />
                        </div>
                        <ArrowRight className="w-4 h-4 text-muted-foreground/30 group-hover:text-primary transition-colors" />
                    </div>
                    <div>
                        <div className="text-3xl font-bold font-mono tracking-tight">{segments.length}</div>
                        <div className="text-xs text-muted-foreground font-medium uppercase tracking-wider mt-1">{t('dashboard.activeSegments')}</div>
                    </div>
                </motion.div>

                <motion.div variants={itemVariants} className="card-premium p-6 flex flex-col justify-between hover:border-secondary/30 group cursor-pointer h-[160px]" onClick={() => setActiveTab('catalogs')}>
                    <div className="flex justify-between items-start">
                        <div className="w-10 h-10 rounded-xl bg-secondary/10 flex items-center justify-center text-muted-foreground group-hover:scale-110 transition-transform">
                            <Zap className="w-5 h-5" />
                        </div>
                        <ArrowRight className="w-4 h-4 text-muted-foreground/30 group-hover:text-secondary transition-colors" />
                    </div>
                    <div>
                        <div className="text-3xl font-bold font-mono tracking-tight">1,240+</div>
                        <div className="text-xs text-muted-foreground font-medium uppercase tracking-wider mt-1">{t('dashboard.catalogItems')}</div>
                    </div>
                </motion.div>

                <motion.div variants={itemVariants} className="card-premium p-6 flex flex-col justify-between hover:border-primary/30 group cursor-pointer h-[160px] relative overflow-hidden" onClick={() => setActiveTab('config')}>
                    <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="flex justify-between items-start relative z-10">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                            <TrendingUp className="w-5 h-5" />
                        </div>
                        <div className="px-2 py-0.5 rounded-md bg-primary/10 text-primary text-[10px] font-bold border border-primary/20">98% OPTIMAL</div>
                    </div>
                    <div className="relative z-10">
                        <div className="text-xl font-bold text-primary">{t('dashboard.systemStable')}</div>
                        <div className="text-xs text-muted-foreground font-medium uppercase tracking-wider mt-1">{t('dashboard.statusCheck')}</div>
                    </div>
                </motion.div>

                <motion.div variants={itemVariants} className="card-premium p-6 flex flex-col justify-between hover:border-primary/30 group cursor-pointer h-[160px]" onClick={() => setActiveTab('energy')}>
                    <div className="flex justify-between items-start">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                            <Leaf className="w-5 h-5" />
                        </div>
                        <div className="px-2 py-0.5 rounded-md bg-primary/10 text-primary text-[10px] font-bold border border-primary/20">AI CALC</div>
                    </div>
                    <div>
                        <div className="text-3xl font-bold font-mono tracking-tight">1.42</div>
                        <div className="text-xs text-muted-foreground font-medium uppercase tracking-wider mt-1">{t('dashboard.projPueScore')}</div>
                    </div>
                </motion.div>
            </motion.div>

            {/* Content Grid */}
            <motion.div variants={containerVariants} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Getting Started (Conditional) */}
                    {segments.length === 0 && equipmentList.length === 0 && (
                        <motion.div variants={itemVariants} className="glass-panel p-8 rounded-3xl border border-primary/20 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />

                            <h3 className="font-bold text-xl mb-6 relative z-10">{t('dashboard.initializeProject')}</h3>
                            <div className="grid gap-4 relative z-10">
                                <button onClick={() => setActiveTab('config')} className="flex items-center gap-4 p-4 rounded-2xl bg-secondary/40 border border-white/5 hover:bg-secondary/60 hover:border-primary/20 transition-all text-left group">
                                    <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold border border-primary/20 group-hover:scale-110 transition-transform">1</div>
                                    <div>
                                        <div className="font-bold text-sm">{t('dashboard.configureFluids')}</div>
                                        <div className="text-xs text-muted-foreground">{t('dashboard.configureFluidsDesc')}</div>
                                    </div>
                                    <ArrowRight className="w-4 h-4 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                                </button>

                                <button onClick={() => setActiveTab('bim')} className="flex items-center gap-4 p-4 rounded-2xl bg-secondary/40 border border-white/5 hover:bg-secondary/60 hover:border-primary/20 transition-all text-left group">
                                    <div className="w-10 h-10 rounded-full bg-secondary/10 text-muted-foreground flex items-center justify-center font-bold border border-secondary/20 group-hover:scale-110 transition-transform">2</div>
                                    <div>
                                        <div className="font-bold text-sm">{t('dashboard.importArchitecture')}</div>
                                        <div className="text-xs text-muted-foreground">{t('dashboard.importArchitectureDesc')}</div>
                                    </div>
                                    <ArrowRight className="w-4 h-4 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                                </button>
                            </div>
                        </motion.div>
                    )}

                    {/* Project Stats Detail */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <motion.div variants={itemVariants} className="glass-panel p-6 rounded-3xl flex items-center gap-6">
                            <div className="p-3 bg-secondary rounded-2xl">
                                <Package className="w-6 h-6 text-muted-foreground" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">{t('dashboard.totalPiping')}</p>
                                <p className="text-2xl font-bold">{segments.reduce((acc, seg) => acc + (seg.length || 0), 0).toFixed(1)} <span className="text-sm font-normal text-muted-foreground">{t('dashboard.meters')}</span></p>
                            </div>
                        </motion.div>

                        <motion.div variants={itemVariants} className="glass-panel p-6 rounded-3xl flex items-center gap-6">
                            <div className="p-3 bg-secondary rounded-2xl">
                                <Cloud className="w-6 h-6 text-muted-foreground" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">{t('dashboard.syncStatus')}</p>
                                <p className="text-2xl font-bold">{projectDetails.projectNumber ? t('dashboard.cloudActive') : t('dashboard.localOnly')}</p>
                            </div>
                        </motion.div>
                    </div>

                    {/* Fluid Resources Widget */}
                    <motion.div variants={itemVariants} className="glass-panel p-6 rounded-3xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-10">
                            <Package className="w-24 h-24 text-primary transform rotate-12" />
                        </div>

                        <div className="flex items-center gap-3 mb-6 relative z-10">
                            <div className="p-2 bg-primary/10 rounded-lg">
                                <Activity className="w-5 h-5 text-primary" />
                            </div>
                            <h3 className="font-bold text-lg">{t('dashboard.fluidRequirements')}</h3>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 relative z-10">

                            {/* Total Calculation */}
                            <div className="bg-background/40 rounded-2xl p-4 border border-white/5 flex flex-col justify-between">
                                <div>
                                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">{t('dashboard.baseVolume')}</p>
                                    <div className="flex items-baseline gap-2">
                                        <p className="text-xl font-bold text-foreground">{resources.baseSystemVolume.toFixed(0)}</p>
                                        <span className="text-xs text-muted-foreground">{t('dashboard.liters')}</span>
                                    </div>
                                </div>
                                <p className="text-[10px] text-muted-foreground mt-2 border-t border-border/20 pt-2">
                                    {t('dashboard.pipesEquipment')}
                                </p>
                            </div>

                            {/* Safety Margin */}
                            <div className="bg-background/40 rounded-2xl p-4 border border-white/5 flex flex-col justify-between">
                                <div>
                                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">{t('dashboard.safetyReserve')}</p>
                                    <div className="flex items-baseline gap-2">
                                        <p className="text-xl font-bold text-amber-500/80">+{resources.safetyMarginVolume.toFixed(0)}</p>
                                        <span className="text-xs text-muted-foreground">{t('dashboard.liters')}</span>
                                    </div>
                                </div>
                                <div className="text-[10px] text-muted-foreground mt-2 border-t border-border/20 pt-2 flex items-center gap-1">
                                    <span className={`w-1.5 h-1.5 rounded-full ${safetyMargin ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                                    {safetyMargin ? `${safetyMarginPercentage}% ${t('dashboard.margin')}` : t('dashboard.disabled')}
                                </div>
                            </div>

                            {/* Total Purchase */}
                            <div className="bg-primary/10 rounded-2xl p-4 border border-primary/20 flex flex-col justify-between shadow-[0_0_30px_-10px_rgba(var(--primary),0.2)]">
                                <div>
                                    <p className="text-xs font-bold text-primary uppercase tracking-wider mb-1">{t('dashboard.totalToBuy')}</p>
                                    <div className="flex items-baseline gap-2">
                                        <p className="text-2xl font-black text-primary">{resources.totalSystemVolume.toFixed(0)}</p>
                                        <span className="text-sm font-medium text-primary/70">{t('dashboard.liters')}</span>
                                    </div>
                                </div>
                                <p className="text-[10px] text-primary/70 mt-2 border-t border-primary/20 pt-2 font-medium">
                                    {t('dashboard.premixed')} {glycolPercentage}% {t('dashboard.glycol')}
                                </p>
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* Right Panel: AI & Updates */}
                <motion.div variants={itemVariants} className="lg:col-span-1">
                    <div className="h-full glass-panel-heavy rounded-3xl p-6 relative overflow-hidden flex flex-col">
                        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none" />

                        <div className="flex items-center gap-2 mb-6 relative z-10">
                            <Sparkles className="w-4 h-4 text-primary" />
                            <h3 className="font-bold text-sm uppercase tracking-wider">{t('dashboard.systemUpdates')}</h3>
                        </div>

                        <div className="space-y-6 relative z-10 flex-1">
                            <div className="group">
                                <div className="flex items-center justify-between mb-1">
                                    <span className="text-xs font-bold text-foreground">{t('dashboard.energyEngine')}</span>
                                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-primary/10 text-primary border border-primary/20">{t('common.live')}</span>
                                </div>
                                <p className="text-xs text-muted-foreground">{t('dashboard.energyEngineDesc')}</p>
                            </div>

                            <div className="w-full h-px bg-white/5" />

                            <div className="group">
                                <div className="flex items-center justify-between mb-1">
                                    <span className="text-xs font-bold text-foreground">{t('dashboard.hydraulicSolver')}</span>
                                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-secondary/10 text-muted-foreground border border-secondary/20">{t('common.beta')}</span>
                                </div>
                                <p className="text-xs text-muted-foreground">{t('dashboard.hydraulicSolverDesc')}</p>
                            </div>

                            <div className="mt-auto pt-6">
                                <div className="p-4 rounded-xl bg-primary/5 border border-primary/10">
                                    <p className="text-[10px] font-mono text-primary mb-2">{t('dashboard.aiInsight')}</p>
                                    <p className="text-xs text-muted-foreground italic">{t('dashboard.aiInsightText')}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </motion.div>

            {/* Modals */}
            <BimImportModal isOpen={isBimOpen} onClose={() => setIsBimOpen(false)} />
            <TemplateSelector isOpen={isTemplateOpen} onClose={() => setIsTemplateOpen(false)} />
        </motion.div>
    );
};
