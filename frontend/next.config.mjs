/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://127.0.0.1:8000/api/:path*', // Proxy to Backend
      },
      {
        source: '/auth/:path*',
        destination: 'http://127.0.0.1:8000/auth/:path*', // Proxy to Backend Auth
      },
    ];
  },
};

export default nextConfig;
