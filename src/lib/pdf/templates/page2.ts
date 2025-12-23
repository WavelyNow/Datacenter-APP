import { PdfData } from '../types';
import { drawTable } from '@/lib/pdf/templates/tableDrawer';
import { getDetailedWeightReport } from '../../calculations';
import { PDFContext } from './SectionGenerator';

export async function generatePage2(
    ctx: PDFContext,
    data: PdfData
) {
    const { theme, width } = ctx;

    await ctx.checkSpace(150);

    // Smart Padding: If we are not at the top of a new page, add breathing room
    if (ctx.currentY < ctx.height - 100) {
        ctx.currentY -= 40;
    }

    // Section 3: Centralizator Echipamente
    ctx.currentPage.drawText('3. CENTRALIZATOR ECHIPAMENTE', {
        x: 50,
        y: ctx.currentY,
        size: 12,
        font: ctx.fontBold,
        color: theme.primary,
    });
    ctx.currentY -= 25;

    const reportItems = getDetailedWeightReport(data.segments, data.equipmentList, data.glycolPercentage);
    const equipItems = reportItems.filter(i => i.type === 'equipment');
    const pipeItems = reportItems.filter(i => i.type === 'pipe');

    if (equipItems.length > 0) {
        const equipRows = equipItems.map(item => [
            item.description,
            item.quantity,
            item.emptyWeight.toFixed(1),
            item.fluidWeight.toFixed(1),
            item.totalWeight.toFixed(1)
        ]);

        const subTotalEmpty = equipItems.reduce((acc, i) => acc + i.emptyWeight, 0);
        const subTotalFluid = equipItems.reduce((acc, i) => acc + i.fluidWeight, 0);

        equipRows.push([
            'SUBTOTAL ECHIPAMENTE',
            '-',
            subTotalEmpty.toFixed(1), // Should be ~12207.1 as per user example
            subTotalFluid.toFixed(1),
            (subTotalEmpty + subTotalFluid).toFixed(1)
        ]);

        ctx.currentY = await drawTable(ctx, {
            x: 50,
            headers: ['ECHIPAMENT', 'CANT.', 'GREUTATE GOL (KG)', 'GREUTATE FLUID (KG)', 'TOTAL (KG)'],
            rows: equipRows,
            colWidths: [180, 50, 90, 90, 90],
            align: ['left', 'center', 'right', 'right', 'right']
        });

        ctx.currentY -= 40;
    }

    // Section 4: Memorator Materiale (Conducte)
    if (pipeItems.length > 0) {
        await ctx.checkSpace(150);
        ctx.currentPage.drawText('4. MEMORATOR MATERIALE (CONDUCTE)', {
            x: 50,
            y: ctx.currentY,
            size: 12,
            font: ctx.fontBold,
            color: theme.primary,
        });

        ctx.currentY -= 25;

        // Simplify description for "Technical Report" look
        // We might want to split name and size if description is combined, or just leave as is.
        // description usually is "Teava Otel - DN100"

        const pipeRows = pipeItems.map(item => {
            // Try to parse dimensions if possible, or just use description
            return [
                item.description.split('-')[0].trim(), // Material Type
                item.description.split('-')[1]?.trim() || '-', // Size
                item.quantity,
                item.emptyWeight.toFixed(1),
                item.fluidWeight.toFixed(1)
            ];
        });

        // Calculate Totals for Summary
        const totalMatWeight = reportItems.reduce((acc, i) => acc + i.emptyWeight, 0);
        const totalFluidWeight = reportItems.reduce((acc, i) => acc + i.fluidWeight, 0);
        const totalSystemWeight = totalMatWeight + totalFluidWeight;

        ctx.currentY = await drawTable(ctx, {
            x: 50,
            headers: ['TIP ȚEAVĂ', 'DIMENSIUNE', 'LUNGIME (m)', 'GREUTATE MAT. (kg)', 'GREUTATE FL. (kg)'],
            rows: pipeRows,
            colWidths: [150, 80, 70, 100, 100],
            align: ['left', 'center', 'center', 'right', 'right']
        });

        ctx.currentY -= 40;

        // Final System Summary (Text Block as requested)
        await ctx.checkSpace(100);
        ctx.currentPage.drawText('REZUMAT SISTEM', { x: 50, y: ctx.currentY, size: 10, font: ctx.fontBold, color: theme.text });
        ctx.currentY -= 15;

        const summaryText1 = `Greutate Materiale: ${Math.round(totalMatWeight).toLocaleString('ro-RO')} kg`;
        const summaryText2 = `Greutate Fluid: ${Math.round(totalFluidWeight).toLocaleString('ro-RO')} kg`;
        const summaryText3 = `TOTAL GENERAL SISTEM: ${Math.round(totalSystemWeight).toLocaleString('ro-RO')} kg`;

        ctx.currentPage.drawText(summaryText1, { x: 50, y: ctx.currentY, size: 9, font: ctx.fontRegular, color: theme.text });
        ctx.currentY -= 12;
        ctx.currentPage.drawText(summaryText2, { x: 50, y: ctx.currentY, size: 9, font: ctx.fontRegular, color: theme.text });
        ctx.currentY -= 15;
        ctx.currentPage.drawText(summaryText3, { x: 50, y: ctx.currentY, size: 10, font: ctx.fontBold, color: theme.primary });

        ctx.currentY -= 40;
    }
}
