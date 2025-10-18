import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  experimental: {
    typedEnv: true,
    viewTransition: true,
  },
  typedRoutes: true,
};

export default nextConfig;
