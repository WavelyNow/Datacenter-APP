import type { NextConfig } from "next";
import withPWA from 'next-pwa';

const nextConfig: NextConfig = {
  serverExternalPackages: ['puppeteer'],
  turbopack: {},
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
