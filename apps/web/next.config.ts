import type { NextConfig } from "next";

const apiOrigin = process.env.API_URL ?? "http://127.0.0.1:4000";

const nextConfig: NextConfig = {
  transpilePackages: ["@carbadapt/contracts", "@carbadapt/i18n", "@carbadapt/design-tokens"],
  async rewrites() {
    return [{ source: "/backend/:path*", destination: `${apiOrigin}/:path*` }];
  },
};

export default nextConfig;
