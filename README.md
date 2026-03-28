# Parkit - B2B2C Parking & Valet SaaS Management

Parkit is a highly scalable, multi-tenant B2B2C parking and valet management ecosystem designed to streamline the discovery, booking, and logistical execution of urban parking. It serves four distinct user bases—Super Admins, Garage Managers, Valet Drivers, and End Customers—through a tightly integrated Monorepo architecture. 

The platform solves the complex logistical challenges of dynamic slot management, instant automated valet dispatching, and secure payment processing.

---

## 💻 Technical Stack

### Core Architecture
- **Monorepo:** Nx (Extensible build system for sharing code between 4+ web apps and the API)
- **Database:** PostgreSQL managed by Prisma ORM
- **Authentication:** NextAuth (JWT) seamlessly integrated with NestJS Passport Guards

### Backend (API)
- **Framework:** NestJS (Node.js)
- **API Interfaces:** GraphQL (Apollo Server) and REST (Stripe Webhooks)
- **Background Jobs:** BullMQ + IORedis (Upstash TLS) for resilient, high-throughput matchmaking
- **Real-Time PubSub:** GraphQL Subscriptions for instant UI slot availability and valet routing
- **Security:** Reflector-based Role-Based Access Control (RBAC) securely locked to explicit database identifiers

### Frontend (Client Apps)
- **Framework:** Next.js 14, React 18
- **Styling:** TailwindCSS + Headless UI
- **Mapping Engine:** React Leaflet + OSRM (Open Source Routing Machine)
- **Code Generation:** GraphQL Codegen for 100% end-to-end type safety

---

## 🏗️ Application Ecosystem

The Parkit Monorepo houses four uniquely scoped Web Applications:

1. **Web-App (Customer Sandbox):** Consumers can search for garages geographically, request pickup/dropoff valet locations with interactive map pins, and checkout securely via Stripe.
2. **Web-Manager (B2B Garage Operator):** A multi-tenant dashboard allowing parking operators to oversee their specific company’s garages, monitor dynamic slot occupancies, hire valets, and track revenue.
3. **Web-Valet (Driver Logistical Hub):** A mobile-optimized interface for valet drivers actively tracking their BullMQ-assigned pickup and dropoff manifests complete with live GPS mapping.
4. **Web-Admin (Global Overseer):** A master super-admin panel used to verify new Garages, oversee platform-wide queues securely via Bull-Board, and manage global system health.

---

## 🚀 Getting Started

### 1. Prerequisites
- Node.js (>= 18.x)
- yarn (>= 1.x)
- Docker & docker-compose
- Git

### 2. Installation
```bash
git clone https://github.com/shouravrahman/parkit.git
cd parkit
yarn install
```

### 3. Environment Variables
Create `.env.local` files in each app directory with required environment variables.

**Quick Start Secrets Map:**
```bash
# Generate secrets
openssl rand -base64 32  # for JWT_SECRET
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"  # for NEXTAUTH_SECRET

# Copy examples and fill in values
cp apps/api/.env.example apps/api/.env.local
cp apps/web/.env.example apps/web/.env.local
```
**Services Required:**
1. **Google OAuth** (free) - Get credentials from https://console.cloud.google.com
2. **Stripe** (free) - Get test keys from https://stripe.com
3. **Upstash Redis** (free) - Get TLS connection string from https://upstash.com

### 4. Database Setup
Start the PostgreSQL database using Docker Compose, append the explicit `DATABASE_URL` mapping, and migrate the schema.
```bash
docker-compose up -d
cd apps/api
yarn prisma migrate dev
yarn prisma db seed
```

---

## 🖥️ Running the Environment

To run all development servers concurrently from root:
```bash
yarn run dev
```

Alternatively, boot individual packages via their specific filters:

- **Backend API:** `yarn --filter @parkit/api dev` (`http://localhost:3000`)
- **Customer Web:** `yarn --filter @parkit/web dev` (`http://localhost:3001`)
- **Admin Dashboard:** `yarn --filter @parkit/web-admin dev` (`http://localhost:3002`)
- **Manager Dashboard:** `yarn --filter @parkit/web-manager dev` (`http://localhost:3003`)
- **Valet App:** `yarn --filter @parkit/web-valet dev` (`http://localhost:3004`)

---

## ☁️ Deployment Architecture

Vercel intrinsically supports deploying multiple Next.js applications from a single monorepo. This codebase is fully adapted for free-tier separation splits.

```text
Frontend Apps → Vercel ✅
├── web
├── web-admin
├── web-manager
└── web-valet

Backend API → Render.com (or Railway, Fly.io) ✅
└── api

Database → PostgreSQL (Render/Railway included) ✅
```

### **Quick Start Deployment:**

1. **Deploy API first** (5-10 minutes)
   - Go to [render.com](https://render.com)
   - Connect GitHub, select repo
   - Root directory: `apps/api`
   - Set standard Backend URL format: `https://your-api.onrender.com`

2. **Deploy Frontend Apps** (20-30 minutes total)
   - Go to [vercel.com](https://vercel.com)
   - Import project from GitHub
   - Root directory: `apps/web` (repeat for each independent frontend app)
   - Bind global variable: `NEXT_PUBLIC_API_URL=https://your-api.onrender.com`

## License
This project is licensed under the MIT License.
