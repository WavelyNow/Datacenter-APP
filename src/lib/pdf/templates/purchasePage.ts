import { PdfData } from '../types';
import { PDFContext } from './SectionGenerator';
import { drawTable } from './tableDrawer';
import { beginSection } from './common';
import { calculatePurchaseSummary } from '../../calculations/purchase';
import { sanitizePdfText } from '../utils';

const FITTING_LABELS_RO: Record<string, string> = {
    elbow_90_std: 'Cot 90° standard',
    elbow_90_lr: 'Cot 90° raza mare',
    elbow_45: 'Cot 45°',
    tee_branch: 'Teu (ramificatie)',
    tee_run: 'Teu (pasaj)',
    reducer: 'Reductie',
    valve_ball: 'Robinet bila',
    valve_butterfly: 'Vana fluture',
    valve_globe: 'Vana cu sertar (globe)',
    valve_gate: 'Vana sertar',
    check_swing: 'Clapeta sens (swing)',
    check_lift: 'Clapeta sens (lift)',
    valve_check_swing: 'Clapeta sens (swing)',
    valve_check_lift: 'Clapeta sens (lift)',
};

/**
 * PAGINA 3 — LISTA DE CUMPARAT
 * Fluid (teava + fittinguri din nr. + echipamente + marja) → TOTAL;
 * greutati estimative fara/cu fluid.
 */
export async function generatePurchasePage(ctx: PDFContext, data: PdfData) {
    const { width, theme, fontBold, fontRegular, currentPage } = ctx;
    const M = 50;
    const colW = width - M * 2;
    const boxH = 62;

    const purchase = calculatePurchaseSummary(
        data.segments,
        data.equipmentList,
        data.glycolPercentage,
        (data.fluidType as 'ethylene' | 'propylene' | 'water') || 'ethylene',
        data.safetyMargin,
        data.safetyMarginPercentage ?? 5,
        data.fittingItems ?? []
    );

    await beginSection(ctx, 'LISTA DE CUMPARAT', true); // pagina noua — raportul are mereu 3 pagini clare

    // ---------- 1. GLICOL ----------
    await ctx.checkSpace(40);
    currentPage.drawText('1. FLUID (GLICOL)', { x: M, y: ctx.currentY, size: 8, font: fontBold, color: theme.textLight });
    ctx.currentY -= 15;

    const fluidName = data.fluidType === 'propylene' ? 'Propilen Glicol' : data.fluidType === 'water' ? 'Apa pura' : 'Etilen Glicol';
    await drawTable(ctx, {
        x: M,
        headers: ['Component', 'Volum'],
        rows: [
            ['Teava (din diametrul interior)', `${purchase.pipeVolumeL.toFixed(1)} L`],
            [`Fittinguri (${purchase.fittingsTotalCount} buc — calculate din numar)`, `${purchase.fittingsVolumeL.toFixed(1)} L`],
            ['Apa echipamente', `${purchase.equipmentVolumeL.toFixed(1)} L`],
            [`Marja de siguranta (${purchase.marginPercent}%)`, `${purchase.marginL.toFixed(1)} L`],
        ],
        colWidths: [colW * 0.72, colW * 0.28],
        rowHeight: 21,
        showBorders: false,
        align: ['left', 'right'],
    });
    ctx.currentY -= 10;

    // ---------- TOTAL ----------
    await ctx.checkSpace(boxH + 40);
    const boxY = ctx.currentY - boxH;
    currentPage.drawRectangle({
        x: M, y: boxY, width: colW, height: boxH,
        color: theme.bgLight,
        borderColor: theme.primary,
        borderWidth: 1.2,
    });
    // Stanga: label + valoare mare
    currentPage.drawText('TOTAL DE CUMPARAT', { x: M + 16, y: boxY + boxH - 20, size: 8, font: fontBold, color: theme.textLight });
    currentPage.drawText(`${purchase.totalGlycolL.toFixed(0)} L`, { x: M + 16, y: boxY + 10, size: 24, font: fontBold, color: theme.primary });
    // Dreapta: detalii stivuite (nu mai existe coliziune)
    const rightX = M + colW * 0.52;
    const rightW = colW * 0.48 - 16;
    currentPage.drawText(sanitizePdfText(`${fluidName} ${data.glycolPercentage}%`), { x: rightX, y: boxY + boxH - 20, size: 9, font: fontBold, color: theme.text });
    currentPage.drawText(`${purchase.canisters10L.toFixed(1)} canistre de 10 L`, { x: rightX, y: boxY + boxH - 36, size: 9, font: fontRegular, color: theme.text });
    currentPage.drawText(`Greutate fluid ~${purchase.fluidWeightKg.toFixed(0)} kg`, { x: rightX, y: boxY + boxH - 50, size: 9, font: fontRegular, color: theme.textLight });

    ctx.currentY = boxY - 30;

    // ---------- 2. FITTINGURI (comanda de material) ----------
    if (purchase.fittingItems.length > 0) {
        await ctx.checkSpace(60);
        currentPage.drawText('2. FITTINGURI DE COMANDAT', { x: M, y: ctx.currentY, size: 8, font: fontBold, color: theme.textLight });
        ctx.currentY -= 15;
        await drawTable(ctx, {
            x: M,
            headers: ['DN', 'Tip', 'Cantitate'],
            rows: purchase.fittingItems.map(f => [
                f.size,
                FITTING_LABELS_RO[f.type] || f.type.replace(/_/g, ' '),
                `${f.quantity} buc`,
            ]),
            colWidths: [colW * 0.15, colW * 0.55, colW * 0.3],
            rowHeight: 21,
            align: ['center', 'left', 'right'],
        });
        ctx.currentY -= 12;
    }

    // ---------- 3. GREUTATI ESTIMATIVE ----------
    const emptyWeight = purchase.pipeTotalWeightKg + purchase.equipmentTotalWeightKg;
    const withFluidWeight = emptyWeight + purchase.fluidWeightKg;
    if (withFluidWeight > 0) {
        await ctx.checkSpace(90 + boxH);
        currentPage.drawText('3. GREUTATI ESTIMATIVE', { x: M, y: ctx.currentY, size: 8, font: fontBold, color: theme.textLight });
        ctx.currentY -= 15;
        await drawTable(ctx, {
            x: M,
            headers: ['Component', 'Greutate'],
            rows: [
                ['Teava (goala)', `${purchase.pipeTotalWeightKg.toFixed(1)} kg`],
                ['Echipamente (goale)', `${purchase.equipmentTotalWeightKg.toFixed(1)} kg`],
                [`Fluid (${purchase.totalGlycolL} L)`, `${purchase.fluidWeightKg.toFixed(1)} kg`],
            ],
            colWidths: [colW * 0.72, colW * 0.28],
            rowHeight: 21,
            showBorders: false,
            align: ['left', 'right'],
        });

        await ctx.checkSpace(boxH + 36);
        const boxY2 = ctx.currentY - boxH;
        currentPage.drawRectangle({
            x: M, y: boxY2, width: colW, height: boxH,
            color: theme.bgLight,
            borderColor: theme.text,
            borderWidth: 0.8,
        });
        const halfW = colW / 2;
        // Jumatati clare cu separator
        currentPage.drawLine({ start: { x: M + halfW, y: boxY2 + 8 }, end: { x: M + halfW, y: boxY2 + boxH - 8 }, thickness: 0.5, color: theme.border });
        currentPage.drawText('INSTALATIE FARA FLUID', { x: M + 16, y: boxY2 + boxH - 20, size: 7.5, font: fontBold, color: theme.textLight });
        currentPage.drawText(`${emptyWeight.toFixed(0)} kg`, { x: M + 16, y: boxY2 + 10, size: 19, font: fontBold, color: theme.text });
        currentPage.drawText('CU FLUID (IN FUNCTIUNE)', { x: M + halfW + 16, y: boxY2 + boxH - 20, size: 7.5, font: fontBold, color: theme.textLight });
        currentPage.drawText(`${withFluidWeight.toFixed(0)} kg`, { x: M + halfW + 16, y: boxY2 + 10, size: 19, font: fontBold, color: theme.primary });
        ctx.currentY = boxY2 - 20;
    }
}
