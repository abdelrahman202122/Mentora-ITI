import path from "path";
import { fileURLToPath } from "url";
import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const nextIntlPlugin = createNextIntlPlugin();
const monorepoRoot = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  "../.."
);

// Read API URL from environment, fallback to localhost for development
const apiBaseUrl = process.env.API_BASE_URL ?? "http://localhost:4000";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["192.168.1.18"],
  turbopack: {
    root: monorepoRoot,
  },
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${apiBaseUrl}/api/:path*`,
      },
    ];
  },
  images: {
    localPatterns: [
      {
        pathname: "/profile-default.jpeg",
      },
      {
        pathname: "/api/files/avatars/**",
      },
    ],
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
        port: "4000",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "api.mywebsite.com",
        pathname: "/**",
      },
    ],
  },
  
};

export default nextIntlPlugin(nextConfig);
