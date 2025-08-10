#!/usr/bin/env bash
set -euo pipefail

log() { printf "\033[1;34m›\033[0m %s\n" "$*"; }

# Resolve script dir and project root
GIT_NODE_SCRIPT="$(dirname "$HOME/.zsh/scripts/git/scripts")"
EXECUTION_DIR="$(pwd)"


navigate_to_project() {
  if [[ "$(pwd)" == "$GIT_NODE_SCRIPT" ]]; then
    return 0
  fi
  log "cd $GIT_NODE_SCRIPT"
  cd "$GIT_NODE_SCRIPT"
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

  cd "$EXECUTION_DIR"
  node "$GIT_NODE_SCRIPT/_dist/executables/git-checkout/index.js"
}

main "$@"