import type { NextConfig } from "next";

// Fotos dos produtos ficam no Storage público do Supabase; o Next precisa saber esse endereço.
const enderecoSupabase = process.env.NEXT_PUBLIC_SUPABASE_URL;
let hostSupabase: string | null = null;
try {
  hostSupabase = enderecoSupabase ? new URL(enderecoSupabase).hostname : null;
} catch {
  hostSupabase = null;
}

const nextConfig: NextConfig = {
  images: {
    remotePatterns: hostSupabase
      ? [{ protocol: "https", hostname: hostSupabase, pathname: "/storage/v1/object/public/produtos/**" }]
      : [],
  },
  /* config options here */
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
