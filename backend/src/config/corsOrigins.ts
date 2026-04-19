/** Express болон Socket.IO хоёуланд ижил CORS origin жагсаалт. CORS_ORIGINS env-ээр нэмж болно. */
const defaultAllowedOrigins = [
  "http://localhost:3001",
  "http://localhost:3002",
  "http://localhost:3003",
  "https://tse-drab.vercel.app",
  "https://tse-5l34.onrender.com",
  "https://tse-lbdp.vercel.app",
];

export function buildAllowedOrigins(): string[] {
  const fromEnv =
    process.env.CORS_ORIGINS?.split(",")
      .map((s) => s.trim())
      .filter((s) => s.length > 0) ?? [];
  return [...new Set([...defaultAllowedOrigins, ...fromEnv])];
}
