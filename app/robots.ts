import type { MetadataRoute } from "next";

export const dynamic = "force-static";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: "https://room7hospitality.com/sitemap.xml",
    host: "https://room7hospitality.com",
  };
}
