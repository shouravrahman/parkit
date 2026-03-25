# Quick Start Guide - Running Apps & API

## 🚀 Initial Setup

```bash
# 1. Install dependencies
yarn install

# 2. Start PostgreSQL database
docker-compose up -d

# 3. Run database migrations
cd apps/api
yarn prisma migrate dev
cd ../..
```

## 📱 Running Individual Apps

### API (NestJS) - Port 3000
```bash
# Option 1: From root
yarn --filter @parkit/api dev

# Option 2: From api directory
cd apps/api && yarn dev
```

### WEB (Customer App) - Port 3001
```bash
# Option 1: From root
yarn --filter @parkit/web dev

# Option 2: From web directory
cd apps/web && yarn dev
```

### WEB-ADMIN (Admin Dashboard) - Port 3002
```bash
yarn workspace @parkit/web-admin dev
```

### WEB-MANAGER (Manager Dashboard) - Port 3003
```bash
yarn workspace @parkit/web-manager dev
```

### WEB-VALET (Valet App) - Port 3004
```bash
yarn workspace @parkit/web-valet dev
```

## 🔄 Run All Apps Concurrently

```bash
# Run all dev servers at once
yarn dev
```

This will start:
- API at http://localhost:3000
- WEB at http://localhost:3001
- WEB-ADMIN at http://localhost:3002
- WEB-MANAGER at http://localhost:3003
- WEB-VALET at http://localhost:3004

## 🛠️ Development Commands

```bash
# Format code across monorepo
yarn format:write

# Lint all packages
yarn lint

# Type check all packages
yarn tsc

# Build all packages
yarn build

# Run full validation (format + tsc + lint + build)
yarn validate

# Run tests in API
cd apps/api
yarn test
```

## 📊 Database Commands (from apps/api)

```bash
cd apps/api

# Run migrations
yarn prisma migrate dev

# Generate Prisma client
yarn prisma generate

# View database GUI
yarn prisma studio

# Seed database
yarn prisma db seed

# Generate GraphQL types
yarn entity:gql

# Generate REST API types
yarn entity:rest

# Generate complete entity scaffold
yarn entity:complete
```

## 🐳 Docker Database

### Start Database
```bash
docker-compose up -d
```

### Stop Database
```bash
docker-compose down
```

### View Logs
```bash
docker-compose logs -f
```

### Database Connection Details
- Host: `localhost`
- Port: `2010`
- User: `postgres`
- Password: `password`
- Database: `postgres`

## 📦 Package Manager Commands

### Filter specific apps
```bash
# Install in specific app
yarn workspace @parkit/api install

# Run script in specific app
yarn workspace @parkit/api lint

# Run in all apps
yarn -r dev
```

### Parallel execution
```bash
# Run concurrently
yarn --parallel dev
```

## 🔗 Useful URLs (when running dev servers)

- **API**: http://localhost:3000
  - GraphQL: http://localhost:3000/graphql
  - API Docs: http://localhost:3000/api

- **WEB**: http://localhost:3001
- **WEB-ADMIN**: http://localhost:3002
- **WEB-MANAGER**: http://localhost:3003
- **WEB-VALET**: http://localhost:3004

## 🐛 Troubleshooting

### Port already in use
If a port is already in use, check the specific app's `package.json` scripts to see how to change the port:

```bash
# Example for web app (uses -p flag)
yarn workspace @parkit/web dev -- -p 3010
```

### Clean install
```bash
# Remove lock file and node_modules
rm -rf yarn-lock.yaml node_modules

# Reinstall
yarn install
```

### Reset database
```bash
cd apps/api

# Drop and recreate
yarn prisma migrate reset

# Or manual approach
yarn prisma migrate dev
```

## 📚 Project Structure

```
apps/
├── api              # NestJS Backend (Port 3000)
│   └── prisma/      # Database schema & migrations
├── web              # Next.js Customer App (Port 3001)
├── web-admin        # Next.js Admin Dashboard (Port 3002)
├── web-manager      # Next.js Manager Dashboard (Port 3003)
└── web-valet        # Next.js Valet App (Port 3004)

libs/
├── network          # API client & auth setup
├── ui               # Shared UI components
├── forms            # Form components & validation
├── util             # Utilities & hooks
└── 3d               # 3D components
```

## 💡 Tips

- Use `yarn workspace` to target specific apps
- Use `yarn --parallel` to run multiple tasks concurrently
- Use `yarn -r` to run recursively across all packages
- Check individual `package.json` files for more commands
- Combine filters and parallel: `yarn --parallel -r workspace './apps/**' dev`
