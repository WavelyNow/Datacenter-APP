
import { NextRequest, NextResponse } from 'next/server';
import { generatePdf } from '@/lib/pdf/generatePdf';
import { PdfData } from '@/lib/pdf/types';
import { validatePipeSegment, validateEquipmentItem, sanitizeProjectName, VALIDATION_LIMITS } from '@/lib/validation';

export const dynamic = 'force-dynamic';
// Vercel: timp suficient pentru font embed + pdf-lib
export const maxDuration = 60;

export async function POST(req: NextRequest) {
    try {
        // Limită de corp: fotografiile base64 pot umfla payload-ul
        const raw = await req.text();
        if (raw.length > 25 * 1024 * 1024) {
            return NextResponse.json({ error: 'Payload prea mare (max 25 MB)' }, { status: 413 });
        }
        const body = JSON.parse(raw || 'null');
        const data = body as PdfData;

        // Comprehensive validation
        const errors: string[] = [];
        
        if (!data.segments || !Array.isArray(data.segments)) {
            errors.push('Segments array is required');
        } else {
            if (data.segments.length > VALIDATION_LIMITS.MAX_SEGMENTS) {
                errors.push(`Maximum ${VALIDATION_LIMITS.MAX_SEGMENTS} segments allowed`);
            }
            data.segments.forEach((seg, index) => {
                const result = validatePipeSegment(seg);
                if (!result.isValid) {
                    errors.push(`Segment ${index + 1}: ${result.errors.join(', ')}`);
                }
            });
        }
        
        if (!data.equipmentList || !Array.isArray(data.equipmentList)) {
            errors.push('Equipment list is required');
        } else {
            if (data.equipmentList.length > VALIDATION_LIMITS.MAX_EQUIPMENT_ITEMS) {
                errors.push(`Maximum ${VALIDATION_LIMITS.MAX_EQUIPMENT_ITEMS} equipment items allowed`);
            }
            data.equipmentList.forEach((item, index) => {
                const result = validateEquipmentItem(item);
                if (!result.isValid) {
                    errors.push(`Equipment ${index + 1}: ${result.errors.join(', ')}`);
                }
            });
        }
        
        if (!data.projectDetails || !data.projectDetails.projectName) {
            errors.push('Project details with project name are required');
        }

        // Fluid & parametri numerici — niciodata valori aiurea in raport
        if (!['ethylene', 'propylene', 'water'].includes(data.fluidType)) {
            data.fluidType = 'ethylene';
        }
        if (typeof data.glycolPercentage !== 'number' || !isFinite(data.glycolPercentage)) {
            data.glycolPercentage = 0;
        }
        data.glycolPercentage = Math.max(0, Math.min(100, data.glycolPercentage));
        if (typeof data.safetyMarginPercentage !== 'number' || !isFinite(data.safetyMarginPercentage)) {
            data.safetyMarginPercentage = 5;
        }
        data.safetyMarginPercentage = Math.max(0, Math.min(30, data.safetyMarginPercentage));

        // Fittinguri — cantitati valide
        if (data.fittingItems !== undefined) {
            if (!Array.isArray(data.fittingItems)) errors.push('fittingItems must be an array');
            else {
                data.fittingItems = data.fittingItems.map(f => ({
                    id: String(f?.id ?? 'fit'),
                    type: String(f?.type ?? 'elbow_90_std'),
                    size: String(f?.size ?? 'DN50'),
                    quantity: Math.max(0, Math.floor(Number(f?.quantity) || 0)),
                }));
            }
        }
        
        if (errors.length > 0) {
            console.log('[DEBUG] Validation failed with errors:', errors);
            return NextResponse.json({
                error: 'Validation failed',
                details: errors
            }, { status: 400 });
        }

        console.log('[DEBUG] Starting PDF generation with data:', {
            segmentsCount: data.segments?.length || 0,
            equipmentCount: data.equipmentList?.length || 0,
            projectName: data.projectDetails?.projectName,
            options: data.options
        });
        const pdfBuffer = await generatePdf(data);
        console.log(`[DEBUG] PDF generation completed, buffer size: ${pdfBuffer.length} bytes`);

        const filename = `Proiect_${sanitizeProjectName(data.projectDetails.projectName)}_Rev${data.projectDetails.revision}.pdf`;

        return new NextResponse(Buffer.from(pdfBuffer), {
            status: 200,
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': `attachment; filename="${filename}"`,
            },
        });
    } catch (error) {
        console.error('PDF Generation Error:', error);
        const errorMessage = error instanceof Error ? error.message : String(error);
        return NextResponse.json({ 
            error: 'Failed to generate PDF', 
            message: errorMessage 
        }, { status: 500 });
    }
}
