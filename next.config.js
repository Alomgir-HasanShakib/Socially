module.exports = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'utfs.io',
        port: '', // Leave empty for default ports (80 for HTTP, 443 for HTTPS)
        pathname: '/**', // Allow all paths under this domain
      },
    ],
  },
}