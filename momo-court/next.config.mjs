import path from 'path';

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  outputFileTracingRoot: path.resolve(import.meta.dirname)
};

export default nextConfig;
