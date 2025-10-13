import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  experimental: {
    typedEnv: true,
    viewTransition: true,
    turbopackFileSystemCacheForDev: true,
    browserDebugInfoInTerminal: true,
  },
  typedRoutes: true,
};

export default nextConfig;
