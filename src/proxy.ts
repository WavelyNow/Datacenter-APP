import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Simple in-memory rate limiter (for production, use Redis or similar)
const rateLimitMap = new Map<string, { count: number; lastReset: number }>();

const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 30; // 30 requests per minute for API routes

function getRateLimitKey(request: NextRequest): string {
    // Use IP address or fallback to a generic key
    const forwarded = request.headers.get('x-forwarded-for');
    const ip = forwarded ? forwarded.split(',')[0].trim() : 'anonymous';
    return `${ip}:${request.nextUrl.pathname}`;
}

function isRateLimited(key: string): { limited: boolean; remaining: number } {
    const now = Date.now();
    const record = rateLimitMap.get(key);

    if (!record || now - record.lastReset > RATE_LIMIT_WINDOW) {
        // Reset or create new record
        rateLimitMap.set(key, { count: 1, lastReset: now });
        return { limited: false, remaining: MAX_REQUESTS_PER_WINDOW - 1 };
    }

    if (record.count >= MAX_REQUESTS_PER_WINDOW) {
        return { limited: true, remaining: 0 };
    }

    record.count++;
    return { limited: false, remaining: MAX_REQUESTS_PER_WINDOW - record.count };
}

// Clean up old entries periodically (every 5 minutes)
setInterval(() => {
    const now = Date.now();
    for (const [key, value] of rateLimitMap.entries()) {
        if (now - value.lastReset > RATE_LIMIT_WINDOW * 5) {
            rateLimitMap.delete(key);
        }
    }
}, 5 * 60 * 1000);

export function proxy(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Only rate limit API routes
    if (pathname.startsWith('/api/')) {
        const key = getRateLimitKey(request);
        const { limited, remaining } = isRateLimited(key);

        if (limited) {
            return new NextResponse(
                JSON.stringify({ error: 'Too many requests. Please try again later.' }),
                {
                    status: 429,
                    headers: {
                        'Content-Type': 'application/json',
                        'X-RateLimit-Limit': String(MAX_REQUESTS_PER_WINDOW),
                        'X-RateLimit-Remaining': '0',
                        'Retry-After': '60',
                    },
                }
            );
        }

        // Add rate limit headers to response
        const response = NextResponse.next();
        response.headers.set('X-RateLimit-Limit', String(MAX_REQUESTS_PER_WINDOW));
        response.headers.set('X-RateLimit-Remaining', String(remaining));
        return response;
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        // Match all API routes
        '/api/:path*',
    ],
};
