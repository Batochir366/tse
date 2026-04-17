import type { NextConfig } from "next";
const nextPublicApiUrl =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
const nextConfig: NextConfig = {
  /* config options here */
  allowedDevOrigins: [
    "192.168.1.15",
    "https://microphysical-tameka-explicitly.ngrok-free.dev",
    nextPublicApiUrl,
  ],
  crossOrigin: "use-credentials",
};

export default nextConfig;
