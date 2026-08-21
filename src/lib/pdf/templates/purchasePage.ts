import { PdfData } from '../types';
import { PDFContext } from './SectionGenerator';
import { drawTable } from './tableDrawer';
import { drawSectionTitle } from './common';
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
 * PAGINA 3 — LISTA DE CUMPARAT
 * (glicol cu pierderi fittinguri + marja, teava, fittinguri — clar si premium)
 */
export async function generatePurchasePage(ctx: PDFContext, data: PdfData) {
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

    await ctx.checkSpace(300);
    ctx.currentY = drawSectionTitle(currentPage, fontBold, M, ctx.currentY, 'LISTA DE CUMPARAT', theme);
    ctx.currentY -= 6;

    // --- 1. GLICOL ---
    currentPage.drawText('1. FLUID (GLICOL)', { x: M, y: ctx.currentY, size: 8, font: fontBold, color: theme.textLight });
    ctx.currentY -= 16;

    const fluidName = data.fluidType === 'propylene' ? 'Propilen Glicol' : data.fluidType === 'water' ? 'Apa pura' : 'Etilen Glicol';
    const breakdown: [string, string][] = [
        ['Volum teava (din diametrul interior)', `${purchase.pipeVolumeL.toFixed(1)} L`],
        [`Pierderi fittinguri + umplere (${purchase.fittingsAllowancePercent}% din TEAVA)`, `${purchase.fittingsAllowanceL.toFixed(1)} L`],
        ['Volum apa echipamente', `${purchase.equipmentVolumeL.toFixed(1)} L`],
        [`Marja de siguranta (${purchase.marginPercent}%)`, `${purchase.marginL.toFixed(1)} L`],
    ];
    await drawTable(ctx, {
        x: M,
        headers: ['', ''],
        rows: breakdown,
        colWidths: [colW * 0.68, colW * 0.32],
        rowHeight: 21,
        showBorders: false,
        align: ['left', 'right'],
    });
    ctx.currentY -= 12;

    // TOTAL — casetă evidențiată
    const boxH = 44;
    const boxY = ctx.currentY - boxH;
    currentPage.drawRectangle({
        x: M, y: boxY, width: colW, height: boxH,
        color: theme.bgLight,
        borderColor: theme.primary,
        borderWidth: 1,
    });
    currentPage.drawText('TOTAL DE CUMPARAT', { x: M + 14, y: boxY + boxH - 16, size: 8, font: fontBold, color: theme.textLight });
    const totalText = `${purchase.totalGlycolL.toFixed(0)} L`;
    currentPage.drawText(totalText, { x: M + 14, y: boxY + 10, size: 20, font: fontBold, color: theme.primary });
    const subText = `${fluidName} ${data.glycolPercentage}%  ·  ${purchase.canisters10L.toFixed(1)} canistre de 10 L  ·  ~${purchase.fluidWeightKg.toFixed(0)} kg`;
    const subW = fontRegular.widthOfTextAtSize(subText, 9);
    currentPage.drawText(subText, { x: M + colW - subW - 14, y: boxY + 26, size: 9, font: fontRegular, color: theme.text });

    ctx.currentY = boxY - 26;

    // --- 2. TEAVA ---
    if (purchase.pipeLines.length > 0) {
        currentPage.drawText('2. TEAVA', { x: M, y: ctx.currentY, size: 8, font: fontBold, color: theme.textLight });
        ctx.currentY -= 16;
        await drawTable(ctx, {
            x: M,
            headers: ['DN', 'Material', 'Lungime (m)', 'Greutate (kg)'],
            rows: purchase.pipeLines.map(l => [l.size, l.label, l.lengthM.toFixed(1), l.weightKg.toFixed(1)]),
            colWidths: [colW * 0.12, colW * 0.46, colW * 0.21, colW * 0.21],
            rowHeight: 21,
            align: ['center', 'left', 'right', 'right'],
        });
        ctx.currentY -= 24;
    }

    // --- 3. FITTINGURI ---
    if (purchase.fittingItems.length > 0) {
        currentPage.drawText('3. FITTINGURI (VANE, COTURI, TEURI)', { x: M, y: ctx.currentY, size: 8, font: fontBold, color: theme.textLight });
        ctx.currentY -= 16;
        await drawTable(ctx, {
            x: M,
            headers: ['DN', 'Tip', 'Cantitate'],
            rows: purchase.fittingItems.map(f => [
                f.size,
                FITTING_LABELS_RO[f.type] || f.type,
                `${f.quantity} buc`,
            ]),
            colWidths: [colW * 0.15, colW * 0.55, colW * 0.3],
            rowHeight: 21,
            align: ['center', 'left', 'right'],
        });
        ctx.currentY -= 22;
    } else {
        currentPage.drawText(
            'Sugestie: definiti vanele/coturile/teurile in Hidraulica > Pierderi Locale pentru a le include in comanda.',
            { x: M, y: ctx.currentY, size: 9, font: fontRegular, color: theme.textLight }
        );
        ctx.currentY -= 18;
    }

    // --- 4. GREUTATI ESTIMATIVE ---
    const emptyWeight = purchase.pipeTotalWeightKg + purchase.equipmentTotalWeightKg;
    const withFluidWeight = emptyWeight + purchase.fluidWeightKg;
    if (withFluidWeight > 0) {
        currentPage.drawText('4. GREUTATI ESTIMATIVE', { x: M, y: ctx.currentY, size: 8, font: fontBold, color: theme.textLight });
        ctx.currentY -= 16;
        await drawTable(ctx, {
            x: M,
            headers: ['Component', 'Greutate'],
            rows: [
                ['Teava (goala)', `${purchase.pipeTotalWeightKg.toFixed(1)} kg`],
                ['Echipamente (goale)', `${purchase.equipmentTotalWeightKg.toFixed(1)} kg`],
                [`Fluid (${purchase.totalGlycolL} L ${fluidName} ${data.glycolPercentage}%)`, `${purchase.fluidWeightKg.toFixed(1)} kg`],
            ],
            colWidths: [colW * 0.68, colW * 0.32],
            rowHeight: 21,
            showBorders: false,
            align: ['left', 'right'],
        });
        ctx.currentY -= 8;
        const boxH2 = 44;
        const boxY2 = ctx.currentY - boxH2;
        currentPage.drawRectangle({
            x: M, y: boxY2, width: colW, height: boxH2,
            color: theme.bgLight,
            borderColor: theme.text,
            borderWidth: 0.8,
        });
        currentPage.drawText('INSTALATIE FARA FLUID', { x: M + 14, y: boxY2 + boxH2 - 15, size: 7.5, font: fontBold, color: theme.textLight });
        currentPage.drawText(`${emptyWeight.toFixed(0)} kg`, { x: M + 14, y: boxY2 + 8, size: 17, font: fontBold, color: theme.text });
        currentPage.drawText('INSTALATIE CU FLUID (IN FUNCTIUNE)', { x: M + colW * 0.55 + 14, y: boxY2 + boxH2 - 15, size: 7.5, font: fontBold, color: theme.textLight });
        const wText = `${withFluidWeight.toFixed(0)} kg`;
        currentPage.drawText(wText, { x: M + colW * 0.55 + 14, y: boxY2 + 8, size: 17, font: fontBold, color: theme.primary });
        ctx.currentY = boxY2 - 20;
    }
}
