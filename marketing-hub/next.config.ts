import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // Spreadsheet import posts the .xlsx to a server action (Vercel caps request bodies at 4.5 MB).
    serverActions: { bodySizeLimit: "4mb" },
  },
};

export default nextConfig;
