import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Providers from "./providers";
import { Analytics } from "@vercel/analytics/next"; // <-- added import

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Instagram Post Downloader",
  description: "Resolve and download media from Instagram post URLs.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <Providers>
          {/* JSON-LD Structured Data */}
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                '@context': 'https://schema.org',
                '@type': 'WebSite',
                name: 'Instagram Post Downloader',
                url: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
                potentialAction: {
                  '@type': 'SearchAction',
                  target: {
                    '@type': 'EntryPoint',
                    urlTemplate: (process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000') + '/?url={instagramUrl}',
                  },
                  'query-input': 'required name=instagramUrl',
                },
              }),
            }}
          />
          {children}
          <Analytics /> {/* <-- added Analytics here */}
        </Providers>
      </body>
    </html>
  );
}
