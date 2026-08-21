import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  async redirects() {
    return [
      {
        source: "/held-software-limited",
        destination: "/about",
        permanent: true,
      },
      {
        source: "/bookheld",
        destination: "/",
        permanent: true,
      },
      {
        source: "/booking-software",
        destination: "/how-it-works",
        permanent: true,
      },
      {
        source: "/booking",
        destination: "/how-it-works",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
