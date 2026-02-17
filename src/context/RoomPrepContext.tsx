'use client';

import React, { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';
import {
    RoomPreparation,
    PhaseStatus,
    ItemStatus,
    ChecklistItem,
    createDefaultRoomPreparation,
    calculateCompletionPercentage,
    PHASE_CONFIG
} from '@/lib/room-preparation/types';

interface RoomPrepContextType {
    // Current room
    currentRoom: RoomPreparation | null;
    rooms: RoomPreparation[];

    // Room management
    createRoom: (name: string) => RoomPreparation;
    loadRoom: (id: string) => void;
    saveRoom: () => void;
    deleteRoom: (id: string) => void;

    // Phase management
    currentPhaseIndex: number;
    setCurrentPhaseIndex: (index: number) => void;
    nextPhase: () => void;
    prevPhase: () => void;

    // Item updates
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    updateChecklistItem: (phaseKey: string, itemKey: string, updates: Partial<ChecklistItem> & Record<string, any>) => void;
    toggleItemStatus: (phaseKey: string, itemKey: string) => void;
    setItemValue: (phaseKey: string, itemKey: string, value: string | number) => void;

    // Structure phase updates
    updateStructure: (updates: Partial<RoomPreparation['structure']>) => void;

    // Phase status
    updatePhaseStatus: (phaseKey: string, status: PhaseStatus) => void;

    // Notes
    updatePhaseNotes: (phaseKey: string, notes: string) => void;

    // Utilities
    getPhaseProgress: (phaseKey: string) => { completed: number; total: number; percentage: number };
    isPhaseComplete: (phaseKey: string) => boolean;
}

const RoomPrepContext = createContext<RoomPrepContextType | undefined>(undefined);

const STORAGE_KEY = 'datacenter_room_preparations';

export function RoomPrepProvider({ children }: { children: ReactNode }) {
    // Use lazy initialization to load from localStorage
    const [rooms, setRooms] = useState<RoomPreparation[]>(() => {
        if (typeof window === 'undefined') return [];
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored) {
                return JSON.parse(stored);
            }
        } catch (e) {
            console.warn('Failed to load room preparations:', e);
        }
        return [];
    });
    const [currentRoom, setCurrentRoom] = useState<RoomPreparation | null>(null);
    const [currentPhaseIndex, setCurrentPhaseIndex] = useState(0);

    // Save rooms to localStorage when changed
    useEffect(() => {
        if (rooms.length > 0) {
            try {
                localStorage.setItem(STORAGE_KEY, JSON.stringify(rooms));
            } catch (e) {
                console.warn('Failed to save room preparations:', e);
            }
        }
    }, [rooms]);

    // Create new room
    const createRoom = useCallback((name: string): RoomPreparation => {
        const newRoom = createDefaultRoomPreparation(name);
        setRooms(prev => [...prev, newRoom]);
        setCurrentRoom(newRoom);
        setCurrentPhaseIndex(0);
        return newRoom;
    }, []);

    // Load existing room
    const loadRoom = useCallback((id: string) => {
        const room = rooms.find(r => r.id === id);
        if (room) {
            setCurrentRoom(room);
            setCurrentPhaseIndex(0);
        }
    }, [rooms]);

    // Save current room
    const saveRoom = useCallback(() => {
        if (!currentRoom) return;

        const updatedRoom = {
            ...currentRoom,
            updatedAt: new Date().toISOString(),
            completionPercentage: calculateCompletionPercentage(currentRoom)
        };

        setRooms(prev => prev.map(r => r.id === updatedRoom.id ? updatedRoom : r));
        setCurrentRoom(updatedRoom);
    }, [currentRoom]);

    // Delete room
    const deleteRoom = useCallback((id: string) => {
        setRooms(prev => prev.filter(r => r.id !== id));
        if (currentRoom?.id === id) {
            setCurrentRoom(null);
        }
    }, [currentRoom]);

    // Navigation
    const nextPhase = useCallback(() => {
        if (currentPhaseIndex < PHASE_CONFIG.length - 1) {
            setCurrentPhaseIndex(prev => prev + 1);
        }
    }, [currentPhaseIndex]);

    const prevPhase = useCallback(() => {
        if (currentPhaseIndex > 0) {
            setCurrentPhaseIndex(prev => prev - 1);
        }
    }, [currentPhaseIndex]);

    // Update checklist item
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updateChecklistItem = useCallback((phaseKey: string, itemKey: string, updates: Partial<ChecklistItem> & Record<string, any>) => {
        if (!currentRoom) return;

        setCurrentRoom(prev => {
            if (!prev) return prev;

            const phase = prev[phaseKey as keyof RoomPreparation];
            if (typeof phase !== 'object' || !('items' in phase)) return prev;

            const items = phase.items as Record<string, ChecklistItem>;
            const item = items[itemKey];
            if (!item) return prev;

            return {
                ...prev,
                [phaseKey]: {
                    ...phase,
                    items: {
                        ...items,
                        [itemKey]: { ...item, ...updates }
                    }
                }
            };
        });
    }, [currentRoom]);

    // Toggle item completion
    const toggleItemStatus = useCallback((phaseKey: string, itemKey: string) => {
        if (!currentRoom) return;

        setCurrentRoom(prev => {
            if (!prev) return prev;

            const phase = prev[phaseKey as keyof RoomPreparation];
            if (typeof phase !== 'object' || !('items' in phase)) return prev;

            const items = phase.items as Record<string, ChecklistItem>;
            const item = items[itemKey];
            if (!item) return prev;

            const newStatus: ItemStatus = item.status === 'completed' ? 'pending' : 'completed';

            return {
                ...prev,
                [phaseKey]: {
                    ...phase,
                    items: {
                        ...items,
                        [itemKey]: { ...item, status: newStatus }
                    }
                }
            };
        });
    }, [currentRoom]);

    // Set item value
    const setItemValue = useCallback((phaseKey: string, itemKey: string, value: string | number) => {
        updateChecklistItem(phaseKey, itemKey, { value });
    }, [updateChecklistItem]);

    // Update structure phase
    const updateStructure = useCallback((updates: Partial<RoomPreparation['structure']>) => {
        if (!currentRoom) return;

        setCurrentRoom(prev => {
            if (!prev) return prev;
            return {
                ...prev,
                structure: {
                    ...prev.structure,
                    ...updates
                }
            };
        });
    }, [currentRoom]);

    // Update phase status
    const updatePhaseStatus = useCallback((phaseKey: string, status: PhaseStatus) => {
        if (!currentRoom) return;

        setCurrentRoom(prev => {
            if (!prev) return prev;

            const phase = prev[phaseKey as keyof RoomPreparation];
            if (typeof phase !== 'object' || !('status' in phase)) return prev;

            return {
                ...prev,
                [phaseKey]: {
                    ...phase,
                    status
                }
            };
        });
    }, [currentRoom]);

    // Update phase notes
    const updatePhaseNotes = useCallback((phaseKey: string, notes: string) => {
        if (!currentRoom) return;

        setCurrentRoom(prev => {
            if (!prev) return prev;

            const phase = prev[phaseKey as keyof RoomPreparation];
            if (typeof phase !== 'object' || !('notes' in phase)) return prev;

            return {
                ...prev,
                [phaseKey]: {
                    ...phase,
                    notes
                }
            };
        });
    }, [currentRoom]);

    // Get phase progress
    const getPhaseProgress = useCallback((phaseKey: string): { completed: number; total: number; percentage: number } => {
        if (!currentRoom) return { completed: 0, total: 0, percentage: 0 };

        if (phaseKey === 'structure') {
            const isComplete = currentRoom.structure.status === 'completed';
            return { completed: isComplete ? 1 : 0, total: 1, percentage: isComplete ? 100 : 0 };
        }

        const phase = currentRoom[phaseKey as keyof RoomPreparation];
        if (typeof phase !== 'object' || !('items' in phase)) {
            return { completed: 0, total: 0, percentage: 0 };
        }

        const items = Object.values(phase.items) as ChecklistItem[];
        const total = items.length;
        const completed = items.filter(item => item.status === 'completed' || item.status === 'not-applicable').length;
        const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

        return { completed, total, percentage };
    }, [currentRoom]);

    // Check if phase is complete
    const isPhaseComplete = useCallback((phaseKey: string): boolean => {
        const progress = getPhaseProgress(phaseKey);
        return progress.percentage === 100;
    }, [getPhaseProgress]);

    return (
        <RoomPrepContext.Provider value={{
            currentRoom,
            rooms,
            createRoom,
            loadRoom,
            saveRoom,
            deleteRoom,
            currentPhaseIndex,
            setCurrentPhaseIndex,
            nextPhase,
            prevPhase,
            updateChecklistItem,
            toggleItemStatus,
            setItemValue,
            updateStructure,
            updatePhaseStatus,
            updatePhaseNotes,
            getPhaseProgress,
            isPhaseComplete
        }}>
            {children}
        </RoomPrepContext.Provider>
    );
}

export function useRoomPrep() {
    const context = useContext(RoomPrepContext);
    if (!context) {
        throw new Error('useRoomPrep must be used within a RoomPrepProvider');
    }
    return context;
}
