/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    dirs: ["pages", "utils", "components", "app"],
  },
  typescript: {
    ignoreBuildErrors: false,
  },
}

module.exports = nextConfig
