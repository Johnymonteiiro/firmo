import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  // Build enxuto para Docker (gera .next/standalone com server.js).
  output: "standalone",
};

export default nextConfig;
