const isProduction = process.env.NODE_ENV === 'production'

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  trailingSlash: true,
  compiler: {
    removeConsole: isProduction
      ? {
        exclude: ['error', 'warn'],
      }
      : false,
  },
}

export default nextConfig
