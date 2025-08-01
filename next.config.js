/** @type {import('next').NextConfig} */
const nextConfig = {
    eslint: {
      // Desabilita ESLint durante o build
      ignoreDuringBuilds: true,
    },
    typescript: {
      // Desabilita verificação de TypeScript durante o build
      ignoreBuildErrors: true,
    }
  }
  
  module.exports = nextConfig