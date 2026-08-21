import { PDFDocument, StandardFonts } from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';
import { PdfData } from './types';
import { generateSitePage } from './templates/sitePage';
import { generatePipeQuantityPage } from './templates/pipeQuantityPage';
import { generatePurchasePage } from './templates/purchasePage';
import { PDFContext } from './templates/SectionGenerator';
import { getTheme } from './styles';
import fs from 'fs';
import path from 'path';
import { base64ToUint8Array } from './utils';

// Cache la nivel de modul — fontul nu trebuie re-incarcat la fiecare request
const fontCache = new Map<string, Promise<ArrayBuffer>>();

// Helper to fetch fonts — fs în dezvoltare, URL pe Vercel (public/ nu e pe filesystem)
function fetchFont(filename: string): Promise<ArrayBuffer> {
    if (fontCache.has(filename)) return fontCache.get(filename)!;
    const promise = loadFont(filename);
    fontCache.set(filename, promise);
    return promise;
}

async function loadFont(filename: string): Promise<ArrayBuffer> {
    const paths = [
        path.join(process.cwd(), 'public', 'fonts', filename),
        path.join(process.cwd(), 'fonts', filename),
    ];
    for (const p of paths) {
        try {
            const fileBuffer = fs.readFileSync(p);
            return fileBuffer.buffer.slice(fileBuffer.byteOffset, fileBuffer.byteOffset + fileBuffer.byteLength) as ArrayBuffer;
        } catch {
            // try next
        }
    }
    // Fallback: fetch de pe site (funcționează și pe Vercel/serverless)
    const base = process.env.NEXT_PUBLIC_SITE_URL
        || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000');
    const res = await fetch(`${base}/fonts/${filename}`);
    if (res.ok) return await res.arrayBuffer();
    throw new Error(`Font unavailable: ${filename}`);
}

/**
 * RAPORT DE COMANDA — 3 pagini, minimal & premium:
 * 1. Site & date proiect
 * 2. Cantitate teava
 * 3. Lista de cumparat (glicol cu pierderi fittinguri + marja, teava, fittinguri)
 */
export async function generatePdf(data: PdfData): Promise<Uint8Array> {
    const pdfDoc = await PDFDocument.create();
    pdfDoc.registerFontkit(fontkit);

    // Load fonts (Embedded to ensure portability)
    let fontRegular;
    try {
        const fontBytes = await fetchFont('Arial.ttf');
        fontRegular = await pdfDoc.embedFont(fontBytes);
    } catch {
        console.warn('[PDF] Arial.ttf unavailable — falling back to Helvetica');
        fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);
    }
    // Reuse Regular font for Bold since we lack a Bold variant, ensuring no crash.
    const fontBold = fontRegular;

    let logoImage = undefined;
    if (data.projectDetails.companyLogo) {
        const logoBytes = base64ToUint8Array(data.projectDetails.companyLogo as string);
        const isPng = (data.projectDetails.companyLogo as string).includes('image/png');
        try {
            logoImage = isPng ? await pdfDoc.embedPng(logoBytes) : await pdfDoc.embedJpg(logoBytes);
        } catch {
            try {
                logoImage = await pdfDoc.embedPng(logoBytes);
            } catch {
                console.warn('[PDF] Could not embed custom logo');
                logoImage = undefined;
            }
        }
    }

    // Initialize Layout Context
    const theme = getTheme(data.branding);
    const ctx = new PDFContext(pdfDoc, fontRegular, fontBold, data.projectDetails, theme, logoImage);
    await ctx.addPage();

    // 1. Site & proiect
    await generateSitePage(ctx, data);
    // 2. Cantitate teava
    await generatePipeQuantityPage(ctx, data);
    // 3. Lista de cumparat
    await generatePurchasePage(ctx, data);

    // Footer pe ultima pagina
    ctx.finish();

    const pdfBytes = await pdfDoc.save();
    return pdfBytes;
}
