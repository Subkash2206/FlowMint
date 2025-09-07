import type { NextConfig } from "next";

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Add this section
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
