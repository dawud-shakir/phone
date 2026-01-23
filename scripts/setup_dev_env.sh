#!/usr/bin/env bash
set -euo pipefail

# Lightweight developer troubleshooting / setup helper for this repo
# Usage:
#   bash scripts/setup_dev_env.sh [command]
# Commands:
#   deps        - install root & backend npm deps
#   ios-pods    - install CocoaPods (uses clean helper if present)
#   android     - set local sdk path and print JAVA_HOME tips
#   start-backend - start backend in background
#   metro       - start Metro bundler in background (if not running)
#   start-all   - run deps, ios-pods, android, start-backend, metro
#   help        - show help

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$REPO_ROOT"

info() { echo "[INFO] $*"; }
warn() { echo "[WARN] $*"; }
err() { echo "[ERROR] $*" >&2; }

ensure_deps() {
  if [ ! -d node_modules ]; then
    info "Installing root dependencies..."
    npm install
  else
    info "Root dependencies appear installed."
  fi

  if [ -d backend ]; then
    if [ ! -d backend/node_modules ]; then
      info "Installing backend dependencies..."
      (cd backend && npm install)
    else
      info "Backend dependencies appear installed."
    fi
  fi
}

install_ios_pods() {
  # If there's a repo helper, use it
  if [ -x "./scripts/ios/run_pod_install_clean.sh" ]; then
    info "Using repository helper to run CocoaPods in a clean environment..."
    bash ./scripts/ios/run_pod_install_clean.sh
    return
  fi

  if command -v conda >/dev/null && [ -n "${CONDA_PREFIX:-}" ]; then
    warn "Conda is active. It's recommended to 'conda deactivate' before running pod install."
  fi

  if ! command -v pod >/dev/null; then
    err "CocoaPods (pod) not found in PATH. Install CocoaPods (gem install cocoapods or via Homebrew)"
    return 1
  fi

  info "Running 'pod install' in ios (using minimal env)..."
  env -i LANG=en_US.UTF-8 PATH=/usr/local/bin:/Applications/Xcode.app/Contents/Developer/usr/bin:/usr/bin:/bin pod install --repo-update --project-directory=ios
}

android_setup() {
  sdk_dir="${ANDROID_HOME:-$HOME/Library/Android/sdk}"
  mkdir -p android
  echo "sdk.dir=$sdk_dir" > android/local.properties
  info "Wrote android/local.properties -> $sdk_dir"

  if command -v java >/dev/null; then
    info "Java version: $(java -version 2>&1 | head -n1)"
  else
    warn "Java not found. Install a compatible JDK (Temurin 17 recommended)."
  fi

  info "If building Android, set JAVA_HOME to a JDK 17 installation, for example:"
  echo "  export JAVA_HOME=/Library/Java/JavaVirtualMachines/temurin-17.jdk/Contents/Home"
  echo "  export ANDROID_HOME=$sdk_dir"
}

start_backend() {
  if [ -d backend ]; then
    info "Starting backend in background (logs -> backend/server.log)..."
    (cd backend && nohup npm start > server.log 2>&1 &)
    info "Backend started. Check 'curl http://localhost:3000/api/health' to verify."
  else
    err "No backend directory found."
  fi
}

start_metro() {
  if lsof -i :8081 >/dev/null 2>&1; then
    info "Metro appears to already be running on port 8081."
  else
    info "Starting Metro (npm start) in background..."
    npm start --silent &
  fi
}

usage() {
  sed -n '1,200p' "${BASH_SOURCE[0]}" | sed -n '1,120p'
}

case "${1:-help}" in
  deps)
    ensure_deps
    ;;
  ios-pods)
    install_ios_pods
    ;;
  android)
    android_setup
    ;;
  start-backend)
    start_backend
    ;;
  metro)
    start_metro
    ;;
  start-all)
    ensure_deps
    install_ios_pods || true
    android_setup
    start_backend
    start_metro
    ;;
  help|*)
    usage
    ;;
esac

exit 0
