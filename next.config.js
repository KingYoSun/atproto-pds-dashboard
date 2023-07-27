/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    PDS_HOST: process.env.PDS_HOST,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*",
      },
      {
        protocol: "http",
        hostname: "*",
      },
    ],
  },
};

module.exports = nextConfig;
