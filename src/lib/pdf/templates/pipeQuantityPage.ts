import { PdfData } from '../types';
import { PDFContext } from './SectionGenerator';
import { drawTable } from './tableDrawer';
import { beginSection } from './common';
import { calculatePurchaseSummary } from '../../calculations/purchase';

/**
 * PAGINA 2 — CANTITATE TEAVA
 */
export async function generatePipeQuantityPage(ctx: PDFContext, data: PdfData) {
    const { width, theme, fontBold, fontRegular, currentPage } = ctx;
    const M = 50;
    const colW = width - M * 2;

    const purchase = calculatePurchaseSummary(
        data.segments,
        data.equipmentList,
        data.glycolPercentage,
        (data.fluidType as 'ethylene' | 'propylene' | 'water') || 'ethylene',
        data.safetyMargin,
        data.safetyMarginPercentage ?? 5,
        data.fittingItems ?? [],
        data.fittingsAllowancePercent ?? 5
    );

    await beginSection(ctx, 'CANTITATE DE TEAVA');

    if (purchase.pipeLines.length === 0) {
        currentPage.drawText('Nu exista segmente de teava definite in proiect.', { x: M, y: ctx.currentY, size: 10, font: fontRegular, color: theme.textLight });
        ctx.currentY -= 20;
        return;
    }

    await drawTable(ctx, {
        x: M,
        headers: ['DN', 'Material', 'Lungime (m)', 'Volum (L)', 'Greutate (kg)'],
        rows: purchase.pipeLines.map(l => [
            l.size,
            l.label,
            l.lengthM.toFixed(1),
            l.liters.toFixed(1),
            l.weightKg.toFixed(1),
        ]).concat([
            ['TOTAL', `${purchase.pipeLines.length} dim.`, purchase.pipeTotalLengthM.toFixed(1), purchase.pipeVolumeL.toFixed(1), purchase.pipeTotalWeightKg.toFixed(1)],
        ]),
        colWidths: [colW * 0.12, colW * 0.4, colW * 0.16, colW * 0.16, colW * 0.16],
        rowHeight: 21,
        align: ['center', 'left', 'right', 'right', 'right'],
    });

    await ctx.checkSpace(60);
    if (purchase.equipmentVolumeL > 0) {
        currentPage.drawText(`Volum apa echipamente: ${purchase.equipmentVolumeL.toFixed(0)} L`, {
            x: M, y: ctx.currentY, size: 10, font: fontBold, color: theme.text,
        });
        ctx.currentY -= 16;
    }

    currentPage.drawText(
        `Volumul tevii este calculat din diametrul INTERIOR real (standardele verificate). Pierderi fittinguri: +${purchase.fittingsAllowancePercent}% din acest volum (vezi pagina urmatoare).`,
        { x: M, y: ctx.currentY, size: 8.5, font: fontRegular, color: theme.textLight }
    );
    ctx.currentY -= 18;
}
