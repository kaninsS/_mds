#!/usr/bin/env bash
# =============================================================================
# MDS Marketplace – macOS Auto Installer
# =============================================================================
# Usage:
#   chmod +x install.sh
#   ./install.sh
# =============================================================================

set -e

# ─── Colors ──────────────────────────────────────────────────────────────────
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m' # No Color

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

log()    { echo -e "${CYAN}[INFO]${NC}  $1"; }
success(){ echo -e "${GREEN}[OK]${NC}    $1"; }
warn()   { echo -e "${YELLOW}[WARN]${NC}  $1"; }
error()  { echo -e "${RED}[ERROR]${NC} $1"; exit 1; }
header() { echo -e "\n${BOLD}${CYAN}══════════════════════════════════════${NC}"; echo -e "${BOLD}${CYAN}  $1${NC}"; echo -e "${BOLD}${CYAN}══════════════════════════════════════${NC}\n"; }

# ─── Homebrew ─────────────────────────────────────────────────────────────────
header "Step 1: Homebrew"
if command -v brew &>/dev/null; then
  success "Homebrew already installed ($(brew --version | head -1))"
else
  log "Installing Homebrew..."
  /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
  # Add brew to PATH for Apple Silicon Macs
  if [[ -f /opt/homebrew/bin/brew ]]; then
    eval "$(/opt/homebrew/bin/brew shellenv)"
  fi
  success "Homebrew installed"
fi

# ─── Node.js ──────────────────────────────────────────────────────────────────
header "Step 2: Node.js"
if command -v node &>/dev/null; then
  NODE_VERSION=$(node --version | sed 's/v//')
  MAJOR=$(echo "$NODE_VERSION" | cut -d. -f1)
  if [ "$MAJOR" -ge 20 ]; then
    success "Node.js $NODE_VERSION already installed (>= 20)"
  else
    warn "Node.js $NODE_VERSION found but project needs >= 20"
    log "Installing Node.js 20 via Homebrew..."
    brew install node@20
    brew link node@20 --force --overwrite
    success "Node.js 20 installed"
  fi
else
  log "Installing Node.js 20..."
  brew install node@20
  brew link node@20 --force --overwrite
  success "Node.js 20 installed"
fi

# ─── npm ──────────────────────────────────────────────────────────────────────
header "Step 3: npm"
log "Upgrading npm to latest..."
npm install -g npm@latest --quiet
success "npm $(npm --version) ready"

# ─── Yarn (via corepack) ──────────────────────────────────────────────────────
header "Step 4: Yarn"
if command -v yarn &>/dev/null; then
  success "Yarn already installed ($(yarn --version))"
else
  log "Enabling corepack and preparing Yarn 4.12.0..."
  corepack enable
  corepack prepare yarn@4.12.0 --activate
  success "Yarn $(yarn --version) ready"
fi

# ─── PostgreSQL ───────────────────────────────────────────────────────────────
header "Step 5: PostgreSQL"
if brew services list | grep -q "postgresql"; then
  success "PostgreSQL already installed"
else
  log "Installing PostgreSQL 16..."
  brew install postgresql@16
fi
log "Starting PostgreSQL service..."
brew services start postgresql@16 2>/dev/null || true
sleep 2

# Create database if it doesn't exist
if psql -lqt 2>/dev/null | cut -d \| -f 1 | grep -qw "medusa-v2"; then
  success "Database 'medusa-v2' already exists"
else
  log "Creating database 'medusa-v2'..."
  createdb medusa-v2
  success "Database 'medusa-v2' created"
fi

# ─── Redis ────────────────────────────────────────────────────────────────────
header "Step 6: Redis"
if brew list redis &>/dev/null; then
  success "Redis already installed"
else
  log "Installing Redis..."
  brew install redis
fi
log "Starting Redis service..."
brew services start redis 2>/dev/null || true
success "Redis running"

# ─── Backend ──────────────────────────────────────────────────────────────────
header "Step 7: Backend (MedusaJS)"
cd "$ROOT_DIR/backend"

log "Installing backend dependencies..."
npm install

# Set up .env if not present
if [ ! -f .env ]; then
  log "Creating .env from template..."
  cp .env.template .env
  # Fill in DATABASE_URL
  sed -i '' 's|DATABASE_URL=|DATABASE_URL=postgres://localhost/medusa-v2|' .env
  success ".env created — please review and fill in any remaining values (RESEND_API_KEY, etc.)"
else
  success ".env already exists, skipping"
fi

log "Running database migrations..."
npx medusa db:migrate

success "Backend setup complete"

# ─── Customer Store ───────────────────────────────────────────────────────────
header "Step 8: Customer Store (Next.js)"
cd "$ROOT_DIR/customer-store"

log "Installing customer-store dependencies..."
yarn install

if [ ! -f .env.local ]; then
  log "Creating .env.local..."
  cat > .env.local <<'EOF'
MEDUSA_BACKEND_URL=http://localhost:9000
NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY=<your-publishable-key>
NEXT_PUBLIC_BASE_URL=http://localhost:8000
NEXT_PUBLIC_DEFAULT_REGION=us
REVALIDATE_SECRET=supersecret
EOF
  warn ".env.local created — remember to set NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY"
else
  success ".env.local already exists, skipping"
fi

success "Customer Store setup complete"

# ─── Vendor Dashboard ─────────────────────────────────────────────────────────
header "Step 9: Vendor Dashboard (Next.js)"
cd "$ROOT_DIR/vendor-dashboard"

log "Installing vendor-dashboard dependencies..."
npm install

if [ ! -f .env.local ]; then
  log "Creating .env.local..."
  cat > .env.local <<'EOF'
NEXT_PUBLIC_MEDUSA_BACKEND_URL=http://localhost:9000
EOF
  success ".env.local created"
else
  success ".env.local already exists, skipping"
fi

success "Vendor Dashboard setup complete"

# ─── Done ─────────────────────────────────────────────────────────────────────
header "✅ Installation Complete!"
echo -e "Next steps:\n"
echo -e "  ${BOLD}1.${NC} Review and update ${YELLOW}backend/.env${NC} (especially RESEND_API_KEY if using email)"
echo -e "  ${BOLD}2.${NC} Get your publishable key from the Medusa Admin, then update:"
echo -e "     ${YELLOW}customer-store/.env.local${NC}  →  NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY"
echo -e "  ${BOLD}3.${NC} (Optional) Seed initial data:"
echo -e "     ${CYAN}cd backend && npm run seed${NC}"
echo -e "  ${BOLD}4.${NC} (Optional) Create a test admin user:"
echo -e "     ${CYAN}cd backend && npm run create-test-admin${NC}"
echo -e "  ${BOLD}5.${NC} (Optional) Create a test vendor:"
echo -e "     ${CYAN}cd backend && npm run create-test-vendor${NC}"
echo -e "\nStart all services:"
echo -e "  ${CYAN}cd backend        && npm run dev   ${NC}  →  http://localhost:9000"
echo -e "  ${CYAN}cd customer-store && yarn dev      ${NC}  →  http://localhost:8000"
echo -e "  ${CYAN}cd vendor-dashboard && npm run dev ${NC}  →  http://localhost:3000"
echo ""
