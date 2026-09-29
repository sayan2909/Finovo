# Finovo — Separate Vercel Deployment Guide (Backend & Frontend)

This guide shows you how to deploy the **Backend** and **Frontend** as two separate projects on [Vercel](https://vercel.com).

---

## Architecture Overview

```
┌─────────────────────────────────┐           ┌─────────────────────────────────┐
│       Finovo Frontend           │  /api/*   │        Finovo Backend           │
│  (https://finovo.vercel.app)    ├──────────►│ (https://finovo-api.vercel.app) │
│       Vite React SPA            │           │    Express Serverless API       │
└─────────────────────────────────┘           └────────────────┬────────────────┘
                                                               │
                                                               ▼
                                              ┌─────────────────────────────────┐
                                              │       Supabase / Neon           │
                                              │    PostgreSQL Database Pool     │
                                              └─────────────────────────────────┘
```

Both projects live in the same Git repository, but are configured as two separate Vercel projects using Vercel's **Root Directory** setting.

---

## Step 1: Deploy the Backend to Vercel

1. Go to [Vercel Dashboard](https://vercel.com/new) and click **"Add New..."** → **"Project"**.
2. Select your GitHub repository (`Fintrack` / `Finovo`).
3. In the **Configure Project** screen:
   - **Project Name**: e.g. `finovo-backend` (or `finovo-api`)
   - **Framework Preset**: Select **"Other"**
   - **Root Directory**: Click **Edit**, select **`backend`**, and click **Continue**.
   - **Build and Output Settings**:
     - *Build Command*: Leave default or `npm run build`
     - *Output Directory*: Leave default
4. In **Environment Variables**, add:

| Key | Value | Description |
| :--- | :--- | :--- |
| `DATABASE_URL` | `postgresql://postgres...` | Your Supabase (pooler port 6543) or Neon PostgreSQL connection URL |
| `JWT_SECRET` | `your_secure_jwt_secret_key_2026` | 32+ character random string for signing JWT sessions |
| `NODE_ENV` | `production` | Production mode |
| `COOKIE_SAME_SITE` | `none` | Allows cross-domain authentication between your frontend and backend |

5. Click **"Deploy"**.
6. When deployment finishes, copy your live Backend URL:
   - Example: `https://finovo-backend.vercel.app`
   - You can verify it works by visiting `https://finovo-backend.vercel.app/api/health` in your browser.

---

## Step 2: Deploy the Frontend to Vercel

1. Return to [Vercel Dashboard](https://vercel.com/new) and click **"Add New..."** → **"Project"**.
2. Select the **same** GitHub repository again.
3. In the **Configure Project** screen:
   - **Project Name**: e.g. `finovo-frontend` (or `finovo`)
   - **Framework Preset**: Select **"Vite"**
   - **Root Directory**: Click **Edit**, select **`frontend`**, and click **Continue**.
   - **Build and Output Settings**:
     - *Build Command*: `npm run build`
     - *Output Directory*: `dist`
4. In **Environment Variables**, add:

| Key | Value | Description |
| :--- | :--- | :--- |
| `VITE_API_URL` | `https://finovo-backend.vercel.app` | The URL of your deployed Backend from **Step 1** (without trailing slash) |

5. Click **"Deploy"**.
6. When deployment finishes, open your live Frontend URL (e.g. `https://finovo-frontend.vercel.app`).
   - You can now Sign Up, Sign In, and use all features seamlessly!

---

## How Authentication Works Seamlessly

Finovo includes a dual-layer authentication bridge:
1. **Bearer Token Storage**: On login or registration, the JWT token is saved to `localStorage` and automatically attached via `Authorization: Bearer <token>` on all requests. This ensures authentication never breaks, even if the browser blocks cross-domain third-party cookies (e.g. Safari / Brave / iOS).
2. **SameSite=None Cookies**: In production, auth cookies are signed with `SameSite=None` and `Secure=true`, allowing secure cookie transmission between different Vercel domains.
3. **SPA Routing**: The `frontend/vercel.json` rewrite rule routes all direct URL visits (e.g. `/dashboard`, `/settings`, `/transactions`) to `/index.html`, eliminating 404 page reload errors.

---

## Troubleshooting Checklist

- **Health check returns error**: Ensure `DATABASE_URL` is using the Supabase **Transaction / Session Pooler** (`aws-0-ap-northeast-2.pooler.supabase.com:6543`) with `sslmode=require` or ssl enabled, as direct port 5432 may block serverless IPv4 connections.
- **CORS or Network Error**: Ensure `VITE_API_URL` in the frontend Vercel project matches your backend Vercel URL exactly (without trailing slash, e.g. `https://finovo-backend.vercel.app`).
- **Need to update Backend URL?**: Go to your Frontend project in Vercel → **Settings** → **Environment Variables** → update `VITE_API_URL` → trigger a new **Redeploy**.
