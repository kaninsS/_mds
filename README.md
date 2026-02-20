# MDS Marketplace

A multi-vendor marketplace built on [MedusaJS v2](https://medusajs.com). The project consists of three services:

| Service | Directory | Port | Description |
|---|---|---|---|
| **Backend** | `backend/` | `9000` | MedusaJS API + Admin UI |
| **Customer Store** | `customer-store/` | `8000` | Next.js storefront for customers |
| **Vendor Dashboard** | `vendor-dashboard/` | `3000` | Next.js dashboard for vendors |

---

## Prerequisites

Install the following tools on your Mac before proceeding.

### 1. Homebrew

```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

### 2. Node.js (v20+)

```bash
brew install node@20
node --version  # should be >= 20
```

### 3. npm (v11+)

npm is bundled with Node. Upgrade if needed:

```bash
npm install -g npm@latest
```

### 4. Yarn (for customer-store)

```bash
corepack enable
corepack prepare yarn@4.12.0 --activate
```

### 5. PostgreSQL

```bash
brew install postgresql@16
brew services start postgresql@16
```

Create the database:

```bash
createdb medusa-v2
```

### 6. Redis

```bash
brew install redis
brew services start redis
```

---

## Installation

### Clone the repository

```bash
git clone <your-repo-url> _mds
cd _mds
```

---

## Option 2: Automated Script (Recommended)

Run the provided install script — it handles **everything** automatically:
Homebrew, Node.js, npm, Yarn, PostgreSQL, Redis, all dependencies, migrations, and `.env` files.

```bash
chmod +x install.sh
./install.sh
```

The script will:

- ✅ Install all system dependencies via Homebrew (Node 20, PostgreSQL 16, Redis)
- ✅ Install all npm/yarn packages for all three services
- ✅ Create `.env` / `.env.local` files from templates
- ✅ Run database migrations automatically
- ✅ Print next steps at the end

After the script finishes, the only manual step is setting your **publishable API key** in `customer-store/.env.local` (obtained from the Medusa Admin at `http://localhost:9000/app` → Settings → API Keys).

> **Note:** The script is safe to re-run — it skips steps that are already complete.

---

## Option 1: Manual Setup

Follow the steps below to set up each service by hand.

---

## 1. Backend Setup

```bash
cd backend
```

#### Install dependencies

```bash
npm install
```

#### Configure environment

```bash
cp .env.template .env
```

Edit `.env` and fill in the required values:

```env
STORE_CORS=http://localhost:8000,https://docs.medusajs.com
ADMIN_CORS=http://localhost:5173,http://localhost:9000,https://docs.medusajs.com
AUTH_CORS=http://localhost:5173,http://localhost:9000,https://docs.medusajs.com
REDIS_URL=redis://localhost:6379
JWT_SECRET=supersecret
COOKIE_SECRET=supersecret
DATABASE_URL=postgres://localhost/medusa-v2

# Optional – for email notifications
RESEND_API_KEY=
RESEND_FROM_EMAIL=onboarding@resend.dev
BACKEND_URL=http://localhost:9000
```

#### Run database migrations

```bash
npx medusa db:migrate
```

#### (Optional) Seed initial data

```bash
npm run seed
```

#### Start the backend

```bash
npm run dev
```

The backend API will be available at `http://localhost:9000`.  
The Medusa Admin UI will be available at `http://localhost:9000/app`.

#### Create a test admin user

```bash
npm run create-test-admin
```

#### Create a test vendor

```bash
npm run create-test-vendor
```

---

## 2. Customer Store Setup

```bash
cd customer-store
```

#### Install dependencies

```bash
yarn install
```

#### Configure environment

```bash
cp .env.local.example .env.local 2>/dev/null || cp .env.local .env.local
```

Edit `.env.local`:

```env
MEDUSA_BACKEND_URL=http://localhost:9000
NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY=<your-publishable-key>
NEXT_PUBLIC_BASE_URL=http://localhost:8000
NEXT_PUBLIC_DEFAULT_REGION=us
REVALIDATE_SECRET=supersecret
```

> **Get your publishable key**: Log in to the Medusa Admin at `http://localhost:9000/app` → Settings → API Keys → Create a publishable key for your sales channel.

#### Start the customer store

```bash
yarn dev
```

The customer storefront will be available at `http://localhost:8000`.

---

## 3. Vendor Dashboard Setup

```bash
cd vendor-dashboard
```

#### Install dependencies

```bash
npm install
```

#### Configure environment

Create a `.env.local` file:

```env
NEXT_PUBLIC_MEDUSA_BACKEND_URL=http://localhost:9000
```

#### Start the vendor dashboard

```bash
npm run dev
```

The vendor dashboard will be available at `http://localhost:3000`.

---

## Running All Services

Open three separate terminal tabs and run each service:

**Tab 1 – Backend:**

```bash
cd backend && npm run dev
```

**Tab 2 – Customer Store:**

```bash
cd customer-store && yarn dev
```

**Tab 3 – Vendor Dashboard:**

```bash
cd vendor-dashboard && npm run dev
```

---

## Service URLs Summary

| Service | URL |
|---|---|
| Backend API | <http://localhost:9000> |
| Medusa Admin UI | <http://localhost:9000/app> |
| Customer Store | <http://localhost:8000> |
| Vendor Dashboard | <http://localhost:3000> |

---

## Troubleshooting

### PostgreSQL connection error

Make sure the service is running:

```bash
brew services list
brew services restart postgresql@16
```

### Redis connection error

```bash
brew services restart redis
```

### Port already in use

```bash
lsof -ti:<port> | xargs kill -9
# e.g.
lsof -ti:9000 | xargs kill -9
```

### Node version mismatch

The backend requires Node >= 20. Use `nvm` to manage versions:

```bash
brew install nvm
nvm install 20
nvm use 20
```

### Database migration errors

Reset and re-migrate the database:

```bash
dropdb medusa-v2
createdb medusa-v2
cd backend && npx medusa db:migrate
```
