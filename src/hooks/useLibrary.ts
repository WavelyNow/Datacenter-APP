
import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/lib/supabase';

const CLOUD_DISABLED_MESSAGE = 'Cloud disabled — set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY env vars';

export interface LibraryItem<T> {
    id: string;
    type: 'equipment' | 'profile' | 'pipe';
    name: string;
    data: T;
    created_at: string;
    updated_at: string;
}

export function useLibrary<T>(type: 'equipment' | 'profile' | 'pipe') {
    const [items, setItems] = useState<LibraryItem<T>[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    // Sequence token: invalidates stale responses (successive fetches or unmount)
    const requestSeqRef = useRef(0);

    const fetchItems = useCallback(async () => {
        const seq = ++requestSeqRef.current;
        try {
            setLoading(true);
            if (!supabase) {
                throw new Error(CLOUD_DISABLED_MESSAGE);
            }
            const { data, error } = await supabase
                .from('library_items')
                .select('*')
                .eq('type', type)
                .order('name');

            if (seq !== requestSeqRef.current) return; // stale response, ignore
            if (error) throw error;
            setItems((data as unknown as LibraryItem<T>[]) || []);
        } catch (err: unknown) {
            if (seq !== requestSeqRef.current) return; // stale response, ignore
            console.error(`Error fetching library items (${type}):`, err instanceof Error ? err.message : JSON.stringify(err));
            setError(err instanceof Error ? err.message : 'Unknown error');
        } finally {
            if (seq === requestSeqRef.current) {
                setLoading(false);
            }
        }
    }, [type]);

    useEffect(() => {
        fetchItems();
        return () => {
            // Invalidate any in-flight request so it never updates state after unmount/re-run
            requestSeqRef.current += 1;
        };
    }, [fetchItems]);

    const addItem = async (name: string, data: T) => {
        try {
            if (!supabase) {
                throw new Error(CLOUD_DISABLED_MESSAGE);
            }
            const { data: newItem, error } = await supabase
                .from('library_items')
                .insert([
                    { type, name, data }
                ])
                .select()
                .single();

            if (error) throw error;

            // Optimistic update or refetch
            setItems(prev => [...prev, newItem as unknown as LibraryItem<T>]);
            return newItem;
        } catch (err: unknown) {
            console.error(`Error adding library item (${type}):`, err);
            throw err;
        }
    };

    const deleteItem = async (id: string) => {
        try {
            if (!supabase) {
                throw new Error(CLOUD_DISABLED_MESSAGE);
            }
            const { error } = await supabase
                .from('library_items')
                .delete()
                .eq('id', id);

            if (error) throw error;

            setItems(prev => prev.filter(item => item.id !== id));
        } catch (err: unknown) {
            console.error(`Error deleting library item (${type}):`, err);
            throw err;
        }
    };

    return {
        items,
        loading,
        error,
        addItem,
        deleteItem,
        refresh: fetchItems
    };
}
