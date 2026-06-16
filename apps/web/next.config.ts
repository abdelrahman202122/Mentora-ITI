import type { NextConfig } from "next";
import createNextIntlPlugin from 'next-intl/plugin';
const nextIntlPlugin = createNextIntlPlugin();
const nextConfig: NextConfig = {
  turbopack: {
    root: process.cwd(),
  },
};

export default nextIntlPlugin(nextConfig);
