import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { Providers } from "@/components/providers";
import { GoogleAnalytics } from "@/components/analytics/GoogleAnalytics";
import {
  DEFAULT_DESCRIPTION,
  DEFAULT_OG_IMAGE_PATH,
  DEFAULT_SITE_KEYWORDS,
  DEFAULT_SITE_TITLE,
  getSiteUrl,
  SITE_NAME,
} from "@/lib/site-config";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

const siteUrl = getSiteUrl();
const googleSiteVerification =
  process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION?.trim();

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: DEFAULT_SITE_TITLE,
    template: "%s | Read My Pay",
  },
  description: DEFAULT_DESCRIPTION,
  keywords: DEFAULT_SITE_KEYWORDS,
  applicationName: SITE_NAME,
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteUrl,
    siteName: SITE_NAME,
    title: DEFAULT_SITE_TITLE,
    description: DEFAULT_DESCRIPTION,
    images: [
      {
        url: DEFAULT_OG_IMAGE_PATH,
        width: 1200,
        height: 630,
        alt: `${SITE_NAME} — Plain English explanations for pay stubs and tax documents`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: DEFAULT_SITE_TITLE,
    description: DEFAULT_DESCRIPTION,
    images: [DEFAULT_OG_IMAGE_PATH],
  },
  robots: {
    index: true,
    follow: true,
  },
  ...(googleSiteVerification
    ? {
        verification: {
          google: googleSiteVerification,
        },
      }
    : {}),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} min-h-screen bg-white font-sans antialiased text-slate-900`}
      >
        <GoogleAnalytics />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
