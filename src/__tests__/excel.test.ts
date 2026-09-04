import { generateExcelReport } from '@/lib/excel/generateExcel';

const data = {
    projectDetails: {
        projectName: 'Test Excel',
        projectNumber: 'EX-001',
        designer: 'Test',
        location: 'București',
        date: '2026-09-04',
        beneficiary: 'Client',
        revision: 'A',
    },
    segments: [
        { id: 's1', material: 'steel_light' as const, standard: 'EN 10255', size: 'DN50', length: 10 },
    ],
    equipmentList: [],
    fluidType: 'ethylene',
    glycolPercentage: 30,
    safetyMargin: false,
    safetyMarginPercentage: 0,
    fittingItems: [],
    supportConfig: {
        spacing: 2,
        mountingType: 'suspended' as const,
        height: 1,
        pipesPerSupport: 1,
        insulationThickness: 0,
        insulationDensity: 0,
        addLeftConsole: false,
        addRightConsole: false,
        addUpperRail: false,
    },
    branding: { primaryColor: '#0071e3', accentColor: '#0a84ff' },
};

describe('Excel glycol calculation export', () => {
    beforeAll(() => {
        Object.defineProperty(window.URL, 'createObjectURL', {
            configurable: true,
            value: jest.fn(() => 'blob:excel-test'),
        });
        Object.defineProperty(window.URL, 'revokeObjectURL', {
            configurable: true,
            value: jest.fn(),
        });
        jest.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => undefined);
    });

    it('includes auditable pipe formulas and the reconciled total', async () => {
        const workbook = await generateExcelReport(data);
        const sheet = workbook.getWorksheet('Calcul glicol');

        expect(sheet).toBeDefined();
        expect(workbook.worksheets.map(ws => ws.name)).toEqual([
            'Sumar', 'Calcul glicol', 'Listă cantități', 'Echipamente', 'Configurație'
        ]);

        const volume = sheet!.getCell('H8').value as { formula: string; result: number };
        const pureGlycol = sheet!.getCell('J8').value as { formula: string; result: number };
        const total = sheet!.getCell('C21').value as { formula: string; result: number };

        expect(volume.formula).toBe('PI()/4*(G8/1000)^2*F8*1000');
        expect(volume.result).toBeGreaterThan(23);
        expect(pureGlycol.formula).toBe('H8*$F$5/100');
        expect(pureGlycol.result).toBeCloseTo(volume.result * 0.3, 6);
        expect(total.formula).toBe('ROUNDUP(C20/10,0)*10');
        expect(total.result).toBe(30);
    });
});
