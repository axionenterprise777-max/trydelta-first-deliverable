#!/usr/bin/env bash
set -euo pipefail

: "${APP_ROOT:?APP_ROOT is required}"

cd "$APP_ROOT"

echo "== Processes (node) =="
ps aux | egrep 'lsnode|node' | grep -v egrep || true

echo
echo "== Listening ports (node) =="
if command -v ss >/dev/null 2>&1; then
  ss -lntp | grep -i node || true
elif command -v netstat >/dev/null 2>&1; then
  netstat -lntp 2>/dev/null | grep -i node || true
fi

echo
echo "== Health (127.0.0.1:${PORT:-<unset>}/health) =="
if [ -n "${PORT:-}" ] && command -v curl >/dev/null 2>&1; then
  curl -fsS "http://127.0.0.1:${PORT}/health" || true
else
  echo "Skip health: set PORT and have curl available."
fi

echo
echo "== Logs (common cPanel paths) =="
tail -n 200 "$HOME/logs/error_log" 2>/dev/null || true
tail -n 200 "$APP_ROOT/passenger.log" 2>/dev/null || true
