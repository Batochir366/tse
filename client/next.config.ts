import type { NextConfig } from "next";
const nextPublicApiUrl =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
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
    "https://tse-5l34.onrender.com",
  ],
  crossOrigin: "use-credentials",
};

export default nextConfig;
