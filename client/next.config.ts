import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "drive.google.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "www.mongolianz.com",
        pathname: "/**",
      },
    ],
  },
  allowedDevOrigins: [
    "192.168.1.15",
    "https://microphysical-tameka-explicitly.ngrok-free.dev",
  ],
  crossOrigin: "use-credentials",
};

export default nextConfig;
