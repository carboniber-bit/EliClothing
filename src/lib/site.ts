/** Endereço público do site (sem barra no final), para sitemap, links absolutos e metadados. */
export function urlDoSite(): string {
  const fixo = process.env.NEXT_PUBLIC_SITE_URL?.trim().replace(/\/+$/, "");
  if (fixo) return fixo;
  const vercel = process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim();
  if (vercel) return `https://${vercel}`;
  return "http://localhost:3000";
}
