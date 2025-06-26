/** @type {import('next').NextConfig} */

const withPWA = require("@ducanh2912/next-pwa").default({
  dest: "public",
  disable: false,
  cacheOnFrontEndNav: true,
  aggressiveFrontEndNavCaching: true,
  reloadOnOnline: true,
  workboxOptions: {
    disableDevLogs: true,
  },
});

const nextConfig = {
  swcMinify: true,
  output: "standalone",
  images: {
    unoptimized: process.env.NODE_ENV === "development",
    loader: "custom",
    loaderFile: "./src/lib/imageLoader.ts",
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        port: "",
        pathname: "/*",
      },
      {
        protocol: "https",
        hostname: "i.pinimg.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "roomeet.gamasap.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "roomeet-dev.gamasap.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "http",
        hostname: "localhost",
        port: "5000",
        pathname: "/be-api/static/**",
      },
      {
        protocol: "https",
        hostname: "localhost",
        port: "5000",
        pathname: "/be-api/static/**",
      },
      {
        protocol: "https",
        hostname: "localhost",
        port: "5001",
        pathname: "/be-api/static/**",
      },
    ],
  },
};

module.exports = withPWA(nextConfig);
