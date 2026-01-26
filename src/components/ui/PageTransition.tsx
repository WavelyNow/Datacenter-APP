'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface PageTransitionProps {
    children: React.ReactNode;
    pageKey: string;
}

export const PageTransition: React.FC<PageTransitionProps> = ({ children, pageKey }) => {
    return (
        <AnimatePresence mode="wait">
            <motion.div
                key={pageKey}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.25 }}
                className="w-full h-full"
            >
                {children}
            </motion.div>
        </AnimatePresence>
    );
};

// Staggered list animation helpers
export const staggerContainer = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            staggerChildren: 0.05,
            delayChildren: 0.1
        }
    }
};

export const staggerItem = {
    hidden: { opacity: 0, y: 20 },
    show: {
        opacity: 1,
        y: 0
    }
};

// Button press feedback
export const buttonPress = {
    whileTap: { scale: 0.97 },
    whileHover: { scale: 1.02 }
};

// Card hover lift
export const cardLift = {
    whileHover: { y: -4 },
    whileTap: { scale: 0.99 }
};
