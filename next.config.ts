import type { NextConfig } from "next";
import withPWA from 'next-pwa';

const securityHeaders = [
  {
    key: 'X-DNS-Prefetch-Control',
    value: 'on'
  },
  {
    key: 'X-Frame-Options',
    value: 'SAMEORIGIN'
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff'
  },
  {
    key: 'Referrer-Policy',
    value: 'strict-origin-when-cross-origin'
  },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=(self), interest-cohort=()'
  },
  {
    key: 'X-XSS-Protection',
    value: '1; mode=block'
  }
];

const nextConfig: NextConfig = {
  serverExternalPackages: ['puppeteer'],
  turbopack: {},
  async headers() {
    return [
      {
        source: '/:path*',
        headers: securityHeaders,
      },
    ];
  },
};

const withPWAConfig = withPWA({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development',
  register: true,
  skipWaiting: true,
  scope: '/',
  sw: 'sw.js',
});

// Correctly apply PWA wrapper
export default withPWAConfig(nextConfig);

