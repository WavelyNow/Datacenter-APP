
import { PdfData, ReportSummary } from '../types';
import { getDetailedWeightReport } from '@/lib/calculations';

export const generatePage2 = (data: PdfData) => {
    const reportItems = getDetailedWeightReport(data.segments, data.equipmentList, data.glycolPercentage);

    // Sort logic (optional): maybe pipes first, then equipment
    // Currently getDetailedWeightReport returns them in that order.

    const rows = reportItems.map((item, idx) => `
        <tr class="no-break-inside">
            <td class="text-center">${idx + 1}</td>
            <td>${item.description}</td>
            <td class="text-center">${item.quantity}</td>
            <td class="text-right mono">${item.emptyWeight.toFixed(1)}</td>
            <td class="text-right mono">${item.fluidWeight.toFixed(1)}</td>
            <td class="text-right mono text-bold">${item.totalWeight.toFixed(1)}</td>
        </tr>
    `).join('');

    const totalEmpty = reportItems.reduce((acc, i) => acc + i.emptyWeight, 0);
    const totalFluid = reportItems.reduce((acc, i) => acc + i.fluidWeight, 0);
    const grandTotal = totalEmpty + totalFluid;

    return `
        <div class="page-break">
            <h1>Anexa 1: Raport Detaliat Sarcini</h1>
            
            <p>Acest raport detaliază sarcinile statice generate de rețeaua hidraulică și echipamentele aferente.</p>

            <table>
                <thead>
                    <tr>
                        <th style="width: 5%;">Nr.</th>
                        <th>Descriere Element</th>
                        <th style="width: 10%;">Cant.</th>
                        <th style="width: 15%;">Greutate Gol (kg)</th>
                        <th style="width: 15%;">Greutate Fluid (kg)</th>
                        <th style="width: 15%;">TOTAL (kg)</th>
                    </tr>
                </thead>
                <tbody>
                    ${rows}
                    <tr class="total-row">
                        <td colspan="3" class="text-right">TOTAL GENERAL</td>
                        <td class="text-right mono">${totalEmpty.toFixed(1)}</td>
                        <td class="text-right mono">${totalFluid.toFixed(1)}</td>
                        <td class="text-right mono">${grandTotal.toFixed(1)}</td>
                    </tr>
                </tbody>
            </table>
        </div>
    `;
};
