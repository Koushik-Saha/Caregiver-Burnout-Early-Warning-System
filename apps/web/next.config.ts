import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  transpilePackages: ['@careload/core', '@careload/db'],
};

export default nextConfig;
