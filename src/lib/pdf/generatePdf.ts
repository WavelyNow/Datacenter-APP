
// import puppeteer from 'puppeteer'; // Moved to dynamic import
import { PdfData, ReportSummary } from './types';
import { pdfStyles } from './templates/styles';
import { generatePage1 } from './templates/page1';
import { generatePage2 } from './templates/page2';
import { generatePage3 } from './templates/page3';
import {
    calculateTotalVolume,
    calculateGlycolVolume,
    calculateWaterVolume,
    calculateSystemWeight
} from '@/lib/calculations';

// Re-implementing a simple helper if calculateTotalVolume is complex to import or returns different shape
const calculateSummary = (data: PdfData): ReportSummary => {
    const { segments, equipmentList, glycolPercentage, safetyMargin } = data;

    // 1. Calculate Total Volume (Litres)
    // calculateTotalVolume(segments, equipmentList, safetyMargin) -> returns number
    const totalVolume = calculateTotalVolume(segments, equipmentList, safetyMargin);

    // 2. Calculate Glycol & Water Volumes
    const glycolVol = calculateGlycolVolume(totalVolume, glycolPercentage);
    const waterVol = calculateWaterVolume(totalVolume, glycolPercentage);

    // 3. Calculate Weight
    // calculateSystemWeight(segments, totalVolume) -> returns { emptyWeight, fluidWeight, totalWeight }
    // Note: calculateSystemWeight in calculations.ts currently only considers pipes for empty weight + fluid weight.
    // It does NOT include equipment weight in its return structure explicitly if we look at the implementation in step 252?
    // Let's re-read step 252.
    // calculateSystemWeight only takes segments and totalVolume.
    // It returns { emptyWeight, fluidWeight, totalWeight }.
    // BUT! getDetailedWeightReport DOES include equipment.
    // Let's use getDetailedWeightReport to be consistent with the detailed page.
    // actually, let's just use the helpers we have for now to avoid complexity or importing too much.
    // Wait, if I use calculateSystemWeight from calculations.ts, it might miss equipment weights if the implementation there is only for pipes?
    // IN step 252: calculateSystemWeight iterates segments. It does NOT iterate equipment.
    // So we need to add equipment weight manually here or update calculations.ts.
    // Use getDetailedWeightReport logic? No, let's just sum it up locally or use what we have.

    // Better approach: Calculate weight using the same logic as the UI's Total Weight.
    // The UI uses: detailedWeights.reduce((sum, item) => sum + item.totalWeight, 0);
    // Let's replicate simple math here or import getDetailedWeightReport.
    // Let's import getDetailedWeightReport to be 100% accurate.

    // Actually, to avoid importing too many things and potential circular deps or complexity, let's just do:
    const weightData = calculateSystemWeight(segments, totalVolume);
    // now add equipment weights
    const equipmentWeight = equipmentList.reduce((sum, item) => sum + (item.weight || 0), 0);
    const totalWeightKg = weightData.totalWeight + equipmentWeight;

    return {
        totalVolumeLitres: totalVolume,
        totalWeightKg: totalWeightKg,
        glycolVol: glycolVol,
        waterVol: waterVol,
        mixDensity: 1.05
    };
};

export async function generatePdf(data: PdfData): Promise<Buffer> {
    const puppeteer = (await import('puppeteer')).default;
    const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();

    // 1. Calculate Data
    const summary = calculateSummary(data);

    // 2. Build HTML
    // We combine all templates.
    const page1Html = generatePage1(data, summary);
    const page2Html = generatePage2(data);
    const page3Html = generatePage3(data); // Returns empty string if no photos

    // Header/Footer Templates
    const headerTemplate = `
        <style>
            .header {
                font-family: Arial, sans-serif;
                font-size: 8pt;
                color: #555;
                width: 100%;
                padding-left: 20mm;
                padding-right: 15mm;
                display: flex;
                justify-content: space-between;
                border-bottom: 1px solid #ddd;
            }
        </style>
        <div class="header">
            <span>${data.projectDetails.projectName}</span>
            <span>Ref: ${data.projectDetails.projectNumber} | Rev: ${data.projectDetails.revision}</span>
        </div>
    `;

    const footerTemplate = `
        <style>
            .footer {
                font-family: Arial, sans-serif;
                font-size: 8pt;
                color: #555;
                width: 100%;
                padding-left: 20mm;
                padding-right: 15mm;
                display: flex;
                justify-content: space-between;
                border-top: 1px solid #ddd;
                padding-top: 5px;
            }
        </style>
        <div class="footer">
            <span>Generat automat: ${new Date().toLocaleDateString('ro-RO')}</span>
            <span>Pagina <span class="pageNumber"></span> din <span class="totalPages"></span></span>
        </div>
    `;

    const fullHtml = `
        <!DOCTYPE html>
        <html>
        <head>
            <style>${pdfStyles}</style>
        </head>
        <body>
            ${page1Html}
            ${page2Html}
            ${page3Html}
        </body>
        </html>
    `;

    await page.setContent(fullHtml, { waitUntil: 'networkidle0' });

    // 3. Generate PDF
    const pdfBuffer = await page.pdf({
        format: 'A4',
        printBackground: true,
        displayHeaderFooter: true,
        headerTemplate,
        footerTemplate,
        margin: {
            top: '20mm',
            bottom: '15mm',
            left: '20mm',
            right: '15mm'
        }
    });

    await browser.close();

    // cast to Buffer because page.pdf returns Uint8Array in newer puppeteer versions which Buffer.from handles
    return Buffer.from(pdfBuffer);
}
