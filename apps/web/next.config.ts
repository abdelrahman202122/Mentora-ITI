import path from "path";
import { fileURLToPath } from "url";
import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const nextIntlPlugin = createNextIntlPlugin();
const monorepoRoot = path.join(path.dirname(fileURLToPath(import.meta.url)), "../..");

const nextConfig: NextConfig = {
  allowedDevOrigins: ["192.168.1.18"],
  turbopack: {
    root: monorepoRoot,
  },
images: {
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
