"use client";

import React from 'react';

/**
 * Fundal Apple-minimal: plan curat, fără animații și fără blob-uri colorate.
 * Doar un wash de lumină foarte discret, pe niveluri neutre.
 */
export const DynamicBackground = () => {
    return (
        <div
            className="fixed inset-0 -z-50 pointer-events-none"
            aria-hidden="true"
            style={{
                background:
                    'radial-gradient(ellipse 80% 50% at 50% -10%, rgba(0,0,0,0.04), transparent 70%)',
            }}
        />
    );
};
