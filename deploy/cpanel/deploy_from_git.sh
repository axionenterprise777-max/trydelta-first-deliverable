#!/usr/bin/env bash
# Deploy rodando 100% no servidor: clone/pull do GitHub e build local.
# Uso: export APP_ROOT NODE_APP_NAME NODE_VERSION GIT_REPO GIT_BRANCH APP_PATH; bash deploy_from_git.sh
# Ou: bash deploy_from_git.sh (lÃª .env em APP_ROOT se existir)
set -euo pipefail

: "${APP_ROOT:?APP_ROOT is required}"
: "${NODE_APP_NAME:?NODE_APP_NAME is required}"
: "${NODE_VERSION:?NODE_VERSION is required}"
: "${GIT_REPO:?GIT_REPO is required}"
: "${APP_PATH:?APP_PATH is required (e.g. apps/axion-dev)}"

GIT_BRANCH="${GIT_BRANCH:-main}"
CLONE_DEPTH="${CLONE_DEPTH:-1}"
TMP_DIR="${TMP_DIR:-}"
REPO_DIR=""

cleanup() {
  if [ -n "$TMP_DIR" ] && [ -d "$TMP_DIR" ]; then
    rm -rf "$TMP_DIR"
  fi
}
trap cleanup EXIT

TMP_DIR=$(mktemp -d)
REPO_DIR="$TMP_DIR/repo"
mkdir -p "$(dirname "$REPO_DIR")"

echo "[deploy_from_git] Clonando $GIT_REPO (branch $GIT_BRANCH, depth $CLONE_DEPTH)..."
for attempt in 1 2 3 4 5; do
  if git clone --depth "$CLONE_DEPTH" --branch "$GIT_BRANCH" --single-branch "$GIT_REPO" "$REPO_DIR" 2>/dev/null; then
    break
  fi
  echo "[deploy_from_git] Tentativa $attempt falhou, aguardando 5s..."
  sleep 5
done

if [ ! -d "$REPO_DIR/$APP_PATH" ]; then
  echo "[deploy_from_git] ERRO: $APP_PATH nao encontrado no repo." >&2
  exit 1
fi

echo "[deploy_from_git] Copiando $APP_PATH -> $APP_ROOT (preservando .env)..."
mkdir -p "$APP_ROOT"
# Preservar .env e data/ se existirem
BACKUP_ENV=""
[ -f "$APP_ROOT/.env" ] && BACKUP_ENV=$(mktemp) && cp -a "$APP_ROOT/.env" "$BACKUP_ENV"
BACKUP_DATA=""
[ -d "$APP_ROOT/data" ] && BACKUP_DATA="$TMP_DIR/data_backup" && cp -a "$APP_ROOT/data" "$BACKUP_DATA"

# Limpar destino (exceto deploy/cpanel para nao apagar scripts)
rm -rf "$APP_ROOT/src" "$APP_ROOT/public" "$APP_ROOT/server" "$APP_ROOT/scripts" \
  "$APP_ROOT/webapp" "$APP_ROOT/dist" "$APP_ROOT/node_modules" 2>/dev/null || true
rm -f "$APP_ROOT/package.json" "$APP_ROOT/package-lock.json" "$APP_ROOT/index.html" \
  "$APP_ROOT/app.js" "$APP_ROOT/server.js" "$APP_ROOT/vite.config.js" 2>/dev/null || true

# Copiar do repo (rsync se existir, senao cp com dotglob)
if command -v rsync >/dev/null 2>&1; then
  rsync -a --exclude='.git' "$REPO_DIR/$APP_PATH/" "$APP_ROOT/"
else
  ( shopt -s dotglob 2>/dev/null; cp -a "$REPO_DIR/$APP_PATH"/* "$APP_ROOT/" ) 2>/dev/null || \
  ( cd "$REPO_DIR/$APP_PATH" && tar cf - . | ( cd "$APP_ROOT" && tar xf - ) )
fi

# Copiar deploy.sh do monorepo para APP_ROOT/deploy/cpanel/
DEPLOY_SH_SRC="$REPO_DIR/Codex/axion-deploy/cpanel/deploy.sh"
if [ -f "$DEPLOY_SH_SRC" ]; then
  mkdir -p "$APP_ROOT/deploy/cpanel"
  cp -a "$DEPLOY_SH_SRC" "$APP_ROOT/deploy/cpanel/deploy.sh"
  chmod +x "$APP_ROOT/deploy/cpanel/deploy.sh"
fi

# Restaurar .env e data/
[ -n "$BACKUP_ENV" ] && [ -f "$BACKUP_ENV" ] && mv "$BACKUP_ENV" "$APP_ROOT/.env"
[ -n "$BACKUP_DATA" ] && [ -d "$BACKUP_DATA" ] && rm -rf "$APP_ROOT/data" && mv "$BACKUP_DATA" "$APP_ROOT/data"

echo "[deploy_from_git] Executando deploy.sh no servidor..."
cd "$APP_ROOT"
export APP_ROOT NODE_APP_NAME NODE_VERSION
bash ./deploy/cpanel/deploy.sh

echo "[deploy_from_git] Deploy concluido."
