import React from 'react';

interface SkeletonProps {
    className?: string;
    shimmer?: boolean;
}

export const Skeleton: React.FC<SkeletonProps> = ({ className = '', shimmer = true }) => {
    return (
        <div
            className={`rounded-md bg-muted/50 ${shimmer ? 'skeleton-shimmer' : 'animate-pulse'} ${className}`}
        />
    );
};

export const TableSkeleton: React.FC<{ rows?: number }> = ({ rows = 5 }) => {
    return (
        <div className="w-full space-y-4">
            {/* Header */}
            <div className="flex gap-4 items-center p-4 border-b border-border/40">
                <Skeleton className="h-6 w-1/4" />
                <Skeleton className="h-6 w-1/4" />
                <Skeleton className="h-6 w-1/4" />
                <Skeleton className="h-6 w-1/6 ml-auto" />
            </div>
            {/* Rows */}
            {Array.from({ length: rows }).map((_, i) => (
                <div key={i} className="flex gap-4 items-center p-4">
                    <Skeleton className="h-4 w-1/4" />
                    <Skeleton className="h-4 w-1/4" />
                    <Skeleton className="h-4 w-1/4" />
                    <Skeleton className="h-4 w-1/6 ml-auto" />
                </div>
            ))}
        </div>
    );
};

export const CardSkeleton: React.FC<{ count?: number }> = ({ count = 3 }) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {Array.from({ length: count }).map((_, i) => (
                <div key={i} className="p-6 rounded-2xl border border-border bg-card space-y-4">
                    <div className="flex items-center gap-4">
                        <Skeleton className="w-12 h-12 rounded-xl" />
                        <div className="space-y-2 flex-1">
                            <Skeleton className="h-4 w-3/4" />
                            <Skeleton className="h-3 w-1/2" />
                        </div>
                    </div>
                    <Skeleton className="h-20 w-full rounded-lg" />
                </div>
            ))}
        </div>
    );
}

export const DocumentSkeleton = () => {
    return (
        <div className="w-full h-full bg-white p-8 flex flex-col gap-6 animate-pulse">
            {/* Header / Logo Area */}
            <div className="flex justify-between items-start border-b border-border/10 pb-6">
                <Skeleton className="h-10 w-32" />
                <div className="flex flex-col items-end gap-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-32" />
                </div>
            </div>

            {/* Title Area */}
            <div className="py-8 text-center space-y-3">
                <Skeleton className="h-8 w-2/3 mx-auto" />
                <Skeleton className="h-4 w-1/2 mx-auto" />
            </div>

            {/* Content Grid */}
            <div className="grid grid-cols-2 gap-8 mt-4">
                <div className="space-y-3">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-5/6" />
                    <Skeleton className="h-4 w-4/6" />
                </div>
                <div className="space-y-3">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-5/6" />
                    <Skeleton className="h-4 w-4/6" />
                </div>
            </div>

            {/* Table Approximation */}
            <div className="mt-8 border border-border/20 rounded-lg overflow-hidden">
                <div className="h-8 bg-muted/30 border-b border-border/20" />
                <div className="p-4 space-y-4">
                    <Skeleton className="h-3 w-full" />
                    <Skeleton className="h-3 w-full" />
                    <Skeleton className="h-3 w-full" />
                    <Skeleton className="h-3 w-4/5" />
                </div>
            </div>

            {/* Footer */}
            <div className="mt-auto pt-6 border-t border-border/10 flex justify-between">
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-3 w-8" />
            </div>
        </div>
    );
};
