import completo from "@/assets/logo-completo.png";

/**
 * Logotipo da EliClothing (ramo, ELI e CLOTHING, sem o telefone).
 * É desenhado como máscara: a cor vem do texto ao redor, então funciona no tema claro e no escuro.
 */
export function Marca({ className = "w-28" }: { className?: string }) {
  const url = `url(${completo.src})`;
  return (
    <span
      role="img"
      aria-label="EliClothing"
      className={`inline-block bg-current ${className}`}
      style={{
        aspectRatio: `${completo.width} / ${completo.height}`,
        maskImage: url,
        WebkitMaskImage: url,
        maskSize: "contain",
        WebkitMaskSize: "contain",
        maskRepeat: "no-repeat",
        WebkitMaskRepeat: "no-repeat",
        maskPosition: "center",
        WebkitMaskPosition: "center",
      }}
    />
  );
}
