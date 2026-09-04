import { ProjectLoadData } from '@/lib/types';

/** Increment when the project JSON shape changes incompatibly. */
export const PROJECT_FILE_VERSION = 1;
const MAX_PROJECT_FILE_BYTES = 25 * 1024 * 1024;

/**
 * Validate the small transport contract shared by file import and context import.
 * Field-level domain validation remains with the feature that consumes the data.
 */
export function parseProjectData(value: unknown): ProjectLoadData {
    if (!value || typeof value !== 'object' || Array.isArray(value)) {
        throw new Error('Fișierul proiectului trebuie să conțină un obiect JSON.');
    }

    const data = value as Record<string, unknown>;
    if (
        data.version !== undefined &&
        (typeof data.version !== 'number' || !Number.isInteger(data.version) || data.version < 1)
    ) {
        throw new Error('Versiunea fișierului proiectului este invalidă.');
    }
    if (typeof data.version === 'number' && data.version > PROJECT_FILE_VERSION) {
        throw new Error(`Fișierul folosește o versiune nesuportată (${data.version}).`);
    }
    if (data.segments !== undefined && !Array.isArray(data.segments)) {
        throw new Error('Câmpul „segments” trebuie să fie o listă.');
    }
    if (data.equipmentList !== undefined && !Array.isArray(data.equipmentList)) {
        throw new Error('Câmpul „equipmentList” trebuie să fie o listă.');
    }

    return data as ProjectLoadData;
}

export async function readProjectFile(file: File): Promise<ProjectLoadData> {
    if (file.size > MAX_PROJECT_FILE_BYTES) {
        throw new Error('Fișierul proiectului depășește limita de 25 MB.');
    }

    try {
        return parseProjectData(JSON.parse(await file.text()));
    } catch (error) {
        if (error instanceof SyntaxError) {
            throw new Error('Fișierul proiectului nu este JSON valid.');
        }
        throw error;
    }
}
