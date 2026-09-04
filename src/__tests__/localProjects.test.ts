import {
    deleteLocalProject,
    listLocalProjects,
    readLocalProject,
    saveLocalProject,
} from '@/lib/localProjects';

const data = { projectDetails: { projectName: 'Test', projectNumber: '', designer: '', location: '', date: '', beneficiary: '', revision: '' } };

beforeEach(() => localStorage.clear());

describe('local projects', () => {
    it('lists projects by updatedAt', () => {
        saveLocalProject('old', 'Old', data, '2026-01-01T00:00:00.000Z');
        saveLocalProject('new', 'New', data, '2026-02-01T00:00:00.000Z');
        expect(listLocalProjects().map((project) => project.id)).toEqual(['new', 'old']);
    });

    it('saves and updates one indexed project', () => {
        saveLocalProject('p1', 'First', data, '2026-01-01T00:00:00.000Z');
        saveLocalProject('p1', 'Updated', data, '2026-02-01T00:00:00.000Z');
        expect(listLocalProjects()).toHaveLength(1);
        expect(listLocalProjects()[0].name).toBe('Updated');
    });

    it('reads and deletes a project', () => {
        saveLocalProject('p1', 'First', data, '2026-01-01T00:00:00.000Z');
        expect(readLocalProject('p1')?.data).toEqual(data);
        expect(deleteLocalProject('p1')).toBe(true);
        expect(readLocalProject('p1')).toBeNull();
    });

    it('does not delete a corrupt index', () => {
        localStorage.setItem('datacenter-app:projects:index:v1', '{bad');
        expect(listLocalProjects()).toEqual([]);
        expect(localStorage.getItem('datacenter-app:projects:index:v1')).toBe('{bad');
    });
});
