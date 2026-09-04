import { ProjectLoadData } from '@/lib/types';

export const LOCAL_PROJECT_INDEX_KEY = 'datacenter-app:projects:index:v1';
const projectKey = (id: string) => `datacenter-app:projects:data:v1:${id}`;

export interface LocalProjectMetadata {
    id: string;
    name: string;
    updatedAt: string;
}

export interface LocalProject extends LocalProjectMetadata {
    data: ProjectLoadData;
}

const storage = (): Storage | null => {
    try {
        return typeof globalThis.localStorage === 'undefined' ? null : globalThis.localStorage;
    } catch {
        return null;
    }
};

const readIndex = (store: Storage): LocalProjectMetadata[] | null => {
    let raw: string | null;
    try {
        raw = store.getItem(LOCAL_PROJECT_INDEX_KEY);
    } catch {
        return null;
    }
    if (!raw) return [];
    try {
        const value: unknown = JSON.parse(raw);
        if (!Array.isArray(value)) return null;
        return value.filter((item): item is LocalProjectMetadata => {
            if (!item || typeof item !== 'object') return false;
            const entry = item as Record<string, unknown>;
            return typeof entry.id === 'string' && typeof entry.name === 'string' && typeof entry.updatedAt === 'string';
        });
    } catch {
        return null;
    }
};

export function listLocalProjects(): LocalProjectMetadata[] {
    const store = storage();
    if (!store) return [];
    const index = readIndex(store);
    return index ? [...index].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)) : [];
}

export function readLocalProject(id: string): LocalProject | null {
    const store = storage();
    if (!store) return null;
    const raw = store.getItem(projectKey(id));
    if (!raw) return null;
    try {
        const value = JSON.parse(raw) as { data?: ProjectLoadData; name?: string; updatedAt?: string };
        if (!value || typeof value !== 'object' || !value.data || typeof value.name !== 'string' || typeof value.updatedAt !== 'string') {
            return null;
        }
        return { id, name: value.name, updatedAt: value.updatedAt, data: value.data };
    } catch {
        return null;
    }
}

export function saveLocalProject(id: string, name: string, data: ProjectLoadData, updatedAt = new Date().toISOString()): LocalProjectMetadata | null {
    const store = storage();
    if (!store) return null;
    const metadata = { id, name, updatedAt };
    const index = readIndex(store);
    if (!index) return null;
    try {
        store.setItem(projectKey(id), JSON.stringify({ name, updatedAt, data }));
        store.setItem(LOCAL_PROJECT_INDEX_KEY, JSON.stringify([...index.filter((item) => item.id !== id), metadata]));
        return metadata;
    } catch {
        return null;
    }
}

export function deleteLocalProject(id: string): boolean {
    const store = storage();
    if (!store) return false;
    const index = readIndex(store);
    if (!index) return false;
    try {
        store.removeItem(projectKey(id));
        store.setItem(LOCAL_PROJECT_INDEX_KEY, JSON.stringify(index.filter((item) => item.id !== id)));
        return true;
    } catch {
        return false;
    }
}
