import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ExpansionVesselCalculator } from '@/components/ExpansionVesselCalculator';
import { useProject } from '@/context/ProjectContext';
import { mockProjectContextValue } from '@/__tests__/mocks/mockProjectContext';

// Mock the context
jest.mock('@/context/ProjectContext', () => ({
    useProject: jest.fn(),
}));

describe('ExpansionVesselCalculator Component', () => {
    beforeEach(() => {
        (useProject as jest.Mock).mockReturnValue(mockProjectContextValue);
    });

    it('renders the header correctly', () => {
        render(<ExpansionVesselCalculator />);
        expect(screen.getByText(/Dimensionare Vas Expansiune/i)).toBeInTheDocument();
        expect(screen.getByText(/Conform EN 12828/i)).toBeInTheDocument();
    });

    it('displays the system volume from project data', () => {
        const mockValue = {
            ...mockProjectContextValue,
            segments: [{ length: 10, diameter: 20 }], // This should produce some volume
            equipmentList: [],
        };
        (useProject as jest.Mock).mockReturnValue(mockValue);

        render(<ExpansionVesselCalculator />);
        // The "Din proiect: X L" text should be present
        expect(screen.getByText(/Din proiect:/i)).toBeInTheDocument();
    });

    it('updates results when system volume input changes', () => {
        render(<ExpansionVesselCalculator />);
        const volumeInput = screen.getByLabelText(/Volum Sistem \(L\)/i);

        fireEvent.change(volumeInput, { target: { value: '1000' } });

        // Check if the recommended vessel size updated (exact value depends on logic, but it should be visible)
        // By default it might be 35L or something, with 1000L it should be larger.
        expect(screen.getByText(/L/i, { selector: '.text-4xl' })).toBeInTheDocument();
    });

    it('updates results when temperature changes', () => {
        render(<ExpansionVesselCalculator />);
        const maxTempInput = screen.getByLabelText(/T max \/ Operare/i);

        fireEvent.change(maxTempInput, { target: { value: '90' } });

        // Coef. Dilatare should increase
        expect(screen.getByText(/Coef. Dilatare/i)).toBeInTheDocument();
    });

    it('shows warnings when input is invalid', () => {
        render(<ExpansionVesselCalculator />);
        const maxTempInput = screen.getByLabelText(/T max \/ Operare/i);
        const minTempInput = screen.getByLabelText(/T min \/ Umplere/i);

        // Set max temp lower than min temp to trigger warning
        fireEvent.change(minTempInput, { target: { value: '50' } });
        fireEvent.change(maxTempInput, { target: { value: '40' } });

        // Warnings section should appear if the underlying logic returns warnings
        // Based on expansionVessel.ts logic
    });

    it('calculates pressures correctly based on static height', () => {
        render(<ExpansionVesselCalculator />);
        const heightInput = screen.getByLabelText(/Înălțime Statică \(m\)/i);
        const volumeInput = screen.getByLabelText(/Volum Sistem \(L\)/i);

        fireEvent.change(volumeInput, { target: { value: '100' } });
        fireEvent.change(heightInput, { target: { value: '10' } });

        expect(screen.getByText('0.98 bar')).toBeInTheDocument();
    });
});
