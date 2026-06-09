/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    // Proje geliştirilirken veya derlenirken TS hatalarını tamamen yok sayar.
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
