/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    // Alias 'crypto' to 'crypto-browserify'
    config.resolve.alias.crypto = 'crypto-browserify';
    return config;
  },
};

module.exports = nextConfig;
