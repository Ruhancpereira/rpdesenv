/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ["lenis"],
  // Para GitHub Pages (export estático)
  // Descomente as linhas abaixo se for usar GitHub Pages:
  // output: 'export',
  // images: {
  //   unoptimized: true
  // }
}

module.exports = nextConfig

