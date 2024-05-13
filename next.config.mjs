/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        domains: [
            'uploadthing.com',
            'utfs.io',
        ],
        remotePatterns: [
        {
            protocol: 'https',
            hostname: 'picsum.photos',
            port: '',
        },
        ],
  },};

export default nextConfig;
