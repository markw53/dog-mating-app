import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '5000',
        pathname: '/uploads/**',
      },
      {
        protocol: 'https',
        hostname: 'www.royalkennelclub.com',
        pathname: '/media/**',
      },
    ],
    unoptimized: true, // Add this for development
  },
};

export default nextConfig;