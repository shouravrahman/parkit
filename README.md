# Parkit

This repository contains the Parkit project, which includes multiple applications and libraries. This guide will help you set up the project locally and run the applications.

## Prerequisites

Before you begin, ensure you have the following installed on your system:

- Node.js (>= 14.x)
- yarn (>= 8.x)
- Docker
- Git

## Getting Started

### 1. Clone the Repository

Clone the repository to your local machine using Git.

```bash
git clone https://github.com/karthickthankyou/parkit.git
cd parkit
```

### 2. Install Dependencies

Install the project dependencies using yarn.

```
yarn install
```

### 3. Set Up Environment Variables

Create `.env.local` files in each app directory with required environment variables.

**Quick Start (15 minutes):**
```bash
# Generate secrets
openssl rand -base64 32  # for JWT_SECRET
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"  # for NEXTAUTH_SECRET

# Copy examples and fill in values
cp apps/api/.env.example apps/api/.env.local
cp apps/web/.env.example apps/web/.env.local
# ... repeat for other apps
```

**What You Actually Need:**
- See [ENV_ACTUAL_NEEDED.md](./ENV_ACTUAL_NEEDED.md) - **Minimal variables (no fluff)**
- Or [ENV_VARIABLES_GUIDE.md](./ENV_VARIABLES_GUIDE.md) - Complete detailed guide

**Services Required:**
1. **Google OAuth** (free) - Get credentials from https://console.cloud.google.com
2. **Stripe** (free) - Get test keys from https://stripe.com
3. **Mapbox** (free) - Get token from https://mapbox.com

See [ENV_ACTUAL_NEEDED.md](./ENV_ACTUAL_NEEDED.md) for step-by-step.

### 4. Run the Database with Docker Compose

Start the PostgreSQL database using Docker Compose.

```
docker-compose up -d
```

### 5. Run Prisma Migrations

After the database is running, apply Prisma migrations to set up the database schema.

```
yarn prisma migrate dev
```

### 6. Run the Applications

You can run the individual applications using the following commands:

#### API Application (NestJS)

Run the API in development mode with hot-reload:

```bash
yarn --filter @parkit/api dev
```

Or from the api directory:

```bash
cd apps/api
yarn dev
```

The API will start at `http://localhost:3000`

#### WEB Application (Next.js)

Run the web app in development mode:

```bash
yarn --filter @parkit/web dev
```

Or from the web directory:

```bash
cd apps/web
yarn dev
```

The WEB app will start at `http://localhost:3001`

#### WEB-ADMIN Application (Next.js)

```bash
yarn --filter @parkit/web-admin dev
```

#### WEB-MANAGER Application (Next.js)

```bash
yarn --filter @parkit/web-manager dev
```

#### WEB-VALET Application (Next.js)

```bash
yarn --filter @parkit/web-valet dev
```

### 7. Run All Applications at Once

To run all development servers concurrently:

```bash
yarn run dev
```

**Note:** This requires a `dev` script in the root package.json (see [Adding concurrent dev task](#adding-concurrent-dev-task) below).

### 8. Other Useful Commands

```bash
# Format code
yarn format:write

# Run linting
yarn lint

# Type check all packages
yarn tsc

# Build all packages
yarn build

# Validate (format + tsc + lint + build)
yarn validate

# Run tests
yarn test
```

## Database Setup

### 1. Start PostgreSQL with Docker

```bash
docker-compose up -d
```

This starts a PostgreSQL instance at `localhost:2010` with:
- User: `postgres`
- Password: `password`
- Database: `postgres`

### 2. Run Prisma Migrations

```bash
cd apps/api
yarn prisma migrate dev
```

### 3. Seed Database (Optional)

```bash
cd apps/api
yarn prisma db seed
```

## Project Structure

```
parkit/
├── apps/
│   ├── api/              # NestJS Backend API
│   ├── web/              # Next.js Customer Web App
│   ├── web-admin/        # Next.js Admin Dashboard
│   ├── web-manager/      # Next.js Manager Dashboard
│   └── web-valet/        # Next.js Valet Mobile App
├── libs/
│   ├── forms/            # Shared form components
│   ├── network/          # API client & GraphQL setup
│   ├── ui/               # Shared UI components
│   ├── util/             # Utility functions
│   ├── 3d/               # 3D components
│   └── sample-lib/       # Sample library
├── nx.json               # Nx configuration
└── package.json          # Root package.json
```

## Adding concurrent dev task

If you want to run all dev servers concurrently from root, add this to root `package.json`:

```json
{
  "scripts": {
    "dev": "yarn run -r --filter './apps/**' dev"
  }
}
```

## Technologies Used

- **Frontend:** Next.js 14, React 18, TypeScript, Tailwind CSS
- **Backend:** NestJS 9, GraphQL, Prisma ORM
- **Database:** PostgreSQL
- **Package Manager:** yarn (workspaces)
- **Build Tool:** Nx
- **Code Quality:** ESLint, Prettier

## Deployment

### ✅ Does Vercel Support Multiple Apps?

**YES!** Vercel supports deploying multiple Next.js applications from a single monorepo.

### **Deployment Architecture**

```
Frontend Apps → Vercel ✅
├── web
├── web-admin
├── web-manager
└── web-valet

Backend API → Render.com (or Railway, Fly.io) ✅
└── api

Database → PostgreSQL (Render/Railway included) ✅
```

### **Quick Start:**

1. **Deploy API first** (5-10 minutes)
   - Go to [render.com](https://render.com)
   - Connect GitHub, select repo
   - Root directory: `apps/api`
   - Get your API URL: `https://your-api.onrender.com`

2. **Deploy Frontend Apps** (20-30 minutes total)
   - Go to [vercel.com](https://vercel.com)
   - Import project from GitHub
   - Root directory: `apps/web` (repeat for each app)
   - Add environment variable: `NEXT_PUBLIC_API_URL=https://your-api.onrender.com`

3. **Test Integrations**
   - Visit your apps and test API calls

### **Full Deployment Guides:**

- 📘 [Vercel Deployment Guide](./VERCEL_DEPLOYMENT.md) - Complete step-by-step
- 📗 [API Deployment Guide](./DEPLOY_API.md) - NestJS on Render/Railway/Fly
- ✅ [Deployment Checklist](./DEPLOYMENT_CHECKLIST.md) - Quick reference

### **Free Tier Hosting:**

| Service | Cost | Tier |
|---------|------|------|
| Vercel (Frontend) | Free | 100GB bandwidth/month |
| Render (API) | Free | 750 compute hours/month |
| PostgreSQL | Free | Included with Render |
| **Total** | **Free** | **Perfect for MVP** |

## License
This project is licensed under the MIT License.
