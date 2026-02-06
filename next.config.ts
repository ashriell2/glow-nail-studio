/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com', // Fotoğrafı buradan çekeceğiz
        port: '',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig; // Eğer dosyan .js ise 'module.exports = nextConfig' olabilir, mevcut haline dikkat et.