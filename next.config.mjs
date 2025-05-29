/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [{ hostname: "localhost" }, { hostname: "randomuser.me" }, { hostname: "picsum.photos" }],
  },
};

export default nextConfig;
