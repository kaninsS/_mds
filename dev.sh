#!/bin/bash

# =============================================================================
# MDS Marketplace – Dev Launcher (macOS)
# =============================================================================
# Use this script to quickly open 3 terminal windows for the dev environments.
# =============================================================================

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Function to run a command in a new Terminal window
run_in_terminal() {
    local dir=$1
    local cmd=$2
    local label=$3
    
    echo "Starting $label..."
    osascript <<EOF
    tell application "Terminal"
        do script "cd '$dir' && $cmd"
    end tell
EOF
}

# 1. Backend
run_in_terminal "$ROOT_DIR/backend" "npm run dev" "Medusa Backend"

# 2. Customer Store
# Note: install.sh suggests 'yarn dev' for customer-store
run_in_terminal "$ROOT_DIR/customer-store" "yarn dev" "Storefront"

# 3. Vendor Dashboard
run_in_terminal "$ROOT_DIR/vendor-dashboard" "npm run dev" "Vendor Dashboard"

echo "--------------------------------------------------"
echo "All services initiated in separate windows."
echo "Check your Terminal apps."
