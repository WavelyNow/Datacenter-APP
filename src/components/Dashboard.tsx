"use client";

import React from 'react';
import { useProject } from '@/context/ProjectContext';
import { useUI } from '@/context/UIContext';
import { motion } from 'framer-motion';
import {
    Sparkles,
    FileBox,
    Plus,
    Activity,
    ArrowRight,
    Zap,
    TrendingUp,
    Scale,
    Package,
    Cloud,
    Printer,
    Check,
    Circle
} from 'lucide-react';
import { TemplateSelector } from './TemplateSelector';
import { calculateSystemResources } from '@/lib/calc/resources';
import { calculatePurchaseSummary } from '@/lib/calculations/purchase';
import { useTranslation } from '@/context/PreferencesContext';
import { Tooltip } from './ui/Tooltip';

const DashboardBase = () => {
    const { t } = useTranslation();
    const {
        projectDetails,
        segments,
        equipmentList,
        glycolPercentage,
        safetyMargin,
        safetyMarginPercentage,
        cloudProjectId,
        fluidType,
        fittingItems
    } = useProject();

    const { setActiveTab } = useUI();

    const [isTemplateOpen, setIsTemplateOpen] = React.useState(false);

    const resources = React.useMemo(() => calculateSystemResources(
        segments,
        equipmentList,
        glycolPercentage,
        { enabled: safetyMargin, percentage: safetyMarginPercentage }
    ), [segments, equipmentList, glycolPercentage, safetyMargin, safetyMarginPercentage]);

    // Sumarul de comandă (aceleași cifre ca PDF/Excel): glicol cu pierderi fittinguri
    const purchase = React.useMemo(() => calculatePurchaseSummary(
        segments,
        equipmentList,
        glycolPercentage,
        fluidType,
        safetyMargin,
        safetyMarginPercentage,
        fittingItems
    ), [segments, equipmentList, glycolPercentage, fluidType, safetyMargin, safetyMarginPercentage, fittingItems]);

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.05,
                delayChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { y: 15, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: {
                type: 'spring' as const,
                stiffness: 100,
                damping: 15,
                mass: 0.5
            }
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
            <motion.div variants={itemVariants} className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative">                <div className="relative z-10">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                        className="flex items-center gap-2.5 mb-5"
                    >
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-muted text-muted-foreground text-xs font-medium">
                            <span className="relative flex h-1.5 w-1.5">
                                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-primary"></span>
                            </span>
                            Sistem Activ
                        </div>
                        <div className="inline-flex items-center px-3 py-1 rounded-full bg-muted text-muted-foreground text-xs font-medium">
                            FAZA PLANIFICARE
                        </div>
                    </motion.div>
                    <h1 className="text-5xl font-semibold tracking-tight text-foreground mb-3">
                        Engineering <span className="text-primary">Workspace</span>
                    </h1>
                    <p className="text-muted-foreground text-lg max-w-2xl">
                        Prezentare generală în timp real a metricilor proiectului.
                    </p>
                </div>

                <div className="flex gap-3 relative z-10">
                    <Tooltip content="Alege din șabloane pre-configurate pentru a începe rapid" side="bottom">
                        <button
                            onClick={() => setIsTemplateOpen(true)}
                            title="Alege din șabloane pre-configurate pentru a începe rapid"
                            className="btn btn-secondary h-12 px-6 border-primary/30 hover:border-primary/60 gap-2 text-foreground bg-primary/5 hover:bg-primary/10"
                        >
                            <Sparkles className="w-4 h-4 text-primary" />
                            Start Rapid
                        </button>
                    </Tooltip>

                    <Tooltip content="Deschide galeria 3D cu produsele producătorilor (modele Sketchfab)" side="bottom">
                        <button
                            onClick={() => setActiveTab('bim_gallery')}
                            title="Deschide galeria 3D cu produsele producătorilor (modele Sketchfab)"
                            className="btn btn-secondary h-12 px-6 gap-2"
                        >
                            <FileBox className="w-4 h-4 text-primary" />
                            Galerie 3D
                        </button>
                    </Tooltip>

                    <Tooltip content="Începe un proiect nou adăugând manual segmente de țeavă" side="bottom">
                        <button
                            onClick={() => setActiveTab('config')}
                            title="Începe un proiect nou adăugând manual segmente de țeavă"
                            className="btn btn-primary h-12 px-6 gap-2 group"
                        >
                            <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform" />
                            Proiect Nou
                        </button>
                    </Tooltip>
                </div>

                {/* Background Decoration */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[300px] bg-primary/5 blur-[100px] rounded-full pointer-events-none z-0" />
            </motion.div>

            {/* Quick Stats Grid */}
            <motion.div variants={containerVariants} className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <motion.div variants={itemVariants} className="card-premium p-6 flex flex-col justify-between hover:border-primary/30 group cursor-pointer h-[160px]" onClick={() => setActiveTab('config')}>
                    <div className="flex justify-between items-start">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                            <Package className="w-5 h-5" />
                        </div>
                        <ArrowRight className="w-4 h-4 text-muted-foreground/30 group-hover:text-primary transition-colors" />
                    </div>
                    <div>
                        <div className="text-3xl font-bold font-mono tracking-tight">{equipmentList.length}</div>
                        <div className="text-xs text-muted-foreground font-medium uppercase tracking-wider mt-1">Unități / Echipamente</div>
                    </div>
                </motion.div>

                <motion.div variants={itemVariants} className="card-premium p-6 flex flex-col justify-between hover:border-secondary/30 group cursor-pointer h-[160px]" onClick={() => setActiveTab('config')}>
                    <div className="flex justify-between items-start">
                        <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform">
                            <Activity className="w-5 h-5" />
                        </div>
                        <ArrowRight className="w-4 h-4 text-muted-foreground/30 group-hover:text-secondary transition-colors" />
                    </div>
                    <div>
                        <div className="text-3xl font-bold font-mono tracking-tight">
                            {segments.reduce((acc, seg) => acc + (seg.length || 0), 0).toFixed(1)} <span className="text-lg font-normal">m</span>
                        </div>
                        <div className="text-xs text-muted-foreground font-medium uppercase tracking-wider mt-1">Lungime Totală Țeavă</div>
                    </div>
                </motion.div>

                <motion.div variants={itemVariants} className="card-premium p-6 flex flex-col justify-between hover:border-border group cursor-pointer h-[160px] relative overflow-hidden" onClick={() => setActiveTab('config')}>
                    <div className="absolute inset-0 bg-muted opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="flex justify-between items-start relative z-10">
                        <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                            <TrendingUp className="w-5 h-5" />
                        </div>
                        <div className="px-2 py-0.5 rounded-md bg-muted text-primary text-[10px] font-bold border border-border">REAL-TIME</div>
                    </div>
                    <div className="relative z-10">
                        <div className="text-3xl font-bold font-mono tracking-tight">
                            {resources?.totalSystemVolume?.toFixed(0) || '0'} <span className="text-lg font-normal">L</span>
                        </div>
                        <div className="text-xs text-muted-foreground font-medium uppercase tracking-wider mt-1">Volum Total Sistem</div>
                    </div>
                </motion.div>

                <motion.div variants={itemVariants} className="card-premium p-6 flex flex-col justify-between hover:border-blue-500/30 group cursor-pointer h-[160px]" onClick={() => setActiveTab('weights')}>
                    <div className="flex justify-between items-start">
                        <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform">
                            <Scale className="w-5 h-5" />
                        </div>
                        <div className="px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-600 text-[10px] font-bold border border-blue-500/20">SARCINĂ</div>
                    </div>
                    <div>
                        <div className="text-3xl font-bold font-mono tracking-tight">
                            {(resources?.totalOperationalWeight || 0).toLocaleString('en-US', { maximumFractionDigits: 0 })} <span className="text-lg font-normal">kg</span>
                        </div>
                        <div className="text-xs text-muted-foreground font-medium uppercase tracking-wider mt-1">Sarcina Totală la Sol</div>
                    </div>
                </motion.div>
            </motion.div>

            {/* Content Grid */}
            <motion.div variants={containerVariants} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Pasul următor — strip de completare */}
                    <motion.div variants={itemVariants} className="glass-panel p-4 rounded-2xl flex flex-wrap items-center gap-2">
                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mr-1">Progres:</span>
                        {[
                            { done: (segments || []).length > 0, label: 'Segmente', tab: 'config' as const },
                            { done: (equipmentList || []).length > 0, label: 'Echipamente', tab: 'config' as const },
                            { done: (fittingItems || []).length > 0, label: 'Fittinguri', tab: 'hydraulics' as const },
                            { done: true, label: 'Standarde verificate', tab: 'pipe-standards' as const },
                        ].map((step) => (
                            <button
                                key={step.label}
                                onClick={() => setActiveTab(step.tab)}
                                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all hover:scale-[1.03] ${
                                    step.done
                                        ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
                                        : 'bg-muted text-muted-foreground border-border hover:text-foreground'
                                }`}
                            >
                                {step.done ? <Check className="w-3 h-3" /> : <Circle className="w-3 h-3" />}
                                {step.label}
                            </button>
                        ))}
                        <span className="ml-auto text-[11px] text-muted-foreground">
                            {segments.length > 0 && equipmentList.length > 0 ? 'Sistem definit — vezi comanda mai jos' : 'Adaugă segmente pentru a calcula'}
                        </span>
                    </motion.div>
                    {/* Getting Started (Conditional) */}
                    {segments.length === 0 && equipmentList.length === 0 && (
                        <motion.div variants={itemVariants} className="glass-panel p-8 rounded-3xl border border-primary/20 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />

                            <h3 className="font-bold text-xl mb-6 relative z-10">Inițializare Proiect</h3>
                            <div className="grid gap-4 relative z-10">
                                <button onClick={() => setActiveTab('config')} className="flex items-center gap-4 p-4 rounded-2xl bg-secondary/40 border border-white/5 hover:bg-secondary/60 hover:border-primary/20 transition-all text-left group">
                                    <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold border border-primary/20 group-hover:scale-110 transition-transform">1</div>
                                    <div>
                                        <div className="font-bold text-sm">Configurează Fluide</div>
                                        <div className="text-xs text-muted-foreground">Setează proprietățile fluidului</div>
                                    </div>
                                    <ArrowRight className="w-4 h-4 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                                </button>

                                <button onClick={() => setActiveTab('config')} className="flex items-center gap-4 p-4 rounded-2xl bg-secondary/40 border border-white/5 hover:bg-secondary/60 hover:border-primary/20 transition-all text-left group">
                                    <div className="w-10 h-10 rounded-full bg-secondary/10 text-muted-foreground flex items-center justify-center font-bold border border-secondary/20 group-hover:scale-110 transition-transform">2</div>
                                    <div>
                                        <div className="font-bold text-sm">Alege Diametre & Lungimi</div>
                                        <div className="text-xs text-muted-foreground">Adaugă segmente de țeavă din standarde verificat</div>
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
                                <p className="text-sm font-medium text-muted-foreground">Total Tubulatură</p>
                                <p className="text-2xl font-bold">{segments.reduce((acc, seg) => acc + (seg.length || 0), 0).toFixed(1)} <span className="text-sm font-normal text-muted-foreground">m</span></p>
                            </div>
                        </motion.div>

                        <motion.div variants={itemVariants} className="glass-panel p-6 rounded-3xl flex items-center gap-6">
                            <div className="p-3 bg-primary/10 rounded-2xl">
                                <Zap className="w-6 h-6 text-primary" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">{t('dashboard.stats.installedPower')}</p>
                                <p className="text-2xl font-bold">
                                    {equipmentList.reduce((acc, eq) => acc + (eq.power || 0), 0).toFixed(0)} <span className="text-sm font-normal text-muted-foreground">kW</span>
                                </p>
                            </div>
                        </motion.div>

                        <motion.div variants={itemVariants} className="glass-panel p-6 rounded-3xl flex items-center gap-6">
                            <div className="p-3 bg-secondary rounded-2xl">
                                <Cloud className="w-6 h-6 text-muted-foreground" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Status Sincronizare</p>
                                <p className="text-2xl font-bold">{cloudProjectId ? "Cloud Activ" : "Doar Local"}</p>
                            </div>
                        </motion.div>
                    </div>

                    {/* Fluid Resources Widget */}
                    <motion.div variants={itemVariants} className="glass-panel p-6 rounded-3xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-10">
                            <Package className="w-24 h-24 text-primary transform rotate-12" />
                        </div>

                        <div className="flex items-center justify-between mb-6 relative z-10">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-primary/10 rounded-lg">
                                    <Activity className="w-5 h-5 text-primary" />
                                </div>
                                <h3 className="font-bold text-lg">Cerințe Fluid</h3>
                            </div>
                            <button
                                onClick={() => window.dispatchEvent(new CustomEvent('opencode:open-export'))}
                                className="btn btn-sm btn-primary gap-1.5"
                            >
                                <Printer className="w-3.5 h-3.5" /> Export Comandă
                            </button>
                        </div>

                        {/* Bară vizuală stack: țeavă / echipamente / fittinguri / marjă */}
                        {purchase.rawTotalL > 0 && (
                            <div className="mb-5 relative z-10">
                                <div className="flex h-3.5 w-full overflow-hidden rounded-full bg-muted">
                                    <div className="bg-primary" style={{ width: `${(purchase.pipeVolumeL / purchase.rawTotalL) * 100}%` }} title={`Țeavă: ${purchase.pipeVolumeL.toFixed(0)} L`} />
                                    <div className="bg-primary/70" style={{ width: `${(purchase.equipmentVolumeL / purchase.rawTotalL) * 100}%` }} title={`Echipamente: ${purchase.equipmentVolumeL.toFixed(0)} L`} />
                                    <div className="bg-primary/45" style={{ width: `${(purchase.fittingsVolumeL / purchase.rawTotalL) * 100}%` }} title={`Fittinguri: ${purchase.fittingsVolumeL.toFixed(0)} L`} />
                                    <div className="bg-primary/25" style={{ width: `${(purchase.marginL / purchase.rawTotalL) * 100}%` }} title={`Marjă: ${purchase.marginL.toFixed(0)} L`} />
                                </div>
                                <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-[10px] text-muted-foreground">
                                    <span className="inline-flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-primary inline-block" />Țeavă {purchase.pipeVolumeL.toFixed(0)} L</span>
                                    <span className="inline-flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-primary/70 inline-block" />Echipamente {purchase.equipmentVolumeL.toFixed(0)} L</span>
                                    <span className="inline-flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-primary/45 inline-block" />Fittinguri {purchase.fittingsVolumeL.toFixed(0)} L</span>
                                    <span className="inline-flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-primary/25 inline-block" />Marjă {purchase.marginL.toFixed(0)} L</span>
                                </div>
                            </div>
                        )}

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 relative z-10">

                            {/* Total Calculation */}
                            <div className="bg-background/40 rounded-2xl p-4 border border-white/5 flex flex-col justify-between">
                                <div>
                                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">Volum Bază</p>
                                    <div className="flex items-baseline gap-2">
                                        <p className="text-xl font-bold text-foreground">{resources.baseSystemVolume.toFixed(0)}</p>
                                        <span className="text-xs text-muted-foreground">litri</span>
                                    </div>
                                </div>
                                <p className="text-[10px] text-muted-foreground mt-2 border-t border-border/20 pt-2">
                                    Țevi & Echipamente
                                </p>
                            </div>

                            {/* Safety Margin */}
                            <div className="bg-background/40 rounded-2xl p-4 border border-white/5 flex flex-col justify-between">
                                <div>
                                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">Rezervă Siguranță</p>
                                    <div className="flex items-baseline gap-2">
                                        <p className="text-xl font-bold text-amber-500/80">+{resources.safetyMarginVolume.toFixed(0)}</p>
                                        <span className="text-xs text-muted-foreground">litri</span>
                                    </div>
                                </div>
                                <div className="text-[10px] text-muted-foreground mt-2 border-t border-border/20 pt-2 flex items-center gap-1">
                                    <span className={`w-1.5 h-1.5 rounded-full ${safetyMargin ? 'bg-primary' : 'bg-amber-500'}`} />
                                    {safetyMargin ? `${safetyMarginPercentage}% Marjă` : "Dezactivat"}
                                </div>
                            </div>

                            {/* Total Purchase — cu pierderi fittinguri (același calcul ca PDF/Excel) */}
                            <div className="bg-primary/10 rounded-2xl p-4 border border-primary/20 flex flex-col justify-between">
                                <div>
                                    <p className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Total De Cumpărat</p>
                                    <div className="flex items-baseline gap-2">
                                        <p className="text-2xl font-black text-primary">{purchase.totalGlycolL.toFixed(0)}</p>
                                        <span className="text-sm font-medium text-primary/70">litri</span>
                                    </div>
                                </div>
                                <div className="text-[10px] text-primary/70 mt-2 border-t border-primary/20 pt-2 space-y-0.5 font-medium">
                                    <p>Premixat {glycolPercentage}% Glicol ({fluidType === 'propylene' ? 'Propilen' : fluidType === 'ethylene' ? 'Etilen' : 'Apă'})</p>
                                    <p>Fittinguri ({purchase.fittingsTotalCount} buc — calculate din numar): +{purchase.fittingsVolumeL.toFixed(1)} L</p>
                                    <p>≈ {purchase.canisters10L.toFixed(1)} canistre × 10 L</p>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* Right Panel: AI & Updates */}
                <motion.div variants={itemVariants} className="lg:col-span-1">
                    <div className="h-full glass-panel-heavy rounded-3xl p-6 relative overflow-hidden flex flex-col">
                        <div className="absolute inset-0 bg-linear-to-b from-primary/5 to-transparent pointer-events-none" />

                        <div className="flex items-center gap-2 mb-6 relative z-10">
                            <Sparkles className="w-4 h-4 text-primary" />
                            <h3 className="font-bold text-sm uppercase tracking-wider">Actualizări Sistem</h3>
                        </div>

                        <div className="space-y-4 relative z-10 flex-1">
                            {[
                                { tag: '2026', title: 'CDU-uri de 2.5 MW', desc: 'Motivair MCDU-70 (Schneider) — centralizate, scalabile la 10 MW+ pentru platforme AI.' },
                                { tag: '2025', title: 'CoolChip CDU 70-600 kW', desc: 'Vertiv — seria completă: in-rack 100 kW, in-row 600 kW, și lichid-aer 70 kW (retrofit).' },
                                { tag: '2025', title: 'Uși răcite 75 kW/rack', desc: 'ChilledDoor RDHx (Schneider/Motivair) — schimbător pe ușa spate, agnostic OCP/Open19.' },
                                { tag: '2024', title: 'Apă caldă W32+', desc: 'STULZ CyberCool — free-cooling pe circuite calde ASHRAE W32-W+; CDU 345–1380 kW.' },
                                { tag: '2026', title: 'DC 3 MW pe CDU', desc: 'Delta GoCool-3000 (GTC 2026) și CoolIT CHx2000 — popularizarea răcirii pe lichid la scară.' },
                            ].map(item => (
                                <div key={item.title} className="group">
                                    <div className="flex items-center justify-between mb-0.5">
                                        <span className="text-xs font-semibold text-foreground">{item.title}</span>
                                        <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">{item.tag}</span>
                                    </div>
                                    <p className="text-[11px] text-muted-foreground leading-relaxed">{item.desc}</p>
                                </div>
                            ))}

                            <div className="mt-auto pt-4">
                                <div className="p-4 rounded-xl bg-muted/40 border border-border/50">
                                    <p className="text-[10px] font-bold text-primary uppercase tracking-wider mb-1.5">Trend 2026</p>
                                    <p className="text-xs text-muted-foreground leading-relaxed">
                                        Răcirea pe lichid devine standard: CDU-uri 1–3 MW, operare cu apă caldă (32–45°C) și distribuție 800VDC.
                                        Dimensionați-vă conductele pentru debite mari la temperaturi ridicate — CoolFit 4.0 (PN10/SDR17) e soluția pre-izolată.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </motion.div>

            {/* Modals */}
            <TemplateSelector isOpen={isTemplateOpen} onClose={() => setIsTemplateOpen(false)} />
        </motion.div>
    );
};

export const Dashboard = React.memo(DashboardBase);
Dashboard.displayName = 'Dashboard';
