#!/usr/bin/env bash
set -eu
set -o pipefail

# Safe defaults: never echo secrets, fail on missing required env.
: "${APP_ROOT:?APP_ROOT is required}"
: "${NODE_APP_NAME:?NODE_APP_NAME is required}"
: "${NODE_VERSION:?NODE_VERSION is required}"

cd "$APP_ROOT"

# Only attempt git operations when the app is actually a repo.
if [ -d .git ] && command -v git >/dev/null 2>&1; then
  git pull || true
fi

# cPanel's Node.js app env activation (may not exist depending on hosting).
if [ -f "$HOME/nodevenv/$NODE_APP_NAME/$NODE_VERSION/bin/activate" ]; then
  # shellcheck disable=SC1090
  # Some cPanel activate scripts are not compatible with `set -u` (nounset).
  set +u
  source "$HOME/nodevenv/$NODE_APP_NAME/$NODE_VERSION/bin/activate" || true
  set -u
fi

# Decide whether we need a frontend build (Vite, etc.).
# If we do, force-install devDependencies even when NODE_ENV=production,
# otherwise `npm` may omit Vite and `npm run build` will fail.
WILL_BUILD=0
if [ "${SKIP_BUILD:-}" != "1" ]; then
  if node -e '
const fs=require("fs");
const hasBuild=(pkg)=>!!(pkg && pkg.scripts && pkg.scripts.build);
const hasBuildTool=(pkg)=>{
  const d=Object.assign({}, pkg?.dependencies||{}, pkg?.devDependencies||{});
  return !!(d.vite || d["@vitejs/plugin-react"] || d["@vitejs/plugin-vue"] || d.next);
};
const root=JSON.parse(fs.readFileSync("./package.json","utf8"));
let ok = hasBuild(root) && hasBuildTool(root);
if (!ok && fs.existsSync("./frontend/package.json")) {
  const fe=JSON.parse(fs.readFileSync("./frontend/package.json","utf8"));
  ok = hasBuild(root) && (hasBuildTool(fe) || hasBuildTool(root));
}
process.exit(ok ? 0 : 1);
'; then
    WILL_BUILD=1
  fi
fi

INSTALL_ARGS=()
if [ "$WILL_BUILD" = "1" ]; then
  INSTALL_ARGS+=(--production=false)
fi

if [ -f package-lock.json ]; then
  npm ci "${INSTALL_ARGS[@]}"
else
  npm install "${INSTALL_ARGS[@]}"
fi

if [ "$WILL_BUILD" = "1" ]; then
  echo "Running build..."
  npm run build
fi

mkdir -p tmp
touch tmp/restart.txt

echo "Deploy done (Passenger restart triggered)."
