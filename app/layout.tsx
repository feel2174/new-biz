import "./globals.css";

import { Inter as FontSans } from "next/font/google";
import { ThemeProvider } from "@/components/theme/theme-provider";
import { Nav } from "@/components/layout/nav";
import { Footer } from "@/components/layout/footer";
import { SiteJsonLd } from "@/components/seo/json-ld";
import { TrafficGateProvider } from "@/components/traffic/traffic-gate";
import { AdSenseScript } from "@/components/ads/adsense-script";
import { Analytics } from "@vercel/analytics/next";

import { siteConfig } from "@/site.config";
import { cn } from "@/lib/utils";

import type { Metadata, Viewport } from "next";

const font = FontSans({
  subsets: ["latin"],
  variable: "--font-sans",
});

const GA_MEASUREMENT_ID =
  process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || "G-410B6EXVMZ";

export const metadata: Metadata = {
  title: {
    default: `${siteConfig.site_name} | 생활·금융·정책 정보 블로그`,
    template: `%s | ${siteConfig.site_name}`,
  },
  description: siteConfig.site_description,
  metadataBase: new URL(siteConfig.site_domain),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "ko_KR",
    url: siteConfig.site_domain,
    siteName: siteConfig.site_name,
    title: siteConfig.site_name,
    description: siteConfig.site_description,
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.site_name,
    description: siteConfig.site_description,
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <head>
        <script
          async
          src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());

gtag('config', '${GA_MEASUREMENT_ID}');`,
          }}
        />
      </head>
      <body className={cn("min-h-screen font-sans antialiased", font.variable)}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <TrafficGateProvider>
            <AdSenseScript />
            <SiteJsonLd />
            <Nav />
            {children}
            <Footer />
          </TrafficGateProvider>
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  );
}
