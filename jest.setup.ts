import '@testing-library/jest-dom';
import React from 'react';

// Mock framer-motion
jest.mock('framer-motion', () => ({
    motion: {
        div: (props: any) => React.createElement('div', props),
        h1: (props: any) => React.createElement('h1', props),
        p: (props: any) => React.createElement('p', props),
        span: (props: any) => React.createElement('span', props),
    },
    AnimatePresence: ({ children }: any) => React.createElement(React.Fragment, null, children),
}));

// Mock lucide-react with a Proxy to handle any icon requested
jest.mock('lucide-react', () => {
    return new Proxy({}, {
        get: (target, prop) => {
            if (prop === '__esModule') return true;
            return (props: any) => React.createElement('div', { ...props, 'data-testid': `icon-${String(prop).toLowerCase()}` });
        }
    });
});
