import { parseProjectData, PROJECT_FILE_VERSION } from '@/lib/projectFile';

describe('project file contract', () => {
    it('accepts legacy data and the current version', () => {
        expect(parseProjectData({ segments: [], version: PROJECT_FILE_VERSION })).toEqual({
            segments: [],
            version: PROJECT_FILE_VERSION,
        });
        expect(parseProjectData({ equipmentList: [] })).toEqual({ equipmentList: [] });
    });

    it('rejects malformed and newer project documents', () => {
        expect(() => parseProjectData(null)).toThrow('obiect JSON');
        expect(() => parseProjectData({ segments: {} })).toThrow('segments');
        expect(() => parseProjectData({ version: PROJECT_FILE_VERSION + 1 })).toThrow('nesuportată');
    });
});
