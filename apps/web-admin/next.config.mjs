/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { hostname: 'api.mapbox.com' },
      { hostname: 'res.cloudinary.com' },
      { hostname: 'lh3.googleusercontent.com' },
    ],
  },
  async rewrites() {
    return [
      {
        source: '/admin/queues/:path*',
        destination: `${process.env.NEXT_PUBLIC_API_URL}/admin/queues/:path*`, // Proxy to Backend
      },
    ]
  },
}

export default nextConfig
