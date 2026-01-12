import { PDFDocument, StandardFonts } from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';
import { PdfData } from './types';
import { generatePage1 } from './templates/page1';
import { generatePage2 } from './templates/page2';
import { generateSupportPage } from './templates/supportPage';
import { generateEnergyPage } from './templates/energyPage';
import { generatePage3 } from './templates/page3';
import { PDFContext } from './templates/SectionGenerator';
import { getTheme } from './styles';
import fs from 'fs';
import path from 'path';
import { base64ToUint8Array } from './utils';

// Helper to fetch fonts from filesystem (Server-Side)
async function fetchFont(filename: string): Promise<ArrayBuffer> {
    const filePath = path.join(process.cwd(), 'public', 'fonts', filename);
    console.log(`[DEBUG] Attempting to load font from: ${filePath}`);
    try {
        const fileBuffer = fs.readFileSync(filePath);
        console.log(`[DEBUG] Font loaded successfully: ${filename}`);
        return fileBuffer.buffer.slice(fileBuffer.byteOffset, fileBuffer.byteOffset + fileBuffer.byteLength) as ArrayBuffer;
    } catch (error) {
        console.error(`[DEBUG] Failed to load font: ${filename}`, error);
        throw error;
    }
}


export async function generatePdf(data: PdfData): Promise<Uint8Array> {
    const pdfDoc = await PDFDocument.create();
    pdfDoc.registerFontkit(fontkit);

    // Load fonts (Embedded to ensure portability)
    let fontRegular;
    try {
        const fontBytes = await fetchFont('Arial.ttf');
        fontRegular = await pdfDoc.embedFont(fontBytes);
        console.log('[DEBUG] Successfully embedded Arial font');
    } catch (error) {
        console.warn('[DEBUG] Failed to embed Arial font, falling back to Helvetica', error);
        fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);
    }
    // Reuse Regular font for Bold since we lack a Bold variant, ensuring no crash.
    const fontBold = fontRegular;

    let logoImage = undefined;
    if (data.projectDetails.companyLogo) {
        console.log('[DEBUG] Attempting to embed company logo');
        try {
            const logoBytes = base64ToUint8Array(data.projectDetails.companyLogo);
            console.log(`[DEBUG] Logo base64 converted, length: ${logoBytes.length}`);
            // Try PNG first, then JPG if it fails
            try {
                logoImage = await pdfDoc.embedPng(logoBytes);
                console.log('[DEBUG] Logo embedded as PNG');
            } catch (pngError) {
                console.log('[DEBUG] PNG embedding failed, trying JPG', pngError);
                logoImage = await pdfDoc.embedJpg(logoBytes);
                console.log('[DEBUG] Logo embedded as JPG');
            }
        } catch (e) {
            console.warn('[DEBUG] Could not embed custom logo, falling back to none.', e);
        }
    } else {
        console.log('[DEBUG] No company logo provided');
    }

    // Define Page Options
    const showVolume = data.options?.includeVolume !== false;
    const showBoQ = data.options?.includeBoQ !== false;
    const showPage1 = showVolume || showBoQ;
    const showWeights = data.options?.includeWeights === true;
    const showSupports = data.options?.includeSupports === true;

    // --- PAGE GENERATION ---

    // Initialize Layout Context
    const theme = getTheme(data.branding);
    const ctx = new PDFContext(pdfDoc, fontRegular, fontBold, data.projectDetails, theme, logoImage);
    await ctx.addPage(); // Explicitly add the first page now that it's async

    // Generate Content Flow
    if (showPage1) {
        console.log('[DEBUG] Generating page 1 (Volume & Materials)');
        await generatePage1(ctx, data);
        console.log('[DEBUG] Page 1 generated successfully');
    }
    if (showWeights) {
        console.log('[DEBUG] Generating page 2 (Weights)');
        await generatePage2(ctx, data);
        console.log('[DEBUG] Page 2 generated successfully');
    }
    if (showSupports) {
        console.log('[DEBUG] Generating support page');
        await generateSupportPage(ctx, data);
        console.log('[DEBUG] Support page generated successfully');
    }

    if (data.options?.includeEnergy) {
        console.log('[DEBUG] Generating Energy page');
        await generateEnergyPage(ctx, data);
        console.log('[DEBUG] Energy page generated successfully');
    }

    // Always check for photos Annex if weights/supports are requested
    if (showWeights || showSupports) {
        console.log('[DEBUG] Generating page 3 (Photos Annex)');
        await generatePage3(ctx, data);
        console.log('[DEBUG] Page 3 generated successfully');
    }

    // Finalize (footer on last page)
    ctx.finish();

    // If no pages were added (e.g. user deselected everything), add a placeholder
    if (pdfDoc.getPageCount() === 0) {
        const page = pdfDoc.addPage();
        const { height } = page.getSize();
        page.drawText('Nu s-a selectat nicio secțiune pentru raport.', { x: 50, y: height - 100, font: fontRegular, size: 12 });
    }

    const pdfBytes = await pdfDoc.save();
    return pdfBytes;
}
