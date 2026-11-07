"use client";

export default function ErroGlobal({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="pt-BR">
      <body style={{ fontFamily: "system-ui, sans-serif", background: "#fff7f5", color: "#4a1020", margin: 0, padding: "4rem 1.25rem" }}>
        <main style={{ maxWidth: "40rem", margin: "0 auto" }}>
          <h1>Algo deu errado</h1>
          <p>Não foi possível carregar a loja agora. Tente de novo em instantes.</p>
          <button type="button" onClick={reset} style={{ minHeight: "3rem", padding: "0 2rem", borderRadius: "9999px", border: 0, background: "#6b1f33", color: "#fff", fontWeight: 600, cursor: "pointer" }}>
            Tentar de novo
          </button>
        </main>
      </body>
    </html>
  );
}
