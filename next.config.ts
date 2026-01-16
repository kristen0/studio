import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  basePath: "/studio",
  images: {
    unoptimized: true
  }
};

export default nextConfig;
