import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  allowedDevOrigins: [
    "192.168.1.15",
    "https://microphysical-tameka-explicitly.ngrok-free.dev",
  ],
  crossOrigin: "use-credentials",
};

export default nextConfig;
