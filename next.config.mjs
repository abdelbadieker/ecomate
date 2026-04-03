import createNextIntlPlugin from 'next-intl/plugin';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// app is at root, so request.ts is at ./i18n/request.ts
const configPath = path.resolve(__dirname, './i18n/request.ts');
const withNextIntl = createNextIntlPlugin(configPath);

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '*.supabase.co' },
      { protocol: 'https', hostname: 'avatars.githubusercontent.com' },
    ],
  },
};

export default withNextIntl(nextConfig);
