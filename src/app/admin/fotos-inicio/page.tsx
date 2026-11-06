import type { Metadata } from "next";
import { TrocarFotoSite } from "@/components/admin/TrocarFotoSite";
import { registrarImagemSite, removerImagemSite } from "@/lib/admin/acoes-imagens-site";
import { exigirAdmin } from "@/lib/admin/guarda";
import { PADROES_IMAGEM } from "@/lib/loja/imagens-padrao";
import { CHAVES_IMAGEM, SLOTS_IMAGEM, urlImagemSite } from "@/lib/loja/imagens";
import { configSupabase } from "@/lib/supabase/config";

export const metadata: Metadata = { title: "Fotos da página inicial · Painel", robots: { index: false } };

export default async function FotosInicio() {
  const { supabase } = await exigirAdmin();
  const { data } = await supabase.from("config_loja").select("chave, valor").in("chave", CHAVES_IMAGEM);
  const salvos: Record<string, string | null> = {};
  for (const l of data ?? []) salvos[l.chave as string] = l.valor as string | null;
  const base = configSupabase()?.url ?? null;

  return (
    <div className="max-w-xl">
      <h1 className="text-4xl">Fotos da página inicial</h1>
      <p className="mb-6 mt-2 text-texto-suave">
        Troque as fotos que aparecem na página inicial. As fotos são reduzidas automaticamente. Para voltar à original, use “Voltar à foto original”.
      </p>
      <div className="space-y-4">
        {SLOTS_IMAGEM.map((slot) => {
          const enviada = urlImagemSite(base, slot.chave, salvos[slot.chave]);
          return (
            <TrocarFotoSite
              key={slot.chave}
              chave={slot.chave}
              rotulo={slot.rotulo}
              dica={slot.dica}
              urlAtual={enviada ?? PADROES_IMAGEM[slot.chave].src}
              personalizada={enviada !== null}
              registrar={registrarImagemSite}
              remover={removerImagemSite}
            />
          );
        })}
      </div>
    </div>
  );
}
