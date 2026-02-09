import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  serverExternalPackages: ["opik"],
  output: "standalone", // Enable Docker support
};

export default nextConfig;
