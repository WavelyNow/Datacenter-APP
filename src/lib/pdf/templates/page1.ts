import { PDFDocument, rgb } from 'pdf-lib';
import { PdfData } from '../types';
import { drawTable } from '@/lib/pdf/templates/tableDrawer';
import { calculateSystemWeight, calculatePipeVolume, calculateTotalVolume, getFluidDensity } from '../../calculations';
import { PDFContext } from './SectionGenerator';

export async function generatePage1(
    ctx: PDFContext,
    data: PdfData
) {
    const { width, theme } = ctx;

    // Title: "RAPORT FINAL: VOLUMETRIE & MATERIALE"
    const title = 'RAPORT FINAL: VOLUMETRIE & MATERIALE';
    const titleSize = 18;
    const titleWidth = ctx.fontBold.widthOfTextAtSize(title, titleSize);

    // 1. Title Page Block (Centered)
    ctx.currentPage.drawText(title, {
        x: (width - titleWidth) / 2,
        y: ctx.currentY,
        size: titleSize,
        font: ctx.fontBold,
        color: theme.primary,
    });

    ctx.currentY -= 30;

    const subTitle = `Nume Proiect: ${data.projectDetails.projectName}`;
    const subTitleWidth = ctx.fontBold.widthOfTextAtSize(subTitle, 12);
    ctx.currentPage.drawText(subTitle, {
        x: (width - subTitleWidth) / 2,
        y: ctx.currentY,
        size: 12,
        font: ctx.fontBold,
        color: theme.text,
    });

    ctx.currentY -= 20;

    const detailsText = `Proiectant: ${data.projectDetails.designer} | Beneficiar: ${data.projectDetails.beneficiary} | Locație: ${data.projectDetails.location}`;
    const detailsWidth = ctx.fontRegular.widthOfTextAtSize(detailsText, 10);
    ctx.currentPage.drawText(detailsText, {
        x: (width - detailsWidth) / 2,
        y: ctx.currentY,
        size: 10,
        font: ctx.fontRegular,
        color: theme.textLight,
    });

    ctx.currentY -= 15;

    const statusText = `Status: Revizia ${data.projectDetails.revision || 'A'} | Data Emiterii: ${new Date().toLocaleDateString('ro-RO')}`;
    const statusWidth = ctx.fontRegular.widthOfTextAtSize(statusText, 10);
    ctx.currentPage.drawText(statusText, {
        x: (width - statusWidth) / 2,
        y: ctx.currentY,
        size: 10,
        font: ctx.fontRegular,
        color: theme.textLight,
    });

    ctx.currentY -= 60; // Space before next section

    // 2. Specificații Tehnice Fluid Table
    if (data.options?.includeVolume !== false) {
        await ctx.checkSpace(160);

        // Header for Fluid Specs
        ctx.currentPage.drawText('SPECIFICAȚII TEHNICE FLUID', {
            x: 50,
            y: ctx.currentY,
            size: 12,
            font: ctx.fontBold,
            color: theme.primary,
        });
        ctx.currentY -= 25;

        const totalVolume = calculateTotalVolume(data.segments, data.equipmentList, false);
        const marginPct = data.safetyMargin ? (data.safetyMarginPercentage ?? 5) : 0;
        const bufferedVolume = totalVolume * (1 + (marginPct / 100));
        const toOrderVolume = Math.ceil(bufferedVolume / 50) * 50;
        const density = getFluidDensity(data.glycolPercentage);

        const fluidLabel = data.fluidType === 'propylene' ? `PropilenGlycol ${data.glycolPercentage}%` : `EtilenGlycol ${data.glycolPercentage}%`;

        // Table Data
        const fluidHeaders = ['TIP FLUID', 'DENSITATE', 'CAPACITATE SISTEM', 'CANTITATE DE COMANDAT'];
        const fluidRows = [[
            fluidLabel,
            `${density.toFixed(3)} kg/L`,
            `${totalVolume.toFixed(0)} L`,
            `${toOrderVolume.toLocaleString('ro-RO')} Litri` // (include rezervă ${marginPct}%)` -> Optional note can go below
        ]];

        ctx.currentY = await drawTable(ctx, {
            x: 50,
            headers: fluidHeaders,
            rows: fluidRows,
            colWidths: [140, 80, 100, 170],
            align: ['left', 'center', 'right', 'right']
        });

        // Note about margin
        ctx.currentPage.drawText(`*Cantitatea de comandat include o rezervă de tehnologică de ${marginPct}%.`, {
            x: 50,
            y: ctx.currentY - 10,
            size: 8,
            font: ctx.fontRegular,
            color: theme.textLight // theme.textLight is usually grey
        });

        ctx.currentY -= 40;
    }
    // underline and redundant project info removed per user request

    ctx.currentY -= 45;

    // --- SECTION 2: BILL OF QUANTITIES (BoQ) ---
    if (data.options?.includeBoQ !== false) {
        await ctx.checkSpace(150);

        // Futurist Section Header
        ctx.currentPage.drawText('CENTRALIZATOR MATERIALE (BoQ)', {
            x: 50,
            y: ctx.currentY,
            size: 12,
            font: ctx.fontBold,
            color: theme.text,
        });
        ctx.currentY -= 25;

        const materialSummary: Record<string, { desc: string, length: number }> = {};
        data.segments.forEach(seg => {
            if (!seg) return;
            const key = `${seg.material}-${seg.size}`;
            if (!materialSummary[key]) {
                let matName = seg.material;
                if (seg.material === 'steel_light') matName = 'Oțel (Serie Ușoară)';
                else if (seg.material === 'steel_heavy') matName = 'Oțel (Serie Grea)';
                else if (seg.material === 'stainless_304') matName = 'Inox 304';
                else if (seg.material === 'ppr_pn20') matName = 'PPR (PN20)';

                materialSummary[key] = {
                    desc: `Țeavă ${matName} - ${seg.size}`,
                    length: 0
                };
            }
            materialSummary[key].length += seg.length;
        });

        const tableData = Object.values(materialSummary).map((item, idx) => [
            (idx + 1).toString(),
            item.desc,
            `${item.length.toFixed(2)} m`
        ]);

        if (tableData.length > 0) {
            ctx.currentY = await drawTable(ctx, {
                x: 50,
                headers: ['NR.', 'DESCRIERE MATERIAL', 'CANTITATE'],
                rows: tableData,
                colWidths: [40, 360, 110], // NR, Item, Qty
                align: ['center', 'left', 'right']
            });
        } else {
            ctx.currentPage.drawText('Nu există date.', { x: 50, y: ctx.currentY, size: 10, font: ctx.fontRegular });
            ctx.currentY -= 20;
        }
    }
}
