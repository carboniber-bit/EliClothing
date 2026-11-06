import { ROTULO_STATUS, type StatusPedido } from "@/lib/pedidos/status";

export function EtiquetaStatus({ status }: { status: StatusPedido }) {
  const encerrado = status === "cancelado" || status === "expirado";
  return (
    <span
      className={`inline-block rounded-full border px-3 py-1 text-xs font-semibold ${
        encerrado ? "border-erro text-erro" : "border-primario text-texto"
      }`}
    >
      {ROTULO_STATUS[status]}
    </span>
  );
}
