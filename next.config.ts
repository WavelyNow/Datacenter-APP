import type { NextConfig } from "next";

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
  reactCompiler: true,
  async headers() {
    return [
      {
        source: '/:path*',
        headers: securityHeaders,
      },
    ];
  },
};

// NOTA: next-pwa a fost eliminat — plugin-ul e webpack iar build-ul foloseste
// Turbopack (nu mai genera SW-ul; fisierul committed devenea stale si putea
// bloca actualizarile). Manifest-ul static ramane pentru instalare PWA.
export default nextConfig;

