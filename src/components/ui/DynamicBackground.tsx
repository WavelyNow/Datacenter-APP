"use client";

import React from 'react';
import { motion } from 'framer-motion';

export const DynamicBackground = () => {
    return (
        <div className="bg-mesh">
            {/* Primary Blobs */}
            <motion.div
                animate={{
                    x: [0, 50, 0],
                    y: [0, 30, 0],
                    rotate: [0, 45, 0],
                }}
                transition={{
                    duration: 20,
                    repeat: Infinity,
                    ease: "easeInOut"
                }}
                className="mesh-blob w-[600px] h-[600px] -top-[10%] -left-[10%] bg-primary/20"
            />
            
            <motion.div
                animate={{
                    x: [0, -40, 0],
                    y: [0, 60, 0],
                    rotate: [0, -30, 0],
                }}
                transition={{
                    duration: 25,
                    repeat: Infinity,
                    ease: "easeInOut"
                }}
                className="mesh-blob w-[500px] h-[500px] top-[20%] -right-[5%] bg-indigo-500/10 dark:bg-emerald-500/10"
            />

            <motion.div
                animate={{
                    x: [0, 30, 0],
                    y: [0, -50, 0],
                }}
                transition={{
                    duration: 18,
                    repeat: Infinity,
                    ease: "easeInOut"
                }}
                className="mesh-blob w-[700px] h-[700px] -bottom-[10%] left-[20%] bg-blue-500/10 dark:bg-teal-500/10"
            />

            {/* Accent Pulses */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-full h-full max-w-4xl bg-primary/5 blur-[150px] animate-pulse-soft" />
            </div>
        </div>
    );
};
