import { PdfData } from '../types';
import { PDFContext } from './SectionGenerator';
import { drawTable } from './tableDrawer';
import { beginSection } from './common';
import { calculatePurchaseSummary } from '../../calculations/purchase';
import { PIPE_STANDARDS } from '../../pipeStandards';
import { sanitizePdfText } from '../utils';

/** ID interior real (mm) pentru desenul schemei — cauta in toate standardele. */
function resolveIdForPrint(size: string): number {
    for (const std of Object.values(PIPE_STANDARDS)) {
        const dim = std.dimensions.find(d => d.dn === size);
        if (dim && dim.id) return dim.id;
    }
    const num = parseInt(size.replace(/\D+/g, ''), 10);
    return num > 0 ? Math.max(10, num - 6) : 20;
}

/**
 * PAGINA 2 — CANTITATE TEAVA & FITTINGURI
 * (ce intra in lucrare — teava pe DN + fittingurile cu cantitati)
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
        data.fittingItems ?? []
    );

    await beginSection(ctx, 'CANTITATE DE TEAVA');

    if (purchase.pipeLines.length === 0) {
        currentPage.drawText('Nu exista segmente de teava definite in proiect.', { x: M, y: ctx.currentY, size: 10, font: fontRegular, color: theme.textLight });
        ctx.currentY -= 20;
        return;
    }

    // Tabel teava, cu randul TOTAL evidentiat (fill)
    const rows = purchase.pipeLines.map(l => [
        l.size, l.label, l.lengthM.toFixed(1), l.liters.toFixed(1), l.weightKg.toFixed(1),
    ]).concat([
        ['TOTAL', `${purchase.pipeLines.length} dim.`, purchase.pipeTotalLengthM.toFixed(1), purchase.pipeVolumeL.toFixed(1), purchase.pipeTotalWeightKg.toFixed(1)],
    ]);
    await drawTable(ctx, {
        x: M,
        headers: ['DN', 'Material', 'Lungime (m)', 'Volum (L)', 'Greutate (kg)'],
        rows: rows.slice(0, -1),
        colWidths: [colW * 0.12, colW * 0.4, colW * 0.16, colW * 0.16, colW * 0.16],
        rowHeight: 21,
        align: ['center', 'left', 'right', 'right', 'right'],
    });
    await ctx.checkSpace(40);
    // Randul TOTAL — fundal accent + bold
    const totalRow = rows[rows.length - 1];
    const startY = ctx.currentY;
    const rowH = 22;
    currentPage.drawRectangle({ x: M, y: startY - rowH, width: colW, height: rowH, color: theme.bgLight });
    let tx = M;
    totalRow.forEach((cell, i) => {
        const w = [colW * 0.12, colW * 0.4, colW * 0.16, colW * 0.16, colW * 0.16][i];
        const textW = fontBold.widthOfTextAtSize(cell, 9);
        const isNum = i >= 2;
        const cx = i === 0 ? tx + (w - textW) / 2 : isNum ? tx + w - textW - 6 : tx + 6;
        currentPage.drawText(sanitizePdfText(cell), { x: cx, y: startY - rowH / 2 - 4.5, size: 9, font: fontBold, color: theme.primary });
        tx += w;
    });
    currentPage.drawLine({ start: { x: M, y: startY - rowH }, end: { x: M + colW, y: startY - rowH }, thickness: 0.6, color: theme.border });
    ctx.currentY = startY - rowH - 4;

    // Fittinguri (dacă există) — cantități trecute de utilizator
    if (purchase.fittingItems.length > 0) {
        await ctx.checkSpace(70);
        currentPage.drawText('FITTINGURI (CANTITATI INTRODUSE)', { x: M, y: ctx.currentY, size: 8, font: fontBold, color: theme.textLight });
        ctx.currentY -= 15;
        await drawTable(ctx, {
            x: M,
            headers: ['DN', 'Tip', 'Bucati'],
            rows: purchase.fittingItems.map(f => [f.size, f.type.replace(/_/g, ' '), `${f.quantity}`]),
            colWidths: [colW * 0.15, colW * 0.55, colW * 0.3],
            rowHeight: 21,
            align: ['center', 'left', 'right'],
        });
        ctx.currentY -= 8;
        await ctx.checkSpace(30);
        currentPage.drawText(
            `Volumul acestor fittinguri (calculate din diametrul real): +${purchase.fittingsVolumeL.toFixed(1)} L`,
            { x: M, y: ctx.currentY, size: 9, font: fontBold, color: theme.text }
        );
        ctx.currentY -= 16;
    } else {
        await ctx.checkSpace(30);
        currentPage.drawText(
            'Sugestie: treceti coturile/teurile/vanele in tabelul de teava (coloana Fittinguri) — volumul lor se calculeaza automat.',
            { x: M, y: ctx.currentY, size: 8.5, font: fontRegular, color: theme.textLight }
        );
        ctx.currentY -= 16;
    }

    // ---------- SCHEMA SISTEM (desenata live din segmente) ----------
    if (purchase.pipeLines.length > 0) {
        await ctx.checkSpace(110);
        currentPage.drawText('SCHEMA SISTEM', { x: M, y: ctx.currentY, size: 8, font: fontBold, color: theme.textLight });
        ctx.currentY -= 14;

        const schH = 54;
        const schY = ctx.currentY - schH;
        const schX0 = M;
        const schX1 = M + colW;
        const scaleLen = colW / Math.max(purchase.pipeTotalLengthM, 1);

        // linia de baza
        currentPage.drawLine({ start: { x: schX0, y: schY }, end: { x: schX1, y: schY }, thickness: 0.4, color: theme.border });

        let cx = schX0;
        purchase.pipeLines.forEach((l) => {
            const idMm = resolveIdForPrint(l.size);
            const thickness = Math.max(1.5, Math.min(8, idMm / 25));
            const w = Math.max(14, l.lengthM * scaleLen);
            const segX1 = Math.min(cx + w, schX1 - 1);

            currentPage.drawLine({
                start: { x: cx, y: schY }, end: { x: segX1, y: schY },
                thickness, color: theme.primary,
            });
            // Eticheta DN deasupra, lungimea dedesubt
            currentPage.drawText(l.size + (w > 70 ? ` · ${l.lengthM.toFixed(1)} m` : ''), {
                x: cx + (segX1 - cx) / 2 - fontRegular.widthOfTextAtSize(l.size, 7.5) / 2,
                y: schY + thickness / 2 + 7, size: 7.5, font: fontBold, color: theme.text,
            });
            // nod intre segmente
            currentPage.drawCircle({ x: cx, y: schY, size: 2.4, color: theme.bgLight, borderColor: theme.primary, borderWidth: 0.8 });
            cx = segX1;
        });
        currentPage.drawCircle({ x: cx, y: schY, size: 2.4, color: theme.bgLight, borderColor: theme.primary, borderWidth: 0.8 });
        ctx.currentY = schY - 18;
    }

    await ctx.checkSpace(30);
    if (purchase.equipmentVolumeL > 0) {
        currentPage.drawText(`Volum apa echipamente: ${purchase.equipmentVolumeL.toFixed(0)} L`, {
            x: M, y: ctx.currentY, size: 10, font: fontBold, color: theme.text,
        });
        ctx.currentY -= 14;
    }
    currentPage.drawText(
        'Volumul tevii este calculat din diametrul INTERIOR real (standardele verificate).',
        { x: M, y: ctx.currentY, size: 8, font: fontRegular, color: theme.textLight }
    );
    ctx.currentY -= 14;
}


