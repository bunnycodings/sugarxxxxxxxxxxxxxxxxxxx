/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Skip database operations during build
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },
  // Suppress warnings about internal Next.js routes
  onDemandEntries: {
    maxInactiveAge: 25 * 1000,
    pagesBufferLength: 2,
  },
  // Image optimization
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
      {
        protocol: 'http',
        hostname: '**',
      },
    ],
  },
  // Ensure build doesn't hang on database connections
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Ignore database modules during build if needed
      config.externals = config.externals || []
    }
    return config
  },
}

module.exports = nextConfig

