import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  experimental: {
    typedEnv: true,
    browserDebugInfoInTerminal: true,
  },
  typedRoutes: true,
};

export default nextConfig;
