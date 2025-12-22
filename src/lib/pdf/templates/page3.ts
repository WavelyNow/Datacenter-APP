
import { PdfData } from '../types';

export const generatePage3 = (data: PdfData) => {
    const { equipmentList } = data;

    // Filter equipment with photos
    // Now supporting both legacy 'proofImage' and new 'photos' array
    const equipmentWithPhotos = equipmentList.filter(eq =>
        (eq.photos && eq.photos.length > 0) || eq.proofImage
    );

    if (equipmentWithPhotos.length === 0) {
        return ''; // Return empty string if no photos, generatePdf logic should verify this too to avoid blank page
    }

    const galleryItems = equipmentWithPhotos.map(eq => {
        // Collect all images for this equipment
        const images: string[] = [];
        if (eq.photos) images.push(...eq.photos);
        if (eq.proofImage && !images.includes(eq.proofImage)) images.push(eq.proofImage);

        return images.map((img, idx) => `
            <div class="photo-item">
                <img src="${img}" alt="${eq.name}" />
                <div class="photo-caption">
                    <strong>${eq.type}</strong><br>
                    ${eq.name || 'Fără Nume'} ${images.length > 1 ? `(${idx + 1})` : ''}
                </div>
            </div>
        `).join('');
    }).join('');

    return `
        <div class="page-break">
            <h1>Anexa 2: Specificații Tehnice (Foto)</h1>
            <p>Fișe tehnice și documentație foto pentru echipamentele din proiect.</p>
            
            <div class="photo-grid">
                ${galleryItems}
            </div>
        </div>
    `;
};
