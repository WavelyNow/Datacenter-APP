
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';

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

    const fetchItems = useCallback(async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('library_items')
                .select('*')
                .eq('type', type)
                .order('name');

            if (error) throw error;
            setItems((data as unknown as LibraryItem<T>[]) || []);
        } catch (err: unknown) {
            console.error(`Error fetching library items (${type}):`, err instanceof Error ? err.message : JSON.stringify(err));
            setError(err instanceof Error ? err.message : 'Unknown error');
        } finally {
            setLoading(false);
        }
    }, [type]);

    useEffect(() => {
        fetchItems();
    }, [fetchItems]);

    const addItem = async (name: string, data: T) => {
        try {
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
