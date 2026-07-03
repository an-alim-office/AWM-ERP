/** @type {import('next').NextConfig} */

const nextConfig = {
  reactStrictMode: true,

  // ✅ App Router enabled (default in Next 14)
  

  // ✅ Image optimization
  images: {
    domains: ["localhost"],
  },

  // ✅ Environment variables
  env: {
    APP_NAME: "AWM ERP",
    APP_VERSION: "2.0.0",
  },

  // ✅ Custom headers (security)
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-Frame-Options",
            value: "SAMEORIGIN",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
        ],
      },
    ];
  },

  // ✅ Redirect example (optional)
  async redirects() {
    return [
      {
        source: "/",
        destination: "/auth/login",
        permanent: false,
      },
    ];
  },

  // ✅ Webpack customization (Fixed to resolve fs error)
  webpack(config, { isServer }) {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
      };
    }
    return config;
  },
};

module.exports = nextConfig;