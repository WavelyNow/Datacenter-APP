/**
 * Smoke test PDF — raportul de comandă se generează cu cele 3 pagini principale
 * (Site → Cantitate țeavă → Listă de cumpărat).
 */
import { generatePdf } from '@/lib/pdf/generatePdf';
import { PdfData } from '@/lib/pdf/types';
import { generatePurchasePage } from '@/lib/pdf/templates/purchasePage';
import { PDFContext } from '@/lib/pdf/templates/SectionGenerator';

const baseData: PdfData = {
    projectDetails: {
        projectName: 'DC-Site Bacău',
        projectNumber: '2026-042',
        designer: 'WavelyNow',
        beneficiary: 'Client Test',
        location: 'Bacău, RO',
        date: '2026-08-21',
        revision: 'A',
    },
    segments: [
        { id: 's1', material: 'steel_light', standard: 'EN 10255', size: 'DN50', length: 12 },
        { id: 's2', material: 'steel_light', standard: 'EN 10255', size: 'DN100', length: 6 },
    ],
    equipmentList: [{ id: 'e1', type: 'CRAH / CCU', name: 'CRAH 1', volume: 40, weight: 300 }],
    fluidType: 'propylene',
    glycolPercentage: 30,
    safetyMargin: true,
    safetyMarginPercentage: 5,
    supportConfig: {
        spacing: 2,
        mountingType: 'suspended',
        height: 1,
        pipesPerSupport: 1,
        insulationThickness: 0,
        insulationDensity: 0,
    },
    branding: { primaryColor: '#0071e3', accentColor: '#0a84ff', pdfTheme: 'modern' },
    fittingItems: [
        { id: 'f1', type: 'elbow_90_std', size: 'DN50', quantity: 4 },
        { id: 'f2', type: 'valve_ball', size: 'DN100', quantity: 2 },
    ],
};

describe('PDF generation (report de comandă)', () => {
    it('generates a valid PDF with content', async () => {
        const bytes = await generatePdf(baseData);
        expect(bytes.byteLength).toBeGreaterThan(1000);
        // magic header "%PDF"
        const head = String.fromCharCode(...bytes.slice(0, 5));
        expect(head).toBe('%PDF-');
    }, 30000);

    it('handles empty project without crashing', async () => {
        const empty: PdfData = { ...baseData, segments: [], equipmentList: [], fittingItems: [] };
        const bytes = await generatePdf(empty);
        expect(bytes.byteLength).toBeGreaterThan(500);
    }, 30000);

    it('draws a section on the page created by beginSection', async () => {
        const oldPage = {
            drawText: jest.fn(),
            drawRectangle: jest.fn(),
            drawLine: jest.fn(),
            getSize: () => ({ width: 595.28, height: 841.89 }),
        };
        const newPage = {
            drawText: jest.fn(),
            drawRectangle: jest.fn(),
            drawLine: jest.fn(),
            getSize: () => ({ width: 595.28, height: 841.89 }),
        };
        const font = { widthOfTextAtSize: jest.fn(() => 10) };
        const ctx = {
            currentPage: oldPage,
            currentY: 700,
            width: 595.28,
            height: 841.89,
            pageNumber: 1,
            fontRegular: font,
            fontBold: font,
            theme: {},
            drawFooter: jest.fn(),
            checkSpace: jest.fn(async () => undefined),
        } as unknown as PDFContext;
        ctx.addPage = jest.fn(async () => {
            ctx.currentPage = newPage as never;
            ctx.currentY = 757;
            ctx.pageNumber = 2;
        });

        await generatePurchasePage(ctx, baseData);

        expect(newPage.drawText).toHaveBeenCalledWith('1. FLUID (GLICOL)', expect.anything());
        expect(oldPage.drawText).not.toHaveBeenCalledWith('1. FLUID (GLICOL)', expect.anything());
    });
});
