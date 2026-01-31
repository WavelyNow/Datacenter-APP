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

export const TableSkeleton = ({ rows = 5 }: { rows?: number }) => (
    <div className="w-full space-y-4">
        <div className="flex gap-4 pb-4 border-b border-border/50">
            {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-4 flex-1" />
            ))}
        </div>
        {Array.from({ length: rows }).map((_, i) => (
            <div key={i} className="flex gap-4 py-4 border-b border-border/10">
                {Array.from({ length: 4 }).map((_, j) => (
                    <Skeleton key={j} className="h-4 flex-1" />
                ))}
            </div>
        ))}
    </div>
);

export const DocumentSkeleton = () => (
    <div className="w-full h-full p-8 bg-white space-y-8">
        <div className="flex justify-between items-start">
            <Skeleton className="w-32 h-16 rounded-lg bg-muted/20" />
            <div className="space-y-2 text-right">
                <Skeleton className="w-48 h-4 ml-auto bg-muted/20" />
                <Skeleton className="w-32 h-3 ml-auto bg-muted/20" />
            </div>
        </div>
        <div className="space-y-4">
            <Skeleton className="w-1/3 h-6 bg-muted/20" />
            <div className="grid grid-cols-2 gap-8">
                <div className="space-y-3">
                    <Skeleton className="w-full h-3 bg-muted/20" />
                    <Skeleton className="w-full h-3 bg-muted/20" />
                    <Skeleton className="w-4/5 h-3 bg-muted/20" />
                </div>
                <div className="space-y-3">
                    <Skeleton className="w-full h-3 bg-muted/20" />
                    <Skeleton className="w-full h-3 bg-muted/20" />
                    <Skeleton className="w-4/5 h-3 bg-muted/20" />
                </div>
            </div>
        </div>
        <div className="pt-8 border-t border-border/10">
            <TableSkeleton rows={10} />
        </div>
    </div>
);
