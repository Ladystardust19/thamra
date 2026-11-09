/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      // Venice moved from its copy-only formula page to the full product page
      { source: "/formulas/venice", destination: "/product", permanent: true },
    ];
  },
};

module.exports = nextConfig;
