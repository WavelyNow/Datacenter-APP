import type { NextConfig } from "next";
import withPWA from 'next-pwa';

const withPWAConfig = withPWA({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development',
  register: true,
  skipWaiting: true,
  scope: '/',
  sw: 'sw.js',
});

const nextConfig: NextConfig = {
  reactCompiler: true,
  serverExternalPackages: ['puppeteer'],
};

export default withPWAConfig(nextConfig);
