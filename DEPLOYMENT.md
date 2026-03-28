# Deployment Guide: Vercel (Frontend) + Render (API & Database)

## 🎯 Your Setup

```
┌─────────────────────────────────────────────┐
│         Your GitHub Repository              │
└────────────────┬────────────────────────────┘
                 │
     ┌───────────┴───────────┐
     │                       │
┌────▼──────────┐    ┌──────▼─────────┐
│    VERCEL     │    │    RENDER      │
│  (Frontend)   │    │  (API + DB)    │
│               │    │                │
│ • web         │    │ • API (NestJS) │
│ • web-admin   │    │ • PostgreSQL   │
│ • web-mgr     │    │ • GraphQL      │
│ • web-valet   │    │                │
└───────────────┘    └────────────────┘
```

---

## ✅ Deployment Checklist

### **Phase 1: Prepare Repository** (5 min)
```
☐ Commit all changes: git add . && git commit -m "Ready for deployment"
☐ Push to GitHub: git push origin main
☐ Verify .gitignore excludes .env.local files
```

### **Phase 2: Deploy Database & API to Render** (15 min)
```
☐ Create Render account (https://render.com)
☐ Create PostgreSQL database
☐ Copy DATABASE_URL
☐ Create Web Service for NestJS API
☐ Configure environment variables
☐ Deploy and get API URL
```

### **Phase 3: Deploy Frontend Apps to Vercel** (20 min)
```
☐ Create Vercel account (https://vercel.com)
☐ Connect GitHub repository
☐ Deploy web app (port 3001)
☐ Deploy web-admin app (port 3004)
☐ Deploy web-manager app (port 3002)
☐ Deploy web-valet app (port 3003)
☐ Add environment variables to each
```

### **Phase 4: Connect & Test** (5 min)
```
☐ Update Stripe redirect URLs
☐ Test API connectivity from frontend
☐ Test login with Google OAuth
```

---

## 📝 Step 1: Deploy Database + API to Render

### **1.1 Create Render Account**
1. Go to https://render.com
2. Click "Sign Up"
3. Sign up with GitHub

### **1.2 Create PostgreSQL Database**
1. Dashboard → "New +"
2. Select "PostgreSQL"
3. **Configuration:**
   - Name: `parkit-db`
   - Database: `postgres`
   - User: `postgres`
   - Region: Choose closest to you
   - Plan: **Free**

4. Click "Create Database"
5. **Wait for database to be ready** (2-3 min)
6. Copy the **Internal Database URL** (ends with `postgres://...`)
   - This will auto-populate in your Web Service

### **1.3 Create Web Service for API**
1. Dashboard → "New +"
2. Select "Web Service"
3. Select your GitHub repo
4. **Configuration:**
   ```
   Name:              parkit-api
   Environment:       Node
   Root Directory:    apps/api
   Build Command:     yarn install && yarn build
   Start Command:     node dist/src/main
   Plan:              Free
   ```

5. Click "Create Web Service"
6. **Add Environment Variables** → "Environment"

### **1.4 Add Environment Variables to Render**

Add these variables:

```env
# Database (auto-linked from PostgreSQL service)
DATABASE_URL=postgresql://...

# Authentication
JWT_SECRET=generate_with: openssl rand -base64 32

# Stripe (get from https://stripe.com)
STRIPE_PUBLISHABLE_KEY=pk_test_xxxxx
STRIPE_SECRET_KEY=sk_test_xxxxx
STRIPE_SUCCESS_URL=https://your-web-app.vercel.app/stripe/success?session_id={CHECKOUT_SESSION_ID}
STRIPE_CANCEL_URL=https://your-web-app.vercel.app/booking-failed
BOOKINGS_REDIRECT_URL=https://your-web-app.vercel.app/bookings
```

7. Click "Save"
8. Wait for deployment (2-5 minutes)
9. **Copy your API URL:** `https://parkit-api.onrender.com`

---

## � Step 1.5: Add Redis (for BullMQ queues)

We recommend using a managed Redis with a free tier to host BullMQ. Two good options:

- Upstash (serverless Redis) — free tier available, integrates well with serverless and Render.
- Redis Cloud (Redis Enterprise) — may offer a free/essentials tier depending on region.

We’ll document Upstash here (works well and has a free tier):

### **Provision Upstash Redis**
1. Go to https://console.upstash.com and sign up (GitHub or email).
2. Click "Create Database" → Select Redis.
3. Choose the free plan and create a database. Name it `parkit-redis`.
4. After creation, copy the **Redis URL**. Use the Redis URL that looks like:

```
rediss://:<password>@us1-upstash.redis.upstash.io:6379
```

5. In Render, add an environment variable for the API and worker services:

```
REDIS_URL=rediss://:<password>@us1-upstash.redis.upstash.io:6379
```

Notes:
- Use `rediss://` (TLS) for secure connections in production.
- Upstash provides both REST and Redis endpoints; BullMQ requires the normal Redis endpoint (not the REST API). Upstash's TLS Redis endpoint works for BullMQ.

### **Why Upstash**
- Free tier for low-throughput dev/testing.
- Simple auth and TLS-enabled URLs.
- No infra to manage (good for prototypes and small scale). For heavy production use, consider Redis Cloud or AWS Elasticache.

---

## � Step 1.6: Booking worker — runs inside the API by default (no separate deploy required)

The project now starts a Nest-managed booking worker automatically when the API process boots. The `QueueModule` provides the BullMQ queue and the `BookingWorkerService` (a Nest provider) starts a `Worker` on module init. That means:

- By default you do NOT need to deploy a separate background worker — the API process (apps/api) will consume the `booking:postprocess` queue for you.
- This simplifies deployment: deploy only the API web service on Render and ensure `REDIS_URL` is set.

When to deploy a separate worker

- If you expect heavy background throughput and want to scale workers independently from the web/API (recommended for high load), you can still run a separate background worker service. The repo includes a `start:worker` script which launches the same worker code from a standalone process.

Optional: deploy a separate worker on Render

1. Dashboard → "New +" → "Background Worker".
2. Select your repo and configure:

```
Name:              parkit-worker
Environment:       Node
Root Directory:    apps/api
Build Command:     yarn --cwd apps/api install && yarn --cwd apps/api build
Start Command:     yarn --cwd apps/api start:worker
Plan:              Free (or choose appropriate plan)
```

3. Add the same environment variables as the API (DATABASE_URL, JWT_SECRET, REDIS_URL, etc.). Ensure the worker can reach the DB and Redis.
4. Click "Create" and wait for deployment. The worker logs will show queue consumption.

Healthchecks & Scaling

- You can scale workers independently by increasing the instance count.
- Configure worker instance size/auto-scaling depending on job throughput.

---

## 📊 Bull Board (queue dashboard)

Bull Board is a lightweight UI to inspect Bull/BullMQ queues. You can host it in one of three ways:

1. Mount Bull Board inside the API (admin-only route `/admin/queues`) and guard it with `@AllowAuthenticated('admin')`.
2. Run Bull Board as a small standalone service (separate Render service) that points to the same `REDIS_URL`.
3. Run Bull Board locally for debugging using the same `REDIS_URL`.

Quick steps to run Bull Board as a separate service on Render:

1. Create a tiny Express app that mounts Bull Board and reads `REDIS_URL` from env.
2. Deploy as `parkit-bullboard` with `Root Directory: apps/api` (or a new directory `tools/bullboard`) and `Start Command: node dist/tools/bullboard.js`.
3. Protect the route with basic auth or restrict access using Render's private services / network.

For now, you can run Bull Board locally while developing:

```
# install dependencies
yarn --cwd apps/api add @bull-board/express bullmq ioredis

# run local script (example)
node tools/bullboard/local-bullboard.js
```

---

Now Redis and the worker are covered. Continue to Step 2 to deploy frontends.

---

## �🚀 Step 2: Deploy Frontend Apps to Vercel

### **2.1 Connect GitHub to Vercel**
1. Go to https://vercel.com
2. Click "Sign Up"
3. Sign up with GitHub
4. Authorize GitHub access

### **2.2 Import Your Repository**
1. Dashboard → "Add New..."
2. Select "Project"
3. Select "Import Git Repository"
4. Find and select `parkit-workshop`
5. Click "Import"

### **2.3 Deploy Each Frontend App**

#### **Deploy WEB App**
1. Dashboard → "Add New..." → "Project"
2. Import `parkit-workshop` again
3. **Configure:**
   ```
   Project Name:      parkit-web
   Framework:         Next.js
   Root Directory:    apps/web
   Build Command:     yarn run build
   Install Command:   yarn install --frozen-lockfile
   Output Directory:  .next
   ```

4. Click "Deploy"
5. **Add Environment Variables:**
   - Go to Settings → Environment Variables
   - Add these:
     ```
     NEXT_PUBLIC_API_URL=https://parkit-api.onrender.com
     NEXTAUTH_URL=https://parkit-web.vercel.app
     NEXTAUTH_SECRET=generate_with: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
     GOOGLE_CLIENT_ID=xxx.apps.googleusercontent.com
     GOOGLE_CLIENT_SECRET=GOCSPX-xxxxx
     NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_xxxxx
     ```

6. Click "Save and Redeploy"
7. Wait for deployment (3-5 min)
8. Get your URL: `https://parkit-web.vercel.app`

#### **Deploy WEB-ADMIN App** (Repeat for each)
1. Dashboard → "Add New..." → "Project"
2. Import `parkit-workshop`
3. **Configure:**
   ```
   Project Name:      parkit-admin
   Root Directory:    apps/web-admin
   Build Command:     yarn run build
   Install Command:   yarn install --frozen-lockfile
   Output Directory:  .next
   ```

4. Add Environment Variables:
   ```
   NEXT_PUBLIC_API_URL=https://parkit-api.onrender.com
   NEXTAUTH_URL=https://parkit-admin.vercel.app
   NEXTAUTH_SECRET=(same as web)
   GOOGLE_CLIENT_ID=(same as web)
   GOOGLE_CLIENT_SECRET=(same as web)
   ```

#### **Deploy WEB-MANAGER App**
```
Project Name:      parkit-manager
Root Directory:    apps/web-manager
NEXTAUTH_URL=      https://parkit-manager.vercel.app
Environment vars:  Same as above + CLOUDINARY vars if needed
```

#### **Deploy WEB-VALET App**
```
Project Name:      parkit-valet
Root Directory:    apps/web-valet
NEXTAUTH_URL=      https://parkit-valet.vercel.app
Environment vars:  Same as above
```

---

## 🔐 Step 3: Update Configuration

### **3.1 Update Google OAuth Redirect URLs**

Your app is now live! Update Google Cloud Console:

1. Go to https://console.cloud.google.com
2. Find your OAuth 2.0 Client ID
3. Click "Edit"
4. Add these Authorized Redirect URIs:
   ```
   https://parkit-web.vercel.app/api/auth/callback/google
   https://parkit-admin.vercel.app/api/auth/callback/google
   https://parkit-manager.vercel.app/api/auth/callback/google
   https://parkit-valet.vercel.app/api/auth/callback/google
   ```
5. Click "Save"

### **3.2 Update Stripe Webhook URLs** (Optional)

1. Go to https://dashboard.stripe.com
2. Go to Developers → Webhooks
3. Add endpoint: `https://parkit-api.onrender.com/stripe/webhook`
4. Select events: `checkout.session.completed`

### **3.3 Run Database Migrations**

From your local machine:

```bash
# Set production database URL
export DATABASE_URL="postgresql://user:pass@host/database"

# Run migrations
cd apps/api
yarn prisma migrate deploy

# Seed database (optional)
yarn prisma db seed
```

---

## ✅ Your Production URLs

```
API:         https://parkit-api.onrender.com
Web:         https://parkit-web.vercel.app
Admin:       https://parkit-admin.vercel.app
Manager:     https://parkit-manager.vercel.app
Valet:       https://parkit-valet.vercel.app

GraphQL:     https://parkit-api.onrender.com/graphql
API Health:  https://parkit-api.onrender.com/api/health
```

---

## 🧪 Test Your Deployment

1. **Visit frontend apps:**
   - https://parkit-web.vercel.app
   - Try logging in with Google

2. **Test API connection:**
   ```bash
   curl https://parkit-api.onrender.com/api/health
   ```

3. **Check GraphQL:**
   - https://parkit-api.onrender.com/graphql

4. **Test payments** (if using Stripe):
   - Use Stripe test cards
   - Verify success/cancel redirects work

---

## 💾 Cost Estimate

| Service | Cost |
|---------|------|
| Vercel (4 apps) | Free |
| Render API | Free (750h/month) |
| Render Database | Free |
| **Monthly Total** | **$0** ✅ |

---

## 🆘 Troubleshooting

### **"API connection failed"**
- Check `NEXT_PUBLIC_API_URL` is correct in Vercel
- Verify API is running on Render
- Check CORS settings in API

### **"Google login not working"**
- Verify redirect URLs in Google Cloud Console match exactly
- Check NEXTAUTH_URL is correct for each app
- Verify GOOGLE_CLIENT_ID/SECRET are correct

### **"Database connection timeout"**
- Verify DATABASE_URL in Render is correct
- Check PostgreSQL service is running
- Ensure migrations are run

### **"Build fails on Vercel"**
- Check yarn version in vercel.json
- Verify all dependencies are in package.json
- Check build command runs locally

---

## 📚 Next Steps

1. ✅ Deploy database and API to Render
2. ✅ Deploy 4 frontend apps to Vercel
3. ✅ Update Google OAuth URLs
4. ✅ Run database migrations
5. ✅ Test all apps
6. ✅ Monitor logs in Render and Vercel dashboards

**You're live!** 🚀

### **Step 2: Create `.vercelignore`**

At root:
```
apps/api
.env.local
.env.*.local
```

### **Step 3: Connect GitHub to Vercel**

1. Go to [vercel.com](https://vercel.com)
2. Click "Import Project"
3. Select "Import Git Repository"
4. Choose your GitHub repo `parkit-workshop`
5. Click "Import"

### **Step 4: Configure Each App**

For each Next.js app, create a separate Vercel project:

#### **Option A: Using Vercel Dashboard (Easier)**

1. Click "Add New..." → "Project"
2. Select your GitHub repo
3. **Project Settings:**
   - Framework: Next.js
   - Root Directory: `apps/web`
   - Build Command: `yarn build`
   - Install Command: `yarn install`
   - Output Directory: `.next`
   - Environment Variables: Add your env vars

4. Repeat for web-admin, web-manager, web-valet

#### **Option B: Using `vercel.json` (Advanced)**

Your `vercel.json` should look like:

```json
{
  "packageManager": "yarn@9",
  "projects": {
    "web": {
      "root": "apps/web",
      "buildCommand": "yarn run build",
      "installCommand": "yarn install"
    },
    "web-admin": {
      "root": "apps/web-admin",
      "buildCommand": "yarn run build",
      "installCommand": "yarn install"
    },
    "web-manager": {
      "root": "apps/web-manager",
      "buildCommand": "yarn run build",
      "installCommand": "yarn install"
    },
    "web-valet": {
      "root": "apps/web-valet",
      "buildCommand": "yarn run build",
      "installCommand": "yarn install"
    }
  }
}
```

---

## Environment Variables Setup



---

## Deploy Your NestJS API

Since Vercel doesn't support Node.js/NestJS directly, use one of these:

### **Option 1: Render.com (RECOMMENDED - Free tier)**

1. Push code to GitHub
2. Go to [render.com](https://render.com)
3. Click "Create +" → "Web Service"
4. Connect GitHub repo
5. **Settings:**
   - Name: `parkit-api`
   - Environment: `Node`
   - Root Directory: `apps/api`
   - Build Command: `yarn install && yarn build`
   - Start Command: `node dist/src/main`
   - Environment Variables:
     - `DATABASE_URL=your_postgres_url`
     - `NODE_ENV=production`
     - etc.

6. Deploy!

### **Option 2: Railway.app**

1. Go to [railway.app](https://railway.app)
2. New Project → GitHub repo
3. Add environment variables
4. Deploy

### **Option 3: Fly.io**

1. Install `fly` CLI
2. Run `flyctl launch` in `apps/api`
3. Follow prompts
4. `flyctl deploy`

---

## Database Setup for Production

### **PostgreSQL Hosting Options:**

1. **Render PostgreSQL** (Free tier, included)
   - When creating web service on Render
   - Click "Create Database"
   - Use connection string in `DATABASE_URL`

2. **Railway PostgreSQL**
   - Free tier with $5/month credits
   - Easier to use than Render

3. **Neon.tech**
   - Free tier for development
   - Serverless PostgreSQL
   - Great for learning

4. **AWS RDS**
   - More expensive but robust
   - For production scale

### **Set DATABASE_URL in API:**

```bash
# Example from Render
DATABASE_URL="postgresql://user:password@host:5432/database?schema=public"
```

---

## GitHub Integration & Automatic Deployments

### **Vercel Automatic Deploys:**

✅ On `main` branch push → Automatic production deploy  
✅ On PR → Automatic preview deploy  
✅ View preview URLs in PR comments  

### **Setup:**

1. In Vercel dashboard → Settings → Git
2. Under "Deploy Hooks", add:
   ```
   https://api.vercel.com/v1/integrations/deploy/...
   ```

3. Every git push triggers deployment

---

## Step-by-Step: Complete Deployment Example

### **Step 1: Prepare Repository**

```bash
# Ensure all changes committed
git add .
git commit -m "Add Vercel configuration"
git push origin main
```

### **Step 2: Create Vercel Projects**

```bash
# Install Vercel CLI (optional but helpful)
yarn add -g vercel

# Deploy from project root
vercel

# For each app
cd apps/web
vercel
```

### **Step 3: Configure Each Project**

When prompted:
- **Scope:** Your account
- **Project name:** `parkit-web` (or similar)
- **Root directory:** `./` (Vercel auto-detects)
- **Build command:** Use default (`yarn run build`)
- **Install command:** Use default (`yarn install`)

### **Step 4: Add Environment Variables**

```bash
vercel env add NEXT_PUBLIC_API_URL
# Enter: https://your-api.production.com
```

### **Step 5: Deploy API**

On Render/Railway/Fly.io following their guides above.

---

## Final URLs After Deployment

```
Production Domains:
├── API:         https://parkit-api.render.com (or railway, fly.io)
├── Web:         https://parkit-web.vercel.app
├── Web-Admin:   https://parkit-admin.vercel.app
├── Web-Manager: https://parkit-manager.vercel.app
└── Web-Valet:   https://parkit-valet.vercel.app
```

You can also add custom domains for each!

---

## Troubleshooting

### **Build fails with "yarn not found"**
- Add `vercel.json` with `"packageManager": "yarn@9"`

### **Modules not found errors**
- Ensure `.vercelignore` doesn't exclude needed files
- Check that shared libs are properly referenced

### **Environment variables not loading**
- Add `NEXT_PUBLIC_` prefix for client-side vars
- Set in Vercel dashboard, not in code

### **API calls failing**
- Use environment variable for API URL
- Ensure API domain is in CORS whitelist

---

## Recommended Setup Summary

✅ **Next.js Apps → Vercel**
✅ **NestJS API → Render.com** (or Railway)
✅ **Database → PostgreSQL** (Render/Railway included)
✅ **Package Manager → yarn**
✅ **Monorepo Support → Full**

This gives you:
- Free hosting for frontend (Vercel free tier)
- Free hosting for backend (Render/Railway free tier)
- Automatic deployments on push
- Easy environment variable management
- Simple scaling as you grow
