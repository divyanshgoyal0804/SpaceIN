import type { NextConfig } from "next";

const remotePatterns: NonNullable<NextConfig["images"]>["remotePatterns"] = [
  {
    protocol: 'https',
    hostname: 'images.unsplash.com',
  },
  {
    protocol: 'https',
    hostname: 'res.cloudinary.com',
  },
  {
    protocol: 'https',
    hostname: 'ideal-surprise-production.up.railway.app',
  },
];

const appUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXTAUTH_URL;

if (appUrl) {
  try {
    const parsed = new URL(appUrl);
    remotePatterns.push({
      protocol: parsed.protocol.replace(':', '') as 'http' | 'https',
      hostname: parsed.hostname,
      ...(parsed.port ? { port: parsed.port } : {}),
    });
  } catch {
    // Ignore invalid app URL values in build environments.
  }
}

const nextConfig: NextConfig = {
  images: {
    remotePatterns,
    unoptimized: true,
  },
};

export default nextConfig;
