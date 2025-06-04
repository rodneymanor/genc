/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [{ hostname: "localhost" }, { hostname: "randomuser.me" }, { hostname: "picsum.photos" }],
  },
  // Disable static generation for problematic pages
  experimental: {
    missingSuspenseWithCSRBailout: false,
  },
  // Handle build errors more gracefully
  typescript: {
    ignoreBuildErrors: false,
  },
  eslint: {
    ignoreDuringBuilds: false,
  },
  // Force dynamic rendering for pages with client-side features
  async rewrites() {
    return [];
  },
};

export default nextConfig;
