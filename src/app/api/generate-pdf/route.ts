
import { NextRequest, NextResponse } from 'next/server';
import { generatePdf } from '@/lib/pdf/generatePdf';
import { PdfData } from '@/lib/pdf/types';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const data = body as PdfData;

        // Basic validation
        if (!data.segments || !data.equipmentList) {
            return NextResponse.json({ error: 'Invalid Data: Missing segments or equipment' }, { status: 400 });
        }

        const pdfBuffer = await generatePdf(data);

        const filename = `Proiect_${data.projectDetails.projectName.replace(/\s+/g, '_')}_Rev${data.projectDetails.revision}.pdf`;

        return new NextResponse(pdfBuffer as any, {
            status: 200,
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': `attachment; filename="${filename}"`,
            },
        });
    } catch (error) {
        console.error('PDF Generation Error:', error);
        return NextResponse.json({ error: `Failed to generate PDF: ${String(error)}` }, { status: 500 });
    }
}
