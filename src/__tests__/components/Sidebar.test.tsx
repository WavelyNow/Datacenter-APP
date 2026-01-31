import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Sidebar } from '@/components/Sidebar';

// Mock child components
jest.mock('@/components/ThemeToggle', () => ({
    ThemeToggle: () => <div data-testid="theme-toggle" />,
}));

const mockSetActiveTab = jest.fn();

jest.mock('@/context/ProjectContext', () => ({
    useProject: () => ({
        activeTab: 'dashboard',
        setActiveTab: mockSetActiveTab,
        projectDetails: {
            projectName: 'Test Project',
            projectNumber: '2026-TEST',
        }
    })
}));

jest.mock('@/context/UIContext', () => ({
    useUI: () => ({
        activeTab: 'dashboard',
        setActiveTab: mockSetActiveTab, // Reusing the spy
        highlightedItemId: null,
        setHighlightedItemId: jest.fn(),
        isSidebarCollapsed: false,
        toggleSidebar: jest.fn(),
    }),
}));

// Mock PreferencesContext for useTranslation
const mockTranslations: Record<string, string> = {
    'sidebar.brand': 'Engineering Suite',
    'sidebar.pipingRouting': 'Piping & Routing',
    'sidebar.exportRaport': 'Export Report',
    'common.help': 'Help',
};

jest.mock('@/context/PreferencesContext', () => ({
    useTranslation: () => ({
        t: (key: string) => mockTranslations[key] || key,
        language: 'en',
    }),
    usePreferences: () => ({
        preferences: { language: 'en', unitSystem: 'metric' },
        updatePreference: jest.fn(),
        resetPreferences: jest.fn(),
        isOnline: true,
    }),
}));

describe('Sidebar Component', () => {
    const defaultProps = {
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
        const bimButton = screen.getByText('Piping & Routing'); // Match actual label
        fireEvent.click(bimButton);
        expect(mockSetActiveTab).toHaveBeenCalledWith('config');
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
        const helpButton = screen.getByText(/^Help$/i);
        fireEvent.click(helpButton);
        expect(mockSetActiveTab).toHaveBeenCalledWith('help');
    });
});
