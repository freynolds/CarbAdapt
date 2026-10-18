import type { NextConfig } from "next";

const apiOrigin = process.env.API_URL ?? "http://127.0.0.1:4000";

const nextConfig: NextConfig = {
  transpilePackages: ["@carbadapt/contracts", "@carbadapt/i18n", "@carbadapt/design-tokens"],
  // Contracts are TypeScript sources that import sibling files as `.js` (the
  // Node ESM convention). Turbopack needs that suffix mapped back to `.ts`.
  experimental: {
    extensionAlias: {
      ".js": [".ts", ".tsx", ".js"],
    },
  },
  async rewrites() {
    return [{ source: "/backend/:path*", destination: `${apiOrigin}/:path*` }];
  },
};

export default nextConfig;
