#!/usr/bin/env bash
set -euo pipefail

log() { printf "\033[1;34m›\033[0m %s\n" "$*"; }

# Resolve script dir and project root
SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" &>/dev/null && pwd)"
PROJECT_ROOT="$(git -C "$SCRIPT_DIR" rev-parse --show-toplevel 2>/dev/null || true)"
PROJECT_ROOT="${PROJECT_ROOT:-$SCRIPT_DIR}"

navigate_to_project() {
  if [[ "$(pwd)" == "$PROJECT_ROOT" ]]; then
    return 0
  fi
  log "cd $PROJECT_ROOT"
  cd "$PROJECT_ROOT"
}

install_dependencies() {
  [[ -d "node_modules" ]] && return 0

  if [[ -f package-lock.json ]]; then
    log "Installing dependencies (npm ci)…"
    npm ci
    return
  fi

  log "Installing dependencies (npm install)…"
  npm install
}

build_project() {
  [[ -d "_dist" ]] && return 0

  log "Building project (npm run build)…"
  npm run build
}

main() {
  navigate_to_project
  install_dependencies
  build_project

  local entry="_dist/executables/git-checkout/index.js"
  [[ -f "$entry" ]] || { echo "❌ Entry not found: $entry" >&2; exit 1; }

  log "Running app: node $entry"
  node "$entry"
}

main "$@"