import '@testing-library/jest-dom';
import React from 'react';

// Mock framer-motion
jest.mock('framer-motion', () => ({
    motion: {
        div: (props: Record<string, unknown>) => React.createElement('div', props),
        h1: (props: Record<string, unknown>) => React.createElement('h1', props),
        p: (props: Record<string, unknown>) => React.createElement('p', props),
        span: (props: Record<string, unknown>) => React.createElement('span', props),
    },
    AnimatePresence: ({ children }: { children: React.ReactNode }) => React.createElement(React.Fragment, null, children),
}));

// Mock lucide-react with a Proxy to handle any icon requested
jest.mock('lucide-react', () => {
    return new Proxy({}, {
        get: (_target, prop) => {
            if (prop === '__esModule') return true;
            return (props: Record<string, unknown>) => React.createElement('div', { ...props, 'data-testid': `icon-${String(prop).toLowerCase()}` });
        }
    });
});
