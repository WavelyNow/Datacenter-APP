'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
    componentName?: string;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error(`Uncaught error in ${this.props.componentName || 'Component'}:`, error, errorInfo);
    }

    public render() {
        if (this.state.hasError) {
            if (this.props.fallback) return this.props.fallback;

            // Premium Error UI
            return (
                <div className="relative overflow-hidden flex flex-col items-center justify-center p-8 md:p-12 text-center rounded-3xl border border-destructive/20 bg-gradient-to-b from-destructive/5 to-background backdrop-blur-sm shadow-xl shadow-destructive/5 h-full min-h-[300px] group animate-in fade-in zoom-in-95 duration-500">

                    {/* Background Decor */}
                    <div className="absolute inset-0 bg-grid-red-500/5 mask-image-linear-gradient-to-b" />
                    <div className="absolute -top-24 -right-24 w-64 h-64 bg-destructive/10 rounded-full blur-3xl group-hover:bg-destructive/15 transition-colors duration-700" />

                    {/* Icon */}
                    <div className="relative mb-6 transform group-hover:scale-105 transition-transform duration-500">
                        <div className="absolute inset-0 bg-destructive/20 blur-xl rounded-full opacity-50" />
                        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-background to-destructive/10 border border-destructive/20 shadow-lg flex items-center justify-center relative z-10 ring-1 ring-destructive/20">
                            <AlertTriangle className="w-10 h-10 text-destructive" />
                        </div>
                    </div>

                    <h3 className="text-xl font-bold text-foreground mb-2 tracking-tight">
                        {this.props.componentName ? `${this.props.componentName} Error` : 'Something went wrong'}
                    </h3>

                    <div className="max-w-md bg-destructive/5 border border-destructive/10 rounded-lg p-3 mb-6 w-full">
                        <code className="text-xs font-mono text-destructive/80 break-all line-clamp-3">
                            {this.state.error?.message || 'Unknown error occurred'}
                        </code>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 relative z-10">
                        <button
                            onClick={() => this.setState({ hasError: false, error: null })}
                            className="flex items-center justify-center gap-2 px-6 py-2.5 bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl text-sm font-bold shadow-lg shadow-primary/20 transition-all hover:-translate-y-0.5"
                        >
                            <RefreshCw className="w-4 h-4" />
                            Try Again
                        </button>
                        <button
                            onClick={() => window.location.reload()}
                            className="flex items-center justify-center gap-2 px-6 py-2.5 bg-secondary text-secondary-foreground hover:bg-secondary/80 rounded-xl text-sm font-medium transition-all"
                        >
                            Reload Page
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}
