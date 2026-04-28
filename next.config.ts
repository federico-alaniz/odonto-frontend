import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  experimental: {
    lightningCssFeatures: {
      include: ['lab-colors', 'oklab-colors'],
    },
  },
}

export default nextConfig;
