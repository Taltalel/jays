import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Static export so the site can deploy to Vercel or be dropped onto
  // GoDaddy hosting as plain static files.
  output: "export",
  images: {
    // Required for `output: 'export'` — we ship pre-optimised assets.
    unoptimized: true,
  },
  trailingSlash: true,
};

export default nextConfig;
