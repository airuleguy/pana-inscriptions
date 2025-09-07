/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  eslint: {
    ignoreDuringBuilds: true,
  },
  experimental: {
    turbo: {
      rules: {
        '*.svg': {
          loaders: ['@svgr/webpack'],
          as: '*.js',
        },
      },
    },
  },
  images: {
    domains: [], // No direct FIG API usage - images handled through backend
  },
  async rewrites() {
    // Prefer BACKEND_URL if provided; default to internal Docker name in prod, localhost in dev
    const isProd = process.env.NODE_ENV === 'production';
    const backendUrl = process.env.BACKEND_URL
      || process.env.NEXT_PUBLIC_BACKEND_URL
      || (isProd ? 'http://backend:3001' : 'http://localhost:3001');

    return [
      {
        source: '/api/:path*',
        destination: `${backendUrl}/api/:path*`, // Backend API
      },
    ];
  },
};

module.exports = nextConfig; 