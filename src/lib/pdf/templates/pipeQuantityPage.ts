import { PdfData } from '../types';
import { PDFContext } from './SectionGenerator';
import { drawTable } from './tableDrawer';
import { calculatePurchaseSummary } from '../../calculations/purchase';

/**
 * PAGINA 2 - CANTITATE TEAVA
 * (ce teava intra in lucrare, pe material si diametru)
 */
export async function generatePipeQuantityPage(ctx: PDFContext, data: PdfData) {
    const { width, theme } = ctx;

    const purchase = calculatePurchaseSummary(
        data.segments,
        data.equipmentList,
        data.glycolPercentage,
        (data.fluidType as 'ethylene' | 'propylene' | 'water') || 'ethylene',
        data.safetyMargin,
        data.safetyMarginPercentage ?? 5,
        data.fittingItems ?? []
    );

    await ctx.checkSpace(240);

    // Titlu
    const title = 'CANTITATE TEAVA';
    const titleWidth = ctx.fontBold.widthOfTextAtSize(title, 16);
    ctx.currentPage.drawText(title, { x: (width - titleWidth) / 2, y: ctx.currentY, size: 16, font: ctx.fontBold, color: theme.primary });
    ctx.currentY -= 34;

    if (purchase.pipeLines.length === 0) {
        ctx.currentPage.drawText('Nu exista segmente de teava definite in proiect.', { x: 60, y: ctx.currentY, size: 10, font: ctx.fontRegular, color: theme.textLight });
        ctx.currentY -= 20;
        return;
    }

    // Tabel: DN | Material | Lungime (m) | Ø int (mm) | Volum (L)
    const headers = ['DN', 'Material / Standard', 'Lungime (m)', 'Volum (L)', 'Greutate (kg)'];
    const rows = purchase.pipeLines.map(l => [
        l.size,
        l.label,
        l.lengthM.toFixed(1),
        l.liters.toFixed(1),
        l.weightKg.toFixed(1),
    ]);
    rows.push([
        'TOTAL',
        `${purchase.pipeLines.length} marimi`,
        purchase.pipeTotalLengthM.toFixed(1),
        purchase.pipeVolumeL.toFixed(1),
        purchase.pipeTotalWeightKg.toFixed(1),
    ]);

    const colWidths = [(width - 120) * 0.12, (width - 120) * 0.38, (width - 120) * 0.16, (width - 120) * 0.16, (width - 120) * 0.18];
    await drawTable(ctx, {
        x: 60,
                headers,
        rows,
        colWidths,
        rowHeight: 22,
        align: ['center', 'left', 'right', 'right', 'right'],
    });

    ctx.currentY -= 26;

    // Echipamente (volum de apa in sistem)
    if (purchase.equipmentVolumeL > 0) {
        const eqText = `Volum apa echipamente: ${purchase.equipmentVolumeL.toFixed(0)} L`;
        ctx.currentPage.drawText(eqText, { x: 60, y: ctx.currentY, size: 10, font: ctx.fontBold, color: theme.text });
        ctx.currentY -= 18;
    }
}
