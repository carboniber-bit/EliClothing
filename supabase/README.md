# Banco de dados (Supabase)

- `migrations/` — arquivos numerados, em ordem. `instalar-banco.sql` = todas juntas (projeto NOVO). Para um banco já instalado, rode só a migração nova (ex.: `atualizar-0005.sql`).
  Ao mudar uma migração, regenere com: `cat supabase/migrations/*.sql` (mantendo o cabeçalho do arquivo atual).
- `tests/` — testes de RLS/estoque/pedidos. Rodam num PostgreSQL temporário: `bash supabase/tests/rodar.sh`
  (o `_stub_supabase.sql` só imita o Supabase; **não** vai para o Supabase de verdade).
- Segredos nunca ficam aqui.
