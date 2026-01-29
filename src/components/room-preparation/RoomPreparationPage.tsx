'use client';

import React from 'react';
import { RoomPrepProvider } from '@/context/RoomPrepContext';
import { RoomPrepWizard } from './RoomPrepWizard';

export function RoomPreparationPage() {
    return (
        <RoomPrepProvider>
            <div className="h-full overflow-hidden">
                <RoomPrepWizard />
            </div>
        </RoomPrepProvider>
    );
}

export default RoomPreparationPage;
