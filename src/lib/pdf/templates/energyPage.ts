import { PdfData } from '../types';
import { PDFContext } from './SectionGenerator';
import { calculateTotalVolume } from '../../calculations';
import { calculateEnergyMetrics } from '../../calculations/energy';

export async function generateEnergyPage(
    ctx: PDFContext,
    data: PdfData
) {
    const { width, theme } = ctx;

    // --- Header ---
    await ctx.checkSpace(200);

    ctx.currentPage.drawText('RAPORT SUSTENABILITATE & EFICIENTA', {
        x: 50,
        y: ctx.currentY,
        size: 14,
        font: ctx.fontBold,
        color: theme.primary,
    });
    ctx.currentY -= 30;

    ctx.currentPage.drawText('Analiza amprentei de carbon si a eficientei energetice (PUE)', {
        x: 50,
        y: ctx.currentY,
        size: 10,
        font: ctx.fontRegular,
        color: theme.textLight,
    });
    ctx.currentY -= 40;

    // --- 1. PUE GAUGE SECTION ---
    // Compute PUE from ACTUAL project equipment. Never print a hardcoded number.

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

    // Real calculation - no hardcoded values
    const metrics = calculateEnergyMetrics(data.equipmentList, data.projectDetails?.location ?? 'Bucuresti');
    const hasMetrics = metrics.totalFacilityPower > 0;
    const pueValue = hasMetrics ? metrics.pue : null;
    const pueLabel = hasMetrics
        ? (metrics.pueIsEstimate ? 'PUE ESTIMAT' : 'PUE CALCULAT')
        : 'PUE - N/A';

    const pueColor = pueValue === null
        ? theme.textLight
        : pueValue < 1.4 ? theme.accent : theme.text;

    // Center the PUE value since we removed the badge
    ctx.currentPage.drawText(pueLabel, {
        x: (width - 100) / 2 + 50 - 40, // Centered roughly
        y: boxY + 65,
        size: 10,
        font: ctx.fontBold,
        color: theme.textLight,
    });

    const pueString = pueValue === null ? '-' : pueValue.toFixed(2);
    const pueWidth = ctx.fontBold.widthOfTextAtSize(pueString, 36);
    ctx.currentPage.drawText(pueString, {
        x: (width - 100) / 2 + 50 - (pueWidth / 2),
        y: boxY + 25,
        size: 36,
        font: ctx.fontBold,
        color: pueColor,
    });

    if (pueValue === null) {
        const naNote = 'Nu exista echipamente introduse - PUE nu poate fi calculat.';
        const naWidth = ctx.fontRegular.widthOfTextAtSize(naNote, 8);
        ctx.currentPage.drawText(naNote, {
            x: (width - 100) / 2 + 50 - (naWidth / 2),
            y: boxY + 10,
            size: 8,
            font: ctx.fontRegular,
            color: theme.textLight,
        });
    }

    ctx.currentY -= (boxHeight + 40);

    // --- 2. RECOMMENDATIONS ---
    const totalVolume = calculateTotalVolume(data.segments, data.equipmentList, false);
    // CO₂ from REAL annual energy (load factor 80%, EU grid factor) - not a mock.
    const co2Tons = metrics.totalFacilityPower > 0 ? metrics.annualCO2Tons : null;

    await ctx.checkSpace(150);

    ctx.currentPage.drawText('IMPACT & RECOMANDARI', {
        x: 50,
        y: ctx.currentY,
        size: 12,
        font: ctx.fontBold,
        color: theme.text,
    });
    ctx.currentY -= 20;

    const recommendations = [
        `• Volumul sistemului: ${totalVolume.toFixed(0)} L (baza, fara marja).`,
        co2Tons !== null
            ? `• Amprenta CO₂ estimata: ~${(co2Tons * 1000).toFixed(0)} kg/an (la factor de incarcare 80%).`
            : '• Amprenta CO₂: nu se poate calcula - introduceti echipamente cu putere nominala.',
        '• Free Cooling: recomandam activarea modului Free Cooling la temperaturi sub 10°C.',
        '• Mentenanta: verificati concentratia de glicol anual pentru a mentine eficienta transferului termic.'
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
