import type { Metadata } from "next";
import Link from "next/link";
import { exigirAdmin } from "@/lib/admin/guarda";
import { camposAlterados, tituloDoRegistro } from "@/lib/admin/historico";
import { ROTULO_OPERACAO, ROTULO_TABELA } from "@/lib/pedidos/status";

export const metadata: Metadata = { title: "Histórico · Painel", robots: { index: false } };

type Evento = {
  id: number; quando: string; usuario_id: string | null; origem: string; tabela: string; operacao: string;
  antes: Record<string, unknown> | null; depois: Record<string, unknown> | null;
};

const data = new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short", timeZone: "America/Sao_Paulo" });

export default async function Historico({ searchParams }: PageProps<"/admin/historico">) {
  const buscas = await searchParams;
  const bruto = Array.isArray(buscas.tabela) ? buscas.tabela[0] : buscas.tabela;
  const filtro = bruto && bruto in ROTULO_TABELA ? bruto : null;
  const { supabase } = await exigirAdmin();

  let consulta = supabase.from("auditoria").select("id, quando, usuario_id, origem, tabela, operacao, antes, depois").order("quando", { ascending: false }).limit(100);
  if (filtro) consulta = consulta.eq("tabela", filtro);
  const [{ data: eventosBrutos }, { data: perfisBrutos }] = await Promise.all([consulta, supabase.from("perfis").select("id, email, nome").eq("role", "admin")]);
  const eventos = (eventosBrutos ?? []) as Evento[];
  const quem = new Map(((perfisBrutos ?? []) as { id: string; email: string | null; nome: string | null }[]).map((p) => [p.id, p.nome || p.email || "Equipe"]));

  return (
    <>
      <h1 className="text-4xl">Histórico de alterações</h1>
      <p className="mb-5 mt-2 text-texto-suave">As 100 últimas alterações feitas na loja: quem mudou, o quê e quando.</p>
      <nav aria-label="Filtrar por tipo" className="mb-6 flex flex-wrap gap-2">
        {[null, ...Object.keys(ROTULO_TABELA)].map((t) => (
          <Link
            key={t ?? "todos"}
            href={t ? `/admin/historico?tabela=${t}` : "/admin/historico"}
            aria-current={t === filtro ? "page" : undefined}
            className={`inline-flex min-h-11 items-center rounded-full border px-4 text-sm font-semibold ${
              t === filtro ? "border-primario bg-primario text-primario-texto" : "border-borda bg-superficie hover:bg-acento/30"
            }`}
          >
            {t ? ROTULO_TABELA[t] : "Tudo"}
          </Link>
        ))}
      </nav>
      {eventos.length === 0 ? (
        <p className="rounded-2xl border border-borda bg-superficie p-5 text-sm">Nenhuma alteração registrada.</p>
      ) : (
        <ul className="space-y-2">
          {eventos.map((e) => {
            const campos = camposAlterados(e.antes, e.depois);
            const autor = e.usuario_id ? (quem.get(e.usuario_id) ?? "Cliente") : e.origem === "painel" ? "Equipe" : "Sistema";
            return (
              <li key={e.id} className="rounded-2xl border border-borda bg-superficie p-3 text-sm [overflow-wrap:anywhere]">
                <span className="text-texto-suave">{data.format(new Date(e.quando))}</span> — <strong>{autor}</strong> {ROTULO_OPERACAO[e.operacao]?.toLowerCase() ?? e.operacao}{" "}
                {ROTULO_TABELA[e.tabela]?.toLowerCase() ?? e.tabela} <strong>{tituloDoRegistro(e.tabela, e.antes, e.depois)}</strong>
                {campos.length > 0 ? <span className="text-texto-suave"> (mudou: {campos.join(", ")})</span> : null}
                {e.origem !== "painel" && e.origem !== "sistema" ? <span className="text-texto-suave"> · via {e.origem}</span> : null}
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}
