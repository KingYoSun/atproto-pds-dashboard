/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    PDS_HOST: process.env.PDS_HOST,
  },
};

module.exports = nextConfig;
