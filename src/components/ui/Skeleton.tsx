"use client";

import React from 'react';
import { cn } from '@/lib/utils';

interface SkeletonProps {
    className?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({ className }) => {
    return (
        <div 
            className={cn(
                "bg-muted/50 rounded-lg animate-pulse",
                className
            )} 
        />
    );
};

export const CardSkeleton = () => (
    <div className="bg-card border border-border/50 rounded-2xl p-6 relative overflow-hidden">
        <div className="flex items-center gap-4 mb-4">
            <Skeleton className="w-12 h-12 rounded-xl" />
            <div className="space-y-2 flex-1">
                <Skeleton className="w-1/3 h-4" />
                <Skeleton className="w-1/2 h-3" />
            </div>
        </div>
        <div className="space-y-3">
            <Skeleton className="w-full h-3" />
            <Skeleton className="w-full h-3" />
            <Skeleton className="w-4/5 h-3" />
        </div>
        {/* Shimmer effect is already in CSS if we want to use skeleton-shimmer */}
    </div>
);

export const ListSkeleton = ({ count = 3 }: { count?: number }) => (
    <div className="space-y-4">
        {Array.from({ length: count }).map((_, i) => (
            <CardSkeleton key={i} />
        ))}
    </div>
);
