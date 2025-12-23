import { PdfData } from '../types';
import { PDFContext } from './SectionGenerator';
import { base64ToUint8Array } from '../utils';

export async function generatePage3(
    ctx: PDFContext,
    data: PdfData
) {
    const { equipmentList } = data;
    const { theme } = ctx;

    // Filter equipment with photos
    const equipmentWithPhotos = equipmentList.filter(eq =>
        (eq.photos && eq.photos.length > 0) || eq.proofImage
    );

    if (equipmentWithPhotos.length === 0) return;

    // Start on a new page or ensure enough space for title
    await ctx.checkSpace(200);

    // Section Header
    ctx.currentPage.drawText('ANEXA 2: DOCUMENTAȚIE FOTO ECHIPAMENTE', {
        x: 50,
        y: ctx.currentY,
        size: 14,
        font: ctx.fontBold,
        color: theme.primary,
    });

    ctx.currentY -= 35;

    for (const eq of equipmentWithPhotos) {
        const images: string[] = [];
        if (eq.photos) images.push(...eq.photos);
        if (eq.proofImage && !images.includes(eq.proofImage)) images.push(eq.proofImage);

        for (const imgBase64 of images) {
            // Photos usually need a lot of space
            await ctx.checkSpace(300);

            try {
                const imageBytes = base64ToUint8Array(imgBase64);
                let image;
                try {
                    image = await ctx.pdfDoc.embedPng(imageBytes);
                } catch {
                    image = await ctx.pdfDoc.embedJpg(imageBytes);
                }

                const dims = image.scale(0.5);

                // Max width/height constraints
                const maxWidth = ctx.width - 100;
                const maxHeight = 300; // Slightly more space

                let finalWidth = dims.width;
                let finalHeight = dims.height;

                if (finalWidth > maxWidth) {
                    const ratio = maxWidth / finalWidth;
                    finalWidth = maxWidth;
                    finalHeight *= ratio;
                }

                if (finalHeight > maxHeight) {
                    const ratio = maxHeight / finalHeight;
                    finalHeight = maxHeight;
                    finalWidth *= ratio;
                }

                ctx.currentPage.drawImage(image, {
                    x: 50,
                    y: ctx.currentY - finalHeight,
                    width: finalWidth,
                    height: finalHeight
                });

                ctx.currentY -= (finalHeight + 15);

                // Caption
                ctx.currentPage.drawText(`Echipament: ${eq.type} (${eq.name || 'Fară Nume'})`, {
                    x: 50,
                    y: ctx.currentY,
                    size: 9,
                    font: ctx.fontRegular,
                    color: theme.textLight
                });

                ctx.currentY -= 35;
            } catch (err) {
                console.warn('Failed to embed equipment photo', err);
            }
        }
    }
}
