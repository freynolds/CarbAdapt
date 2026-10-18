import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@carbadapt/i18n", "@carbadapt/design-tokens"],
};

export default nextConfig;
