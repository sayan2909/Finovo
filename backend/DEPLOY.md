# Finovo Backend — Deployment Guide

This guide covers deploying the **Finovo Express REST API Backend** independently to Vercel, Render, Railway, or Docker.

---

## 1. Deploy to Vercel (Recommended Serverless)

1. Push your repository to GitHub.
2. In [Vercel Dashboard](https://vercel.com/new), click **Add New...** → **Project**.
3. Select your GitHub repository.
4. In the **Configure Project** screen:
   - **Root Directory**: Click *Edit* and select **`backend`**.
   - **Framework Preset**: **Other**
   - **Build Command**: `npm run build`
5. Under **Environment Variables**, add:
   - `DATABASE_URL`: Your Supabase pooler or Neon PostgreSQL connection URL.
   - `JWT_SECRET`: A secure 32+ character random string.
   - `NODE_ENV`: `production`
   - `COOKIE_SAME_SITE`: `none`
6. Click **Deploy**.
7. Once finished, copy the backend URL (e.g., `https://finovo-backend.vercel.app`).

> [!TIP]
> The included `backend/api/index.ts` and `backend/vercel.json` automatically map all incoming API requests to the Express application as a Vercel serverless function.

---

## 2. Deploy to Render (Web Service)

1. In [Render Dashboard](https://dashboard.render.com), click **New +** → **Web Service**.
2. Connect your repository:
   - **Root Directory**: `backend`
   - **Environment**: `Node`
   - **Build Command**: `npm run build`
   - **Start Command**: `npm run start`
3. Add environment variables: `DATABASE_URL`, `JWT_SECRET`, `NODE_ENV=production`.
4. Click **Create Web Service**.

---

## 3. Deploy to Railway

1. In [Railway Dashboard](https://railway.app), click **New Project** → **Deploy from GitHub repo**.
2. Set **Root Directory** to `backend`.
3. Build command: `npm run build`
4. Start command: `npm run start`
5. In **Variables**, add `DATABASE_URL`, `JWT_SECRET`, and `NODE_ENV=production`.
6. Generate domain in **Settings** → **Networking**.

---

## 4. Deploy using Docker / VPS

```bash
cd backend
docker build -t finovo-backend .
docker run -d \
  -p 5000:5000 \
  -e DATABASE_URL="postgresql://..." \
  -e JWT_SECRET="your-secret" \
  --name finovo-api \
  finovo-backend
```
