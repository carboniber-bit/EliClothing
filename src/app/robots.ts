import type { MetadataRoute } from "next";
import { urlDoSite } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/admin", "/api", "/conta", "/carrinho", "/finalizar", "/pagamento", "/entrar", "/cadastrar", "/nova-senha", "/recuperar-senha"] }],
    sitemap: `${urlDoSite()}/sitemap.xml`,
  };
}
