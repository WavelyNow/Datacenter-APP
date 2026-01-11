
import { NextRequest, NextResponse } from 'next/server';
import { generatePdf } from '@/lib/pdf/generatePdf';
import { PdfData } from '@/lib/pdf/types';
import { validatePipeSegment, validateEquipmentItem, sanitizeProjectName, VALIDATION_LIMITS } from '@/lib/validation';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
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
        
        if (errors.length > 0) {
            return NextResponse.json({ 
                error: 'Validation failed', 
                details: errors 
            }, { status: 400 });
        }

        const pdfBuffer = await generatePdf(data);

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
