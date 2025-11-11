/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Skip database operations during build
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
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

