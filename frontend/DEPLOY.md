# Finovo Frontend — Deployment Guide

This guide covers deploying the **Finovo Frontend Client (Vite + React SPA)** independently to platforms like Vercel, Netlify, or Docker.

---

## 1. Deploy to Vercel (Recommended)

1. Push your repository to GitHub.
2. In [Vercel Dashboard](https://vercel.com/new), click **Add New...** → **Project**.
3. Select your GitHub repository.
4. In the **Configure Project** screen:
   - **Root Directory**: Click *Edit* and select **`frontend`**.
   - **Framework Preset**: **Vite**
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. Under **Environment Variables**, add:
   - **Name**: `VITE_API_URL`
   - **Value**: `https://your-backend.vercel.app` (from your deployed backend)
6. Click **Deploy**.

> [!TIP]
> The included `frontend/vercel.json` automatically configures SPA fallback (`/*` -> `/index.html`), preventing 404 errors when refreshing inner routes like `/dashboard` or `/transactions`.

---

## 2. Deploy to Netlify

1. In [Netlify Dashboard](https://app.netlify.com), click **Add new site** → **Import an existing project**.
2. Connect to GitHub and select the repository.
3. Configuration:
   - **Base directory**: `frontend`
   - **Build command**: `npm run build`
   - **Publish directory**: `frontend/dist`
4. In **Site configuration** → **Environment variables**:
   - Set `VITE_API_URL` to your backend URL (e.g., `https://your-backend.vercel.app`).
5. Click **Deploy site**.

---

## 3. Deploy using Docker / VPS

```bash
cd frontend
docker build -t finovo-frontend .
docker run -d \
  -p 5173:5173 \
  -e VITE_API_URL="https://your-backend.vercel.app" \
  --name finovo-ui \
  finovo-frontend
```
