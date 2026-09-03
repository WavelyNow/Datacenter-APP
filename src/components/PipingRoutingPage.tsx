'use client';

import React, { useState } from 'react';
import { useProject } from '@/context/ProjectContext';
import { useTranslation } from '@/context/PreferencesContext';
import { PipeManager } from './PipeManager';
import { EquipmentManager } from './EquipmentManager';
import { FluidComposition } from './FluidComposition';
import { LiveSchematic } from './LiveSchematic';
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
        fittingItems, setFittingItems,
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
            <div className="z-10 shrink-0 border-b border-border/40 bg-background/80 px-4 py-4 backdrop-blur-md sm:px-8 sm:py-6">
                <div className="flex flex-col gap-6">
                    {/* Breadcrumbs */}
                    <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground/60">
                        <span>{t('pipingRoutingPage.breadcrumbs.design')}</span>
                        <ChevronRight className="w-3 h-3" />
                        <span className="text-foreground">{t('pipingRoutingPage.breadcrumbs.physicConfig')}</span>
                    </div>

                    <div className="flex items-end justify-between gap-4">
                        <div>
                            <h1 className="mb-2 text-2xl font-black tracking-tight text-foreground sm:text-3xl">
                                {t('pipingRoutingPage.title')}
                            </h1>
                            <p className="text-muted-foreground max-w-2xl text-sm font-medium">
                                {t('pipingRoutingPage.subtitle')}
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:justify-between">
                        {/* Main Tabs */}
                        <div className="flex w-full items-center gap-2 overflow-x-auto rounded-xl border border-white/5 bg-muted/40 p-1 sm:w-fit">
                            {tabs.map((tab) => {
                                const Icon = tab.icon;
                                const isActive = activeTab === tab.id;
                                return (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        className={`
                                            relative shrink-0 rounded-lg px-3 py-2.5 text-sm font-bold flex items-center gap-2 transition-all duration-300 outline-none focus:outline-none sm:px-4 sm:gap-2.5
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
                                className="flex w-fit items-center gap-1 self-start rounded-lg border border-border/50 bg-card p-1 sm:self-auto"
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
                <div className="mx-auto max-w-[1600px] p-3 sm:p-8">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeTab}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.3 }}
                            className="h-full space-y-6"
                        >
                            {/* Schemă live — mereu vizibilă în tab-ul de segmente */}
                            {activeTab === 'segments' && (
                                <LiveSchematic segments={segments} equipmentList={equipmentList} />
                            )}
                            {activeTab === 'segments' && (
                                <PipeManager
                                    segments={segments}
                                    equipmentList={equipmentList}
                                    onSegmentsChange={setSegments}
                                    fluidType={fluidType}
                                    glycolPercentage={glycolPercentage}
                                    safetyMarginPercentage={safetyMarginPercentage}
                                    safetyMargin={safetyMargin}
                                    fittingItems={fittingItems}
                                    onFittingItemsChange={setFittingItems}
                                    isLoading={!isInitialized}
                                    className="h-[calc(100dvh-360px)] min-h-[520px] sm:h-[calc(100vh-320px)] sm:min-h-[600px]"
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
