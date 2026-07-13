import type { Metadata } from "next";
import { Cormorant_Garamond, Inter, Jost } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ScrollProgress } from "@/components/ui/ScrollProgress";
import { organizationSchema } from "@/lib/schema";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-cormorant",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-inter",
  display: "swap",
});

const jost = Jost({
  subsets: ["latin"],
  weight: ["500"],
  variable: "--font-jost",
  display: "swap",
});

const SITE = "https://room7hospitality.com";

export const metadata: Metadata = {
  metadataBase: new URL(SITE),
  title: {
    default: "Room 7 — Elevated Hospitality | Fort Lauderdale",
    template: "%s · Room 7",
  },
  description:
    "Room 7 is the Fort Lauderdale hospitality group behind Jay's, Naked Taco, HighBar and Riviera. Four rooms, one house — elevated hospitality across South Florida.",
  keywords: [
    "Room 7",
    "Fort Lauderdale hospitality group",
    "South Florida restaurant group",
    "Jay Shirodkar",
    "private events Fort Lauderdale",
    "Jay's Fort Lauderdale",
  ],
  alternates: { canonical: SITE },
  openGraph: {
    type: "website",
    url: SITE,
    siteName: "Room 7",
    title: "Room 7 — Elevated Hospitality",
    description:
      "Four rooms, one house. The Fort Lauderdale hospitality group behind Jay's, Naked Taco, HighBar and Riviera.",
    images: [{ url: "/og/room7.png", width: 1200, height: 630, alt: "Room 7 — Elevated Hospitality" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Room 7 — Elevated Hospitality",
    description: "Four rooms, one house. Elevated hospitality across South Florida.",
    images: ["/og/room7.png"],
  },
  icons: {
    icon: [{ url: "/favicon.png", type: "image/png", sizes: "128x128" }],
    apple: [{ url: "/apple-icon.png", sizes: "180x180" }],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${cormorant.variable} ${inter.variable} ${jost.variable}`}>
      <body className="antialiased">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
        <ScrollProgress />
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-sm focus:bg-gold focus:px-4 focus:py-2 focus:text-forest-deep"
        >
          Skip to content
        </a>
        <Header />
        <main id="main">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
