/** @type {import('next').NextConfig} */
const nextConfig = {
  // Heavy server-only packages — never bundled into client JS
  serverExternalPackages: ["mammoth", "docx", "pdfjs-dist"],

  // Security & performance
  poweredByHeader: false,
  compress: true,

  // HTTP security headers
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options",    value: "nosniff" },
          { key: "X-Frame-Options",           value: "DENY" },
          { key: "X-XSS-Protection",          value: "1; mode=block" },
          { key: "Referrer-Policy",           value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy",        value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
    ];
  },
};

export default nextConfig;
