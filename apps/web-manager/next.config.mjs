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
        source: '/osrm-proxy/:path*',
        destination: 'https://router.project-osrm.org/:path*',
      },
    ]
  },
}

export default nextConfig
