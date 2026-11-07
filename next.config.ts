import type { NextConfig } from "next";

// Fotos dos produtos ficam no Storage público do Supabase; o Next precisa saber esse endereço.
const enderecoSupabase = process.env.NEXT_PUBLIC_SUPABASE_URL;
let hostSupabase: string | null = null;
try {
  hostSupabase = enderecoSupabase ? new URL(enderecoSupabase).hostname : null;
} catch {
  hostSupabase = null;
}

const producao = process.env.NODE_ENV === "production";
const origemSupabase = hostSupabase ? ` https://${hostSupabase}` : "";

// Política de conteúdo: só carrega scripts, imagens e conexões das origens que a loja usa.
// 'unsafe-inline' em scripts é necessário para o Next e para o script do tema; 'unsafe-eval' só no modo de desenvolvimento.
const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${producao ? "" : " 'unsafe-eval'"}`,
  "style-src 'self' 'unsafe-inline'",
  `img-src 'self' data: blob:${origemSupabase}`,
  "font-src 'self' data:",
  `connect-src 'self'${origemSupabase}${producao ? "" : " ws: wss:"}`,
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  ...(producao ? ["upgrade-insecure-requests"] : []),
].join("; ");

const cabecalhosDeSeguranca = [
  { key: "Content-Security-Policy", value: csp },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=(), usb=()" },
  { key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains" },
];

const nextConfig: NextConfig = {
  async headers() {
    return [{ source: "/:path*", headers: cabecalhosDeSeguranca }];
  },
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
