import { Botao } from "@/components/ui/Botao";

export default function NaoEncontrada() {
  return (
    <div className="mx-auto max-w-xl px-4 py-24 text-center">
      <h1 className="text-4xl">Página não encontrada</h1>
      <p className="mt-3 text-texto-suave">
        Não encontramos o que você procurava. Que tal voltar para o início?
      </p>
      <div className="mt-8 flex justify-center">
        <Botao href="/">Voltar para o início</Botao>
      </div>
    </div>
  );
}
