'use client';

import * as React from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';

export function ThemeToggle() {
    const { setTheme, resolvedTheme } = useTheme();
    const [mounted, setMounted] = React.useState(false);

    React.useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return (
            <div className="w-9 h-9 flex items-center justify-center rounded-xl border border-border/50 bg-secondary/10 opacity-50" />
        );
    }

    const isDark = resolvedTheme === 'dark';

    return (
        <button
            onClick={() => setTheme(isDark ? 'light' : 'dark')}
            className="group relative w-9 h-9 flex items-center justify-center rounded-xl border border-border/50 bg-secondary/30 backdrop-blur-md hover:bg-secondary/80 hover:border-primary/50 transition-all duration-300 shadow-sm active:scale-95"
            aria-label="Toggle theme"
        >
            {isDark ? (
                <Moon className="h-[1.1rem] w-[1.1rem] transition-all duration-500 text-muted-foreground animate-in fade-in zoom-in-50" />
            ) : (
                <Sun className="h-[1.1rem] w-[1.1rem] transition-all duration-500 text-amber-500 animate-in fade-in zoom-in-50" />
            )}
        </button>
    );
}
