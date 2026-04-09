import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["recharts", "victory-vendor"],
  async redirects() {
    return [
      {
        source: "/",
        destination: "/applications",
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
