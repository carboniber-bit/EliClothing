import type { Metadata } from "next";
import { BotaoPapel } from "@/components/admin/BotaoPapel";
import { definirPapel } from "@/lib/admin/acoes-equipe";
import { exigirAdmin } from "@/lib/admin/guarda";

export const metadata: Metadata = { title: "Equipe · Painel", robots: { index: false } };

type Perfil = { id: string; email: string | null; nome: string | null; role: "cliente" | "admin"; criado_em: string };

export default async function Equipe() {
  const { supabase, usuario } = await exigirAdmin();
  const { data } = await supabase.from("perfis").select("id, email, nome, role, criado_em").order("role").order("criado_em", { ascending: false }).limit(200);
  const perfis = (data ?? []) as Perfil[];
  const admins = perfis.filter((p) => p.role === "admin");
  const clientes = perfis.filter((p) => p.role !== "admin");

  const linha = (p: Perfil) => (
    <li key={p.id} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-borda bg-superficie p-4">
      <span className="min-w-0 [overflow-wrap:anywhere]">
        <span className="font-semibold">{p.nome || p.email || "Sem nome"}</span>
        {p.id === usuario.id ? <span className="ml-2 text-sm text-texto-suave">(você)</span> : null}
        <span className="block text-sm text-texto-suave">{p.email}</span>
      </span>
      {p.id === usuario.id ? null : p.role === "admin" ? (
        <BotaoPapel
          acao={definirPapel.bind(null, p.id, "cliente")}
          rotulo="Remover acesso ao painel"
          pergunta={`Remover o acesso de ${p.email ?? "esta pessoa"} ao painel da loja?`}
        />
      ) : (
        <BotaoPapel
          acao={definirPapel.bind(null, p.id, "admin")}
          rotulo="Dar acesso ao painel"
          pergunta={`Dar acesso total ao painel da loja para ${p.email ?? "esta pessoa"}? Ela poderá mudar produtos, pedidos e equipe.`}
        />
      )}
    </li>
  );

  return (
    <div className="max-w-2xl">
      <h1 className="text-4xl">Equipe</h1>
      <p className="mb-6 mt-2 text-texto-suave">Quem pode entrar no painel. A pessoa precisa primeiro criar uma conta na loja; depois ela aparece aqui em “Clientes”.</p>
      <h2 className="mb-3 text-2xl">Administradores</h2>
      <ul className="space-y-3">{admins.map(linha)}</ul>
      <h2 className="mb-3 mt-10 text-2xl">Clientes cadastradas</h2>
      {clientes.length === 0 ? <p className="rounded-2xl border border-borda bg-superficie p-4 text-sm">Ninguém além da equipe criou conta ainda.</p> : <ul className="space-y-3">{clientes.map(linha)}</ul>}
    </div>
  );
}
