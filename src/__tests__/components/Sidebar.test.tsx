import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Sidebar, TabId } from '@/components/Sidebar';

// Mock child components
jest.mock('@/components/ThemeToggle', () => ({
    ThemeToggle: () => <div data-testid="theme-toggle" />,
}));

describe('Sidebar Component', () => {
    const defaultProps = {
        activeTab: 'dashboard' as TabId,
        onTabChange: jest.fn(),
        projectDetails: {
            projectName: 'Test Project',
            projectNumber: '2026-TEST',
            designer: 'Test Designer',
            location: 'Test Location',
            beneficiary: 'Test Beneficiary',
            date: '2026-01-17',
            revision: '1',
        },
        onSettingsOpen: jest.fn(),
        onExportOpen: jest.fn(),
        onSave: jest.fn(),
        onLoad: jest.fn(),
    };

    it('renders the brand title correctly', () => {
        render(<Sidebar {...defaultProps} />);
        expect(screen.getByText(/Engineering Suite/i)).toBeInTheDocument();
    });

    it('displays the project name and number', () => {
        render(<Sidebar {...defaultProps} />);
        expect(screen.getByText('Test Project')).toBeInTheDocument();
        expect(screen.getByText('PROJ-2026-TEST')).toBeInTheDocument();
    });

    it('calls onTabChange when a navigation item is clicked', () => {
        render(<Sidebar {...defaultProps} />);
        const bimButton = screen.getByText('BIM Analysis');
        fireEvent.click(bimButton);
        expect(defaultProps.onTabChange).toHaveBeenCalledWith('bim');
    });

    it('highlights the active tab', () => {
        render(<Sidebar {...defaultProps} activeTab="bim" />);
        // BIM Analysis is active, we check if it has the active styles or the gradient div
        // Since the gradient div is rendered conditionally:
        // {isActive && (<div className="absolute inset-0 bg-gradient-to-r from-primary to-primary/80 opacity-100 z-0" />)}
        // We can check if that button has specific classes or just check the presence of the gradient if we can find it.
        // Actually, we can check for text-primary-foreground class if we want to be specific.
        const bimButton = screen.getByText('BIM Analysis').closest('button');
        expect(bimButton).toHaveClass('text-primary-foreground');
    });

    it('calls onSettingsOpen when project selector is clicked', () => {
        render(<Sidebar {...defaultProps} />);
        const projectSelector = screen.getByText('Test Project').closest('button');
        if (projectSelector) fireEvent.click(projectSelector);
        expect(defaultProps.onSettingsOpen).toHaveBeenCalled();
    });

    it('calls onExportOpen when Export button is clicked', () => {
        render(<Sidebar {...defaultProps} />);
        const exportButton = screen.getByText(/Export/i);
        fireEvent.click(exportButton);
        expect(defaultProps.onExportOpen).toHaveBeenCalled();
    });

    it('calls onTabChange("help") when Help button is clicked', () => {
        render(<Sidebar {...defaultProps} />);
        const helpButton = screen.getByText(/Help/i);
        fireEvent.click(helpButton);
        expect(defaultProps.onTabChange).toHaveBeenCalledWith('help');
    });
});
