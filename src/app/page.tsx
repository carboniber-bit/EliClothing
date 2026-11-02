import { loja } from "@/lib/loja/config";

// Página provisória: a Tarefa 5 monta a página inicial de verdade.
export default function Home() {
  return (
    <main id="conteudo" className="mx-auto max-w-3xl px-4 py-24 text-center">
      <h1 className="text-4xl">{loja.nome}</h1>
      <p className="mt-4 text-texto-suave">{loja.slogan}</p>
    </main>
  );
}
