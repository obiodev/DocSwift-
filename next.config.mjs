/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ["pdf2json", "mammoth", "docx", "pdfjs-dist"],
};

export default nextConfig;
