#!/usr/bin/env bash
# Roda as migrações + testes num Postgres temporário (precisa do PostgreSQL instalado).
# Uso: bash supabase/tests/rodar.sh
set -euo pipefail
AQUI="$(cd "$(dirname "$0")" && pwd)"
RAIZ="$(cd "$AQUI/../.." && pwd)"
PGBIN="${PGBIN:-$(ls -d /usr/lib/postgresql/*/bin 2>/dev/null | tail -1)}"
DIR="$(mktemp -d)"
PORTA="${PGPORTA:-54329}"
EXEC=""
if [ "$(id -u)" = "0" ]; then chown postgres "$DIR"; EXEC="runuser -u postgres --"; fi
trap '$EXEC "$PGBIN/pg_ctl" -D "$DIR/d" stop -m fast >/dev/null 2>&1 || true; rm -rf "$DIR"' EXIT
$EXEC "$PGBIN/initdb" -D "$DIR/d" -U postgres --auth=trust >/dev/null
$EXEC "$PGBIN/pg_ctl" -D "$DIR/d" -o "-p $PORTA -k $DIR -c listen_addresses=''" -w start >/dev/null
PSQL="$EXEC $PGBIN/psql -h $DIR -p $PORTA -U postgres -d postgres -v ON_ERROR_STOP=1 -q"
cat "$AQUI/_stub_supabase.sql" "$RAIZ"/supabase/migrations/*.sql "$AQUI/banco.test.sql" > "$DIR/tudo.sql"
chmod 644 "$DIR/tudo.sql"
$PSQL -f "$DIR/tudo.sql" 2>&1
