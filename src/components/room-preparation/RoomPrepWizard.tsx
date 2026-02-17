'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Ruler, Layers, LayoutGrid, Flame, Zap, Wind, Shield, ClipboardCheck,
    ChevronLeft, ChevronRight, Save, FileDown, Plus, Check, Circle,
    Building, ArrowRight, Trash2, LucideIcon
} from 'lucide-react';
import { useRoomPrep } from '@/context/RoomPrepContext';
import { PHASE_CONFIG } from '@/lib/room-preparation/types';
import { useTranslation } from '@/context/PreferencesContext';

// Type helper pentru window detail cu proprietăți extinse
interface WindowDetailItem {
    height?: number;
    width?: number;
    insulationRequired?: boolean;
    structureRequired?: boolean;
    [key: string]: unknown; // Permite alte proprietăți ChecklistItem
}

// Phase icons mapping
const PHASE_ICONS: Record<string, LucideIcon> = {
    Ruler, Layers, LayoutGrid, Flame, Zap, Wind, Shield, ClipboardCheck
};

// Main Wizard Component
export function RoomPrepWizard() {
    const { t } = useTranslation();
    const {
        currentRoom,
        rooms,
        createRoom,
        loadRoom,
        deleteRoom,
        saveRoom,
        currentPhaseIndex,
        setCurrentPhaseIndex,
        nextPhase,
        prevPhase,
        updateChecklistItem: _updateChecklistItem, // Folosit în PhaseContent
        getPhaseProgress
    } = useRoomPrep();

    const [showRoomList, setShowRoomList] = useState(!currentRoom);
    const [newRoomName, setNewRoomName] = useState('');
    const [showNewRoomInput, setShowNewRoomInput] = useState(false);

    // Handle create new room
    const handleCreateRoom = () => {
        if (newRoomName.trim()) {
            createRoom(newRoomName.trim());
            setNewRoomName('');
            setShowNewRoomInput(false);
            setShowRoomList(false);
        }
    };

    // Room selection view
    if (showRoomList || !currentRoom) {
        return (
            <div className="min-h-[600px] flex flex-col">
                {/* Header */}
                <div className="border-b border-border/50 p-6">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-linear-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                            <Building className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-foreground">
                                {t('roomPrep.title') !== 'roomPrep.title' ? t('roomPrep.title') : 'Pregătire Cameră Datacenter'}
                            </h1>
                            <p className="text-muted-foreground">
                                {t('roomPrep.subtitle') !== 'roomPrep.subtitle' ? t('roomPrep.subtitle') : 'Wizard de pregătire și verificare'}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Room List */}
                <div className="flex-1 p-6">
                    <div className="max-w-2xl mx-auto">
                        {/* Create New Room */}
                        <div className="mb-6">
                            {showNewRoomInput ? (
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={newRoomName}
                                        onChange={(e) => setNewRoomName(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleCreateRoom()}
                                        placeholder="Nume cameră (ex: Server Room A1)"
                                        className="flex-1 px-4 py-3 rounded-xl border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                                        autoFocus
                                    />
                                    <button
                                        onClick={handleCreateRoom}
                                        disabled={!newRoomName.trim()}
                                        className="px-6 py-3 rounded-xl bg-primary text-primary-foreground font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    >
                                        Creează
                                    </button>
                                    <button
                                        onClick={() => { setShowNewRoomInput(false); setNewRoomName(''); }}
                                        className="px-4 py-3 rounded-xl border border-border text-muted-foreground hover:bg-muted/50 transition-colors"
                                    >
                                        Anulează
                                    </button>
                                </div>
                            ) : (
                                <button
                                    onClick={() => setShowNewRoomInput(true)}
                                    className="w-full flex items-center justify-center gap-2 px-6 py-4 rounded-xl border-2 border-dashed border-border hover:border-primary/50 hover:bg-primary/5 text-muted-foreground hover:text-primary transition-all"
                                >
                                    <Plus className="w-5 h-5" />
                                    <span className="font-medium">Cameră nouă</span>
                                </button>
                            )}
                        </div>

                        {/* Existing Rooms */}
                        {rooms.length > 0 ? (
                            <div className="space-y-3">
                                <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-3">
                                    Camere existente
                                </h3>
                                {rooms.map((room) => (
                                    <motion.div
                                        key={room.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="group relative p-4 rounded-xl border border-border bg-card hover:border-primary/50 hover:shadow-lg transition-all cursor-pointer"
                                        onClick={() => { loadRoom(room.id); setShowRoomList(false); }}
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                                                    <Building className="w-5 h-5 text-muted-foreground" />
                                                </div>
                                                <div>
                                                    <h4 className="font-semibold text-foreground">{room.roomName}</h4>
                                                    <p className="text-sm text-muted-foreground">
                                                        {new Date(room.updatedAt).toLocaleDateString('ro-RO')}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                {/* Progress */}
                                                <div className="text-right">
                                                    <div className="text-sm font-medium text-foreground">
                                                        {room.completionPercentage}%
                                                    </div>
                                                    <div className="w-20 h-1.5 rounded-full bg-muted overflow-hidden">
                                                        <div
                                                            className="h-full bg-linear-to-r from-primary to-emerald-500 transition-all"
                                                            style={{ width: `${room.completionPercentage}%` }}
                                                        />
                                                    </div>
                                                </div>
                                                {/* Delete button */}
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        if (confirm('Ștergi această cameră?')) {
                                                            deleteRoom(room.id);
                                                        }
                                                    }}
                                                    className="p-2 rounded-lg text-muted-foreground hover:text-red-500 hover:bg-red-500/10 opacity-0 group-hover:opacity-100 transition-all"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                                {/* Arrow */}
                                                <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-12 text-muted-foreground">
                                <Building className="w-12 h-12 mx-auto mb-4 opacity-50" />
                                <p>Nu ai nicio cameră configurată încă.</p>
                                <p className="text-sm">Creează una nouă pentru a începe.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    // Current phase config
    const currentPhase = PHASE_CONFIG[currentPhaseIndex];
    const PhaseIcon: LucideIcon = PHASE_ICONS[currentPhase.icon] || Circle;

    return (
        <div className="min-h-[600px] flex flex-col">
            {/* Header with room info */}
            <div className="border-b border-border/50 p-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setShowRoomList(true)}
                            className="p-2 rounded-lg hover:bg-muted/50 text-muted-foreground transition-colors"
                        >
                            <ChevronLeft className="w-5 h-5" />
                        </button>
                        <div>
                            <h1 className="text-lg font-bold text-foreground">{currentRoom.roomName}</h1>
                            <p className="text-sm text-muted-foreground">
                                Faza {currentPhaseIndex + 1} din {PHASE_CONFIG.length}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={saveRoom}
                            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                        >
                            <Save className="w-4 h-4" />
                            Salvează
                        </button>
                        <button
                            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border hover:bg-muted/50 transition-colors"
                        >
                            <FileDown className="w-4 h-4" />
                            Export PDF
                        </button>
                    </div>
                </div>
            </div>

            <div className="flex-1 flex">
                {/* Sidebar with phases */}
                <div className="w-64 border-r border-border/50 p-4 bg-muted/20">
                    <div className="space-y-1">
                        {PHASE_CONFIG.map((phase, index) => {
                            const Icon: LucideIcon = PHASE_ICONS[phase.icon] || Circle;
                            const progress = getPhaseProgress(phase.key);
                            const isActive = index === currentPhaseIndex;
                            const isComplete = progress.percentage === 100;

                            return (
                                <button
                                    key={phase.id}
                                    onClick={() => setCurrentPhaseIndex(index)}
                                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all ${isActive
                                        ? 'bg-primary text-primary-foreground shadow-lg'
                                        : 'hover:bg-muted/50 text-foreground'
                                        }`}
                                >
                                    <div className={`relative w-8 h-8 rounded-lg flex items-center justify-center ${isActive ? 'bg-primary-foreground/20' : isComplete ? 'bg-emerald-500/20' : 'bg-muted'
                                        }`}>
                                        {isComplete && !isActive ? (
                                            <Check className="w-4 h-4 text-emerald-500" />
                                        ) : (
                                            <Icon className={`w-4 h-4 ${isActive ? 'text-primary-foreground' : 'text-muted-foreground'}`} />
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className={`text-sm font-medium truncate ${isActive ? '' : ''}`}>
                                            {phase.titleRo}
                                        </div>
                                        {!isActive && (
                                            <div className="text-xs text-muted-foreground">
                                                {progress.percentage}%
                                            </div>
                                        )}
                                    </div>
                                </button>
                            );
                        })}
                    </div>

                    {/* Overall progress */}
                    <div className="mt-6 p-4 rounded-xl bg-muted/50">
                        <div className="text-sm font-medium text-foreground mb-2">Progres total</div>
                        <div className="text-3xl font-bold text-primary mb-2">
                            {currentRoom.completionPercentage}%
                        </div>
                        <div className="w-full h-2 rounded-full bg-muted overflow-hidden">
                            <motion.div
                                className="h-full bg-linear-to-r from-primary to-emerald-500"
                                initial={{ width: 0 }}
                                animate={{ width: `${currentRoom.completionPercentage}%` }}
                                transition={{ duration: 0.5 }}
                            />
                        </div>
                    </div>
                </div>

                {/* Main content area */}
                <div className="flex-1 flex flex-col">
                    {/* Phase header */}
                    <div className="p-6 border-b border-border/50">
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 rounded-xl bg-linear-to-br from-primary/20 to-primary/10 flex items-center justify-center">
                                <PhaseIcon className="w-7 h-7 text-primary" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-foreground">{currentPhase.titleRo}</h2>
                                <p className="text-muted-foreground">{currentPhase.descriptionRo}</p>
                            </div>
                        </div>
                    </div>

                    {/* Phase content */}
                    <div className="flex-1 p-6 overflow-y-auto">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={currentPhase.id}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.2 }}
                            >
                                <PhaseContent phaseKey={currentPhase.key} />
                            </motion.div>
                        </AnimatePresence>
                    </div>

                    {/* Navigation footer */}
                    <div className="p-4 border-t border-border/50 flex justify-between">
                        <button
                            onClick={prevPhase}
                            disabled={currentPhaseIndex === 0}
                            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border hover:bg-muted/50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            <ChevronLeft className="w-4 h-4" />
                            Faza anterioară
                        </button>
                        <button
                            onClick={nextPhase}
                            disabled={currentPhaseIndex === PHASE_CONFIG.length - 1}
                            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            Faza următoare
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

// Phase Content Component
function PhaseContent({ phaseKey }: { phaseKey: string }) {
    const { currentRoom, toggleItemStatus, updateChecklistItem, updatePhaseNotes } = useRoomPrep();

    if (!currentRoom) return null;

    // Structure phase has special handling
    if (phaseKey === 'structure') {
        return <StructurePhaseContent />;
    }

    // Get phase data
    const phase = currentRoom[phaseKey as keyof typeof currentRoom];
    if (typeof phase !== 'object' || !('items' in phase)) {
        return <div>Invalid phase</div>;
    }

    const items = Object.entries(phase.items);
    const phaseNotes = 'notes' in phase ? (phase.notes as string) : '';

    return (
        <div className="space-y-6">
            {/* Checklist */}
            <div className="space-y-3">
                {items.map(([key, item]) => {
                    const checkItem = item as {
                        id: string;
                        label: string;
                        description?: string;
                        status: string;
                        required: boolean
                    };
                    const isCompleted = checkItem.status === 'completed';

                    return (
                        <motion.div
                            key={key}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`group p-4 rounded-xl border transition-all ${isCompleted
                                ? 'border-emerald-500/50 bg-emerald-500/5'
                                : 'border-border hover:border-primary/50 bg-card'
                                }`}
                        >
                            <div className="flex items-start gap-4">
                                {/* Checkbox */}
                                <div 
                                    className={`mt-0.5 w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all cursor-pointer ${isCompleted
                                        ? 'border-emerald-500 bg-emerald-500'
                                        : 'border-muted-foreground/30 group-hover:border-primary'
                                    }`}
                                    onClick={() => toggleItemStatus(phaseKey, key)}
                                >
                                    {isCompleted && <Check className="w-4 h-4 text-white" />}
                                </div>
    
                                {/* Content */}
                                <div className="flex-1">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2 cursor-pointer" onClick={() => toggleItemStatus(phaseKey, key)}>
                                            <span className={`font-medium ${isCompleted ? 'text-emerald-700 dark:text-emerald-400' : 'text-foreground'}`}>
                                                {checkItem.label}
                                            </span>
                                            {checkItem.required && (
                                                <span className="px-2 py-0.5 text-xs rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400">
                                                    Obligatoriu
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    {checkItem.description && (
                                        <p className="text-sm text-muted-foreground mt-1">{checkItem.description}</p>
                                    )}

                                    {/* Custom Renderer for Window Details */}
                                    {key === 'windowDetail' && (
                                        <div className="mt-4 p-4 rounded-lg bg-muted/30 border border-border/50 space-y-4">
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <label className="text-[10px] font-bold text-muted-foreground uppercase opacity-70">Înălțime Geam (mm)</label>
                                                    <input 
                                                        type="number" 
                                                        value={(checkItem as WindowDetailItem).height || ''} 
                                                        onChange={(e) => updateChecklistItem(phaseKey, key, { height: parseInt(e.target.value) || 0 })}
                                                        className="w-full mt-1 bg-background border border-border rounded-md px-3 py-1.5 text-sm"
                                                        placeholder="ex: 1500"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="text-[10px] font-bold text-muted-foreground uppercase opacity-70">Lățime Geam (mm)</label>
                                                    <input 
                                                        type="number" 
                                                        value={(checkItem as WindowDetailItem).width || ''} 
                                                        onChange={(e) => updateChecklistItem(phaseKey, key, { width: parseInt(e.target.value) || 0 })}
                                                        className="w-full mt-1 bg-background border border-border rounded-md px-3 py-1.5 text-sm"
                                                        placeholder="ex: 2000"
                                                    />
                                                </div>
                                            </div>

                                            <div className="flex flex-col gap-3 pt-2">
                                                <div className="flex items-center justify-between p-2 rounded-md hover:bg-background/50 transition-colors">
                                                    <div className="flex items-center gap-2">
                                                        <div className={`w-2 h-2 rounded-full ${(checkItem as WindowDetailItem).insulationRequired ? 'bg-primary' : 'bg-muted-foreground/30'}`} />
                                                        <span className="text-xs font-medium">Izolație Termică Necesară</span>
                                                    </div>
                                                    <button 
                                                        onClick={() => updateChecklistItem(phaseKey, key, { insulationRequired: !(checkItem as WindowDetailItem).insulationRequired })}
                                                        className={`px-3 py-1 rounded-md text-[10px] font-bold uppercase transition-all ${(checkItem as WindowDetailItem).insulationRequired ? 'bg-primary/20 text-primary border border-primary/30' : 'bg-muted text-muted-foreground border border-border'}`}
                                                    >
                                                        {(checkItem as WindowDetailItem).insulationRequired ? 'DA' : 'NU'}
                                                    </button>
                                                </div>

                                                <div className="flex items-center justify-between p-2 rounded-md hover:bg-background/50 transition-colors">
                                                    <div className="flex items-center gap-2">
                                                        <div className={`w-2 h-2 rounded-full ${(checkItem as WindowDetailItem).structureRequired || (checkItem as WindowDetailItem).height! > 1200 ? 'bg-amber-500' : 'bg-muted-foreground/30'}`} />
                                                        <span className="text-xs font-medium">Structură Suport Necesară</span>
                                                    </div>
                                                    <button 
                                                        onClick={() => updateChecklistItem(phaseKey, key, { structureRequired: !(checkItem as WindowDetailItem).structureRequired })}
                                                        className={`px-3 py-1 rounded-md text-[10px] font-bold uppercase transition-all ${(checkItem as WindowDetailItem).structureRequired || (checkItem as WindowDetailItem).height! > 1200 ? 'bg-amber-500/20 text-amber-600 border border-amber-500/30' : 'bg-muted text-muted-foreground border border-border'}`}
                                                    >
                                                        {(checkItem as WindowDetailItem).structureRequired || (checkItem as WindowDetailItem).height! > 1200 ? 'DA' : 'NU'}
                                                    </button>
                                                </div>
                                            </div>

                                            {((checkItem as WindowDetailItem).height! > 1200 || (checkItem as WindowDetailItem).structureRequired) && (
                                                <div className="mt-2 p-3 bg-amber-500/5 border border-amber-500/10 rounded-md">
                                                    <p className="text-[10px] text-amber-600 leading-relaxed font-medium">
                                                        <span className="font-bold">NOTĂ TEHNICĂ:</span> Din cauza înălțimii mari, este obligatorie montarea unei structuri metalice de rigidizare conform P118. Sugerăm profile L 50x50x5 sau cadre de oțel rectangulare.
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    );
                })}
            </div>

            {/* Notes */}
            <div className="mt-6">
                <label className="block text-sm font-medium text-foreground mb-2">
                    Note și observații
                </label>
                <textarea
                    value={phaseNotes}
                    onChange={(e) => updatePhaseNotes(phaseKey, e.target.value)}
                    placeholder="Adaugă note pentru această fază..."
                    className="w-full h-24 px-4 py-3 rounded-xl border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
                />
            </div>
        </div>
    );
}

// Structure Phase Component (special handling)
function StructurePhaseContent() {
    const { currentRoom, updateStructure } = useRoomPrep();

    if (!currentRoom) return null;

    const { structure } = currentRoom;

    return (
        <div className="space-y-6">
            {/* Dimensions */}
            <div className="p-6 rounded-xl border border-border bg-card">
                <h3 className="text-lg font-semibold text-foreground mb-4">Dimensiuni cameră</h3>
                <div className="grid grid-cols-3 gap-4">
                    <div>
                        <label className="block text-sm text-muted-foreground mb-1">Lungime (m)</label>
                        <input
                            type="number"
                            value={structure.dimensions.length || ''}
                            onChange={(e) => updateStructure({
                                dimensions: { ...structure.dimensions, length: parseFloat(e.target.value) || 0 }
                            })}
                            className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                            placeholder="10"
                        />
                    </div>
                    <div>
                        <label className="block text-sm text-muted-foreground mb-1">Lățime (m)</label>
                        <input
                            type="number"
                            value={structure.dimensions.width || ''}
                            onChange={(e) => updateStructure({
                                dimensions: { ...structure.dimensions, width: parseFloat(e.target.value) || 0 }
                            })}
                            className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                            placeholder="8"
                        />
                    </div>
                    <div>
                        <label className="block text-sm text-muted-foreground mb-1">Înălțime (m)</label>
                        <input
                            type="number"
                            value={structure.dimensions.height || ''}
                            onChange={(e) => updateStructure({
                                dimensions: { ...structure.dimensions, height: parseFloat(e.target.value) || 0 }
                            })}
                            className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                            placeholder="3.5"
                        />
                    </div>
                </div>
                {structure.dimensions.length > 0 && structure.dimensions.width > 0 && (
                    <div className="mt-4 p-3 rounded-lg bg-muted/50">
                        <span className="text-sm text-muted-foreground">Suprafață: </span>
                        <span className="font-semibold text-foreground">
                            {(structure.dimensions.length * structure.dimensions.width).toFixed(1)} m²
                        </span>
                        {structure.dimensions.height > 0 && (
                            <>
                                <span className="text-sm text-muted-foreground ml-4">Volum: </span>
                                <span className="font-semibold text-foreground">
                                    {(structure.dimensions.length * structure.dimensions.width * structure.dimensions.height).toFixed(1)} m³
                                </span>
                            </>
                        )}
                    </div>
                )}
            </div>

            {/* Floor Load Capacity */}
            <div className="p-6 rounded-xl border border-border bg-card">
                <h3 className="text-lg font-semibold text-foreground mb-4">Capacitate planșeu</h3>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm text-muted-foreground mb-1">Sarcină maximă (kg/m²)</label>
                        <input
                            type="number"
                            value={structure.floorLoadCapacity || ''}
                            onChange={(e) => updateStructure({ floorLoadCapacity: parseFloat(e.target.value) || 0 })}
                            className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                            placeholder="1000"
                        />
                    </div>
                    <div>
                        <label className="block text-sm text-muted-foreground mb-1">Tip structură</label>
                        <select
                            value={structure.structureType}
                            onChange={(e) => updateStructure({ structureType: e.target.value as 'concrete' | 'steel' | 'mixed' | 'other' })}
                            className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                        >
                            <option value="concrete">Beton armat</option>
                            <option value="steel">Structură metalică</option>
                            <option value="mixed">Mixtă</option>
                            <option value="other">Altele</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Clear Heights */}
            <div className="p-6 rounded-xl border border-border bg-card">
                <h3 className="text-lg font-semibold text-foreground mb-4">Înălțimi libere</h3>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm text-muted-foreground mb-1">Deasupra pardoselii tehnice (m)</label>
                        <input
                            type="number"
                            step="0.1"
                            value={structure.clearHeightAboveFloor || ''}
                            onChange={(e) => updateStructure({ clearHeightAboveFloor: parseFloat(e.target.value) || 0 })}
                            className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                            placeholder="2.5"
                        />
                    </div>
                    <div>
                        <label className="block text-sm text-muted-foreground mb-1">Sub tavan tehnic (m)</label>
                        <input
                            type="number"
                            step="0.1"
                            value={structure.clearHeightBelowCeiling || ''}
                            onChange={(e) => updateStructure({ clearHeightBelowCeiling: parseFloat(e.target.value) || 0 })}
                            className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                            placeholder="0.5"
                        />
                    </div>
                </div>
            </div>

            {/* Notes */}
            <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                    Note și observații
                </label>
                <textarea
                    value={structure.notes}
                    onChange={(e) => updateStructure({ notes: e.target.value })}
                    placeholder="Adaugă note despre structura camerei..."
                    className="w-full h-24 px-4 py-3 rounded-xl border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
                />
            </div>
        </div>
    );
}

export default RoomPrepWizard;
