import type { Metadata } from "next";
import type { CampoAdmin } from "@/components/admin/FormularioAdmin";
import { FormularioAdmin } from "@/components/admin/FormularioAdmin";
import { salvarTextosLoja } from "@/lib/admin/acoes-textos";
import { exigirAdmin } from "@/lib/admin/guarda";
import { CHAVES_TEXTO, mesclarTextos, MAX_LETRAS_LINHA_TITULO, MAX_LINHAS_TITULO } from "@/lib/loja/textos";

export const metadata: Metadata = { title: "Textos da loja · Painel", robots: { index: false } };

const campos: CampoAdmin[] = [
  {
    nome: "topo_titulo",
    rotulo: "Título do topo da página inicial",
    tipo: "area",
    dica: `Uma palavra ou frase por linha (até ${MAX_LINHAS_TITULO} linhas, ${MAX_LETRAS_LINHA_TITULO} letras cada). A última linha fica em itálico. Se uma linha for comprida, a letra diminui sozinha.`,
  },
  { nome: "topo_subtitulo", rotulo: "Frase abaixo do título", tipo: "area", dica: "Até 200 letras." },
  { nome: "sobre_titulo", rotulo: "Título de “Sobre a marca”", tipo: "texto", dica: "Até 120 letras." },
  { nome: "sobre_texto", rotulo: "Texto de “Sobre a marca”", tipo: "area", dica: "Deixe uma linha em branco para separar parágrafos. Até 1200 letras." },
  { nome: "instagram_titulo", rotulo: "Título da seção do Instagram", tipo: "texto", dica: "Até 100 letras." },
  { nome: "instagram_texto", rotulo: "Texto da seção do Instagram", tipo: "area", dica: "Até 300 letras." },
  { nome: "instagram_usuario", rotulo: "Instagram da loja", tipo: "texto", dica: "Exemplo: @eliclothing_ (pode colar o link do perfil)." },
  { nome: "whatsapp", rotulo: "WhatsApp da loja", tipo: "texto", dica: "Com DDD. Exemplo: (11) 97302-9002." },
];

export default async function TextosLoja() {
  const { supabase } = await exigirAdmin();
  const { data } = await supabase.from("config_loja").select("chave, valor").in("chave", [...CHAVES_TEXTO]);
  const salvos: Record<string, string | null> = {};
  for (const l of data ?? []) salvos[l.chave as string] = l.valor as string | null;
  const iniciais = mesclarTextos(salvos);

  return (
    <div className="max-w-xl">
      <h1 className="text-4xl">Textos da loja</h1>
      <p className="mb-6 mt-2 text-texto-suave">
        Edite os textos da página inicial e os contatos. Para voltar ao texto original de um campo, apague tudo nele e salve.
      </p>
      <FormularioAdmin acao={salvarTextosLoja} campos={campos} iniciais={iniciais} botao="Salvar textos" />
    </div>
  );
}
