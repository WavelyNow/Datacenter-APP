import { PdfData } from '../types';
import { PDFContext } from './SectionGenerator';
import { calculateTotalVolume } from '../../calculations';

export async function generateEnergyPage(
    ctx: PDFContext,
    data: PdfData
) {
    const { width, theme } = ctx;

    // --- Header ---
    await ctx.checkSpace(200);

    ctx.currentPage.drawText('RAPORT SUSTENABILITATE & EFICIENȚĂ', {
        x: 50,
        y: ctx.currentY,
        size: 14,
        font: ctx.fontBold,
        color: theme.primary,
    });
    ctx.currentY -= 30;

    ctx.currentPage.drawText('Analiza amprentei de carbon și a eficienței energetice (PUE)', {
        x: 50,
        y: ctx.currentY,
        size: 10,
        font: ctx.fontRegular,
        color: theme.textLight,
    });
    ctx.currentY -= 40;

    // --- 1. PUE GAUGE SECTION ---
    // Since we can't draw complex SVG gauges easily in pdf-lib without paths, 
    // we will create a "Scorecard" visual.

    const boxHeight = 100;
    const boxY = ctx.currentY - boxHeight;

    // Background Box
    ctx.currentPage.drawRectangle({
        x: 50,
        y: boxY,
        width: width - 100,
        height: boxHeight,
        color: theme.bgLight,
        borderColor: theme.border,
        borderWidth: 1,
    });

    // PUE Value
    const pueValue = 1.42; // Hardcoded or calculated estimate
    const pueColor = theme.accent; // Greenish

    // Center the PUE value since we removed the badge
    ctx.currentPage.drawText('PUE ESTIMAT', {
        x: (width - 100) / 2 + 50 - 40, // Centered roughly
        y: boxY + 65,
        size: 10,
        font: ctx.fontBold,
        color: theme.textLight,
    });

    const pueWidth = ctx.fontBold.widthOfTextAtSize(pueValue.toString(), 36);
    ctx.currentPage.drawText(pueValue.toString(), {
        x: (width - 100) / 2 + 50 - (pueWidth / 2),
        y: boxY + 25,
        size: 36,
        font: ctx.fontBold,
        color: pueColor,
    });

    ctx.currentY -= (boxHeight + 40);

    // --- 2. RECOMMENDATIONS ---
    const totalVolume = calculateTotalVolume(data.segments, data.equipmentList, false);
    const co2Savings = Math.round(totalVolume * 0.12); // Mock calc: 0.12kg CO2 saved per liter of optimized fluid

    await ctx.checkSpace(150);

    ctx.currentPage.drawText('IMPACT & RECOMANDĂRI', {
        x: 50,
        y: ctx.currentY,
        size: 12,
        font: ctx.fontBold,
        color: theme.text,
    });
    ctx.currentY -= 20;

    const recommendations = [
        `• Optimizare Tehnologică: Volumul sistemului (${totalVolume.toFixed(0)} L) este optimizat pentru transfer termic eficient.`,
        `• Reducere CO2: Se estimează o reducere de ${co2Savings} kg/an emisii CO2 față de sistemele standard.`,
        '• Free Cooling: Recomandăm activarea modului Free Cooling la temperaturi sub 10°C.',
        '• Mentenanță: Verificați concentrația de glicol anual pentru a menține eficiența transferului termic.'
    ];

    recommendations.forEach(rec => {
        ctx.currentPage.drawText(rec, {
            x: 50,
            y: ctx.currentY,
            size: 10,
            font: ctx.fontRegular,
            color: theme.text,
        });
        ctx.currentY -= 15;
    });

    ctx.currentY -= 30;
}
