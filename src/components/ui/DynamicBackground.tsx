"use client";

import React from 'react';
import { motion } from 'framer-motion';

/**
 * Apple-style background: extremely subtle, calm ambient light.
 * No heavy meshes, no noise — just a faint gradient wash.
 */
export const DynamicBackground = () => {
    return (
        <div className="fixed inset-0 -z-50 overflow-hidden pointer-events-none bg-background" aria-hidden="true">
            {/* Faint ambient blobs (very low opacity) */}
            <motion.div
                animate={{
                    x: [0, 40, 0],
                    y: [0, 24, 0],
                }}
                transition={{
                    duration: 30,
                    repeat: Infinity,
                    ease: "easeInOut"
                }}
                className="absolute rounded-full blur-[140px] opacity-[0.06] w-[600px] h-[600px] -top-[10%] -left-[10%] bg-primary"
            />

            <motion.div
                animate={{
                    x: [0, -30, 0],
                    y: [0, 48, 0],
                }}
                transition={{
                    duration: 35,
                    repeat: Infinity,
                    ease: "easeInOut"
                }}
                className="absolute rounded-full blur-[140px] opacity-[0.05] w-[700px] h-[700px] -bottom-[10%] left-[25%] bg-primary"
            />

            <motion.div
                animate={{
                    x: [0, 24, 0],
                    y: [0, -40, 0],
                }}
                transition={{
                    duration: 28,
                    repeat: Infinity,
                    ease: "easeInOut"
                }}
                className="absolute rounded-full blur-[120px] opacity-[0.04] w-[500px] h-[500px] top-[15%] -right-[5%] bg-primary"
            />
        </div>
    );
};
