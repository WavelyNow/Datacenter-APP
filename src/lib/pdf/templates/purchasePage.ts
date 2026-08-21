import { PdfData } from '../types';
import { PDFContext } from './SectionGenerator';
import { drawTable } from './tableDrawer';
import { calculatePurchaseSummary } from '../../calculations/purchase';

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
};

/**
 * PAGINA 3 - LISTA DE CUMPARAT
 * (glicol cu pierderi fittinguri + marja, teava, fittinguri)
 */
export async function generatePurchasePage(ctx: PDFContext, data: PdfData) {
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

    await ctx.checkSpace(260);

    // Titlu
    const title = 'LISTA DE CUMPARAT';
    const titleWidth = ctx.fontBold.widthOfTextAtSize(title, 16);
    ctx.currentPage.drawText(title, { x: (width - titleWidth) / 2, y: ctx.currentY, size: 16, font: ctx.fontBold, color: theme.primary });
    ctx.currentY -= 34;

    // --- FLUID / GLICOL ---
    const fluidTitle = '1. Glicol - cantitatea de comandat';
    ctx.currentPage.drawText(fluidTitle, { x: 60, y: ctx.currentY, size: 12, font: ctx.fontBold, color: theme.text });
    ctx.currentY -= 20;

    const fluidName = data.fluidType === 'propylene' ? 'Propilen Glicol' : data.fluidType === 'water' ? 'Apa pura' : 'Etilen Glicol';
    const rows: [string, string][] = [
        ['Volum teava (calculat din Ø interior)', `${purchase.pipeVolumeL.toFixed(1)} L`],
        [`Pierderi fittinguri + umplere (+${purchase.fittingsAllowancePercent}%)`, `${purchase.fittingsAllowanceL.toFixed(1)} L`],
        ['Volum apa echipamente', `${purchase.equipmentVolumeL.toFixed(1)} L`],
        [`Marja siguranta (${purchase.marginPercent}%)`, `${purchase.marginL.toFixed(1)} L`],
    ];
    await drawTable(ctx, {
        x: 60,
                headers: ['', ''],
        rows,
        colWidths: [(width - 120) * 0.7, (width - 120) * 0.3],
        rowHeight: 20,
        showBorders: false,
    });
    ctx.currentY -= 10;

    // TOTAL glicol - evidentiat
    const totalLabel = `TOTAL DE CUMPARAT: ${purchase.totalGlycolL.toFixed(0)} L ${fluidName} (${data.glycolPercentage}%)`;
    const tlWidth = ctx.fontBold.widthOfTextAtSize(totalLabel, 14);
    ctx.currentPage.drawText(totalLabel, {
        x: 60,
                size: 14,
        font: ctx.fontBold,
        color: theme.primary,
    });
    ctx.currentY -= 16;

    if (purchase.canisters10L > 0) {
        const canText = `Aprox. ${purchase.canisters10L.toFixed(1)} canistre de 10 L - greutate fluid ~${purchase.fluidWeightKg.toFixed(0)} kg`;
        ctx.currentPage.drawText(canText, { x: 60, y: ctx.currentY, size: 10, font: ctx.fontRegular, color: theme.textLight });
        ctx.currentY -= 30;
    } else {
        ctx.currentY -= 12;
    }

    // --- TEAVA ---
    const pipeTitle = '2. Teava';
    ctx.currentPage.drawText(pipeTitle, { x: 60, y: ctx.currentY, size: 12, font: ctx.fontBold, color: theme.text });
    ctx.currentY -= 20;

    if (purchase.pipeLines.length > 0) {
        const pipeRows = purchase.pipeLines.map(l => [l.size, l.label, `${l.lengthM.toFixed(1)} m`, `${l.weightKg.toFixed(1)} kg`]);
        await drawTable(ctx, {
            x: 60,
                        headers: ['DN', 'Material', 'Lungime', 'Greutate'],
            rows: pipeRows,
            colWidths: [(width - 120) * 0.12, (width - 120) * 0.44, (width - 120) * 0.22, (width - 120) * 0.22],
            rowHeight: 20,
            align: ['center', 'left', 'right', 'right'],
        });
        ctx.currentY -= 26;
    }

    // --- FITTINGURI ---
    if (purchase.fittingItems.length > 0) {
        const fitTitle = '3. Fittinguri (vane, coturi, teuri)';
        ctx.currentPage.drawText(fitTitle, { x: 60, y: ctx.currentY, size: 12, font: ctx.fontBold, color: theme.text });
        ctx.currentY -= 20;

        const fitRows = purchase.fittingItems.map(f => [
            f.size,
            FITTING_LABELS_RO[f.type] || f.type,
            `${f.quantity} buc`,
        ]);
        fitRows.push(['', 'TOTAL', `${purchase.fittingItems.reduce((s, f) => s + f.quantity, 0)} buc`]);
        await drawTable(ctx, {
            x: 60,
                        headers: ['DN', 'Tip', 'Cantitate'],
            rows: fitRows,
            colWidths: [(width - 120) * 0.15, (width - 120) * 0.55, (width - 120) * 0.3],
            rowHeight: 20,
            align: ['center', 'left', 'right'],
        });
        ctx.currentY -= 26;
    } else {
        const hint = 'Sugestie: definiti fittingurile (vane, coturi, teuri) in Hidraulica -> Pierderi Locale, pentru a le include in comanda.';
        ctx.currentPage.drawText(hint, { x: 60, y: ctx.currentY, size: 9, font: ctx.fontRegular, color: theme.textLight });
        ctx.currentY -= 20;
    }
}
