import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  headers: async () => {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
          {
            key: 'Content-Security-Policy',
            value:
              "default-src 'self'; img-src 'self' data: https:; media-src 'self' data: https:; script-src 'self' 'unsafe-inline' 'unsafe-eval' https:; style-src 'self' 'unsafe-inline' https:; connect-src 'self' https:; frame-ancestors 'self';",
          },
        ],
      },
    ];
  },
  images: {
    // Use remotePatterns to cover all Instagram CDN hosts
    remotePatterns: [
      {
        protocol: "https",
        hostname: "scontent-*.cdninstagram.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "instagram.com",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
