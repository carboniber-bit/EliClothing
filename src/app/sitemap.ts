import type { MetadataRoute } from "next";
import { obterRepositorio } from "@/lib/catalogo/repositorio";
import { urlDoSite } from "@/lib/site";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = urlDoSite();
  const repo = obterRepositorio();
  const [produtos, colecoes, categorias] = await Promise.all([repo.listarProdutos(), repo.listarColecoes(), repo.listarCategorias()]);
  return [
    { url: `${base}/`, priority: 1 },
    { url: `${base}/catalogo`, priority: 0.9 },
    ...produtos.map((p) => ({ url: `${base}/produto/${p.slug}`, priority: 0.8 })),
    ...colecoes.map((c) => ({ url: `${base}/colecoes/${c.slug}`, priority: 0.6 })),
    ...categorias.map((c) => ({ url: `${base}/categoria/${c.slug}`, priority: 0.6 })),
    { url: `${base}/privacidade`, priority: 0.2 },
    { url: `${base}/termos`, priority: 0.2 },
  ];
}
