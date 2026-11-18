/** @type {import('next').NextConfig} */
const nextConfig = {
  // Image delivery: serve AVIF first (smallest), WebP fallback. Optimized
  // images are cached at the edge for a year so repeat visits are instant.
  images: {
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 31536000,
    deviceSizes: [360, 390, 640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  // Strip the x-powered-by header and keep gzip/br compression on.
  poweredByHeader: false,
  compress: true,
  async redirects() {
    return [
      // Venice moved from its copy-only formula page to the full product page
      { source: "/formulas/venice", destination: "/product", permanent: true },
      { source: "/formulas/hair-cell-nad", destination: "/product/hair-cell-nad", permanent: true },
    ];
  },
};

module.exports = nextConfig;
