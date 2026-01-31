'use client';

import React, { useState } from 'react';
import { useProject } from '@/context/ProjectContext';
import { useTranslation } from '@/context/PreferencesContext';
import { PipeManager } from './PipeManager';
import { EquipmentManager } from './EquipmentManager';
import { FluidComposition } from './FluidComposition';
import { motion, AnimatePresence } from 'framer-motion';
import {
    LayoutGrid,
    Database,
    Droplets,
    ChevronRight,
    Box,
    Weight,
    Image as ImageIcon
} from 'lucide-react';

export function PipingRoutingPage() {
    const {
        segments, setSegments,
        equipmentList, setEquipmentList,
        fluidType, glycolPercentage,
        safetyMargin, safetyMarginPercentage, setSafetyMargin,
        isInitialized
    } = useProject();

    const { t } = useTranslation();
    const [activeTab, setActiveTab] = useState<'segments' | 'equipment' | 'fluid'>('segments');
    const [equipmentViewMode, setEquipmentViewMode] = useState<'volume' | 'weights' | 'photos'>('volume');

    const tabs = React.useMemo(() => ([
        { id: 'segments', label: t('pipingRoutingPage.tabs.segments'), icon: LayoutGrid },
        { id: 'equipment', label: t('pipingRoutingPage.tabs.equipment'), icon: Database },
        { id: 'fluid', label: t('pipingRoutingPage.tabs.fluid'), icon: Droplets },
    ] as const), [t]);

    const equipmentTabs = React.useMemo(() => ([
        { id: 'volume', label: t('pipingRoutingPage.equipmentTabs.volume'), icon: Box },
        { id: 'weights', label: t('pipingRoutingPage.equipmentTabs.weights'), icon: Weight },
        { id: 'photos', label: t('pipingRoutingPage.equipmentTabs.photos'), icon: ImageIcon },
    ] as const), [t]);

    return (
        <div className="flex flex-col flex-1 h-full min-h-0 bg-background/50 relative overflow-hidden">
            {/* Header */}
            <div className="shrink-0 px-8 py-6 border-b border-border/40 bg-background/80 backdrop-blur-md z-10">
                <div className="flex flex-col gap-6">
                    {/* Breadcrumbs */}
                    <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground/60">
                        <span>{t('pipingRoutingPage.breadcrumbs.design')}</span>
                        <ChevronRight className="w-3 h-3" />
                        <span className="text-foreground">{t('pipingRoutingPage.breadcrumbs.physicConfig')}</span>
                    </div>

                    <div className="flex items-end justify-between">
                        <div>
                            <h1 className="text-3xl font-black text-foreground tracking-tight mb-2">
                                {t('pipingRoutingPage.title')}
                            </h1>
                            <p className="text-muted-foreground max-w-2xl text-sm font-medium">
                                {t('pipingRoutingPage.subtitle')}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center justify-between">
                        {/* Main Tabs */}
                        <div className="flex items-center gap-2 p-1 bg-muted/40 rounded-xl w-fit border border-white/5">
                            {tabs.map((tab) => {
                                const Icon = tab.icon;
                                const isActive = activeTab === tab.id;
                                return (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        className={`
                                            relative px-4 py-2.5 rounded-lg text-sm font-bold flex items-center gap-2.5 transition-all duration-300 outline-none focus:outline-none
                                            ${isActive ? 'text-primary-foreground shadow-lg shadow-primary/20' : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'}
                                        `}
                                    >
                                        {isActive && (
                                            <motion.div
                                                layoutId="activeTab"
                                                className="absolute inset-0 bg-primary rounded-lg"
                                                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                            />
                                        )}
                                        <Icon className="w-4 h-4 z-10 relative" />
                                        <span className="z-10 relative">{tab.label}</span>
                                    </button>
                                )
                            })}
                        </div>

                        {/* Equipment Sub-Tabs */}
                        {activeTab === 'equipment' && (
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="flex items-center gap-1 bg-card border border-border/50 rounded-lg p-1"
                            >
                                {equipmentTabs.map(t => (
                                    <button
                                        key={t.id}
                                        onClick={() => setEquipmentViewMode(t.id)}
                                        className={`p-2 rounded-md transition-colors ${equipmentViewMode === t.id ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:text-foreground'}`}
                                        title={t.label}
                                    >
                                        <t.icon className="w-4 h-4" />
                                    </button>
                                ))}
                            </motion.div>
                        )}
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto min-h-0 bg-linear-to-b from-background to-muted/20">
                <div className="max-w-[1600px] mx-auto p-8">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeTab}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.3 }}
                            className="h-full"
                        >
                            {activeTab === 'segments' && (
                                <PipeManager
                                    segments={segments}
                                    equipmentList={equipmentList}
                                    onSegmentsChange={setSegments}
                                    fluidType={fluidType}
                                    glycolPercentage={glycolPercentage}
                                    safetyMarginPercentage={safetyMarginPercentage}
                                    isLoading={!isInitialized}
                                    className="h-[calc(100vh-320px)] min-h-[600px]"
                                />
                            )}
                            {activeTab === 'equipment' && (
                                <EquipmentManager
                                    equipmentList={equipmentList}
                                    onEquipmentChange={setEquipmentList}
                                    safetyMargin={safetyMargin}
                                    onSafetyMarginChange={setSafetyMargin}
                                    viewMode={equipmentViewMode}
                                    isLoading={!isInitialized}
                                />
                            )}
                            {activeTab === 'fluid' && (
                                <div className="max-w-4xl mx-auto">
                                    <FluidComposition />
                                </div>
                            )}
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
}
