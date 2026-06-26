# LUNORA Production Deployment Guide

This document details step-by-step procedures to deploy the **LUNORA Premium E-Commerce Platform** frontend and backend to production servers.

---

## 🗺️ 1. Deployment Overview

```
                   +----------------------------------+
                   |        Next.js Client            |
                   |      Hosted on Vercel            |
                   +----------------+-----------------+
                                    |
                                    | HTTPS requests (JSON / JWT)
                                    v
                   +----------------+-----------------+
                   |       Express API Server         |
                   |   Hosted on Render / Railway     |
                   +--------+---------------+---------+
                            |               |
             Mongoose Ping  |               | Assets Upload
                            v               v
                   +--------+-----+   +-----+----------+
                   |  MongoDB     |   | Cloudinary     |
                   |  Atlas       |   | Media CDN      |
                   +--------------+   +----------------+
```

---

## 🗄️ 2. Database Provisioning (MongoDB Atlas)

1. Sign in to your [MongoDB Atlas Console](https://cloud.mongodb.com/).
2. Create a new shared project and click **Build a Database** (choose Shared M0 cluster for sandbox testing, or M10+ for live production scale).
3. Set your Provider to **AWS** or **GCP** and region closest to your clients.
4. Set up **Database Access**: Create a deployment user account with `Read and Write to Any Database` role. Note the credentials.
5. Set up **Network Access**: Add IP Access list. For Render/Railway deployments, add `0.0.0.0/0` (allow access from anywhere) since these platforms use dynamic host IPs, or fetch Render's specific regional outbound IP addresses.
6. Retrieve your **Connection String**: Choose "Connect your application" and copy the SRV URI:
   `mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/lunora?retryWrites=true&w=majority`

---

## 🚀 3. Backend Deployment (Render)

1. Sign in to [Render](https://render.com/).
2. Click **New +** and select **Web Service**.
3. Connect your GitHub repository.
4. Set the following specifications:
   * **Name**: `lunora-api`
   * **Environment**: `Node`
   * **Root Directory**: `server`
   * **Build Command**: `npm run build` (which compiles `tsc`)
   * **Start Command**: `npm run start` (starts compiled `dist/index.js`)
   * **Plan**: Starter or higher
5. Open the **Advanced** section and select **Add Environment Variable**. Configure the production values (see `ENVIRONMENT.md`).
6. Click **Create Web Service**. Render will automatically provision an SSL certificate and start building. Note the generated Web Service URL (e.g. `https://lunora-api.onrender.com`).

---

## 🎨 4. Frontend Deployment (Vercel)

1. Sign in to [Vercel](https://vercel.com/).
2. Click **Add New** and select **Project**.
3. Import your GitHub repository.
4. Set the following specifications:
   * **Framework Preset**: `Next.js`
   * **Root Directory**: Keep blank (the root workspace folder `.` containing the `app` directory)
   * **Build Command**: `npm run build:frontend`
   * **Output Directory**: `.next`
5. Configure the **Environment Variables** in the Project Settings:
   * `NEXT_PUBLIC_APP_URL` = Your custom storefront domain or Vercel deployment URL (e.g. `https://lunora.vercel.app`)
   * `NEXT_PUBLIC_API_URL` = Your backend Render API URL + `/api/v1` suffix (e.g. `https://lunora-api.onrender.com/api/v1`)
6. Click **Deploy**. Vercel will bundle assets, optimize static pages, and serve them over their global Edge Network.

---

## 💳 5. Payment & Storage Activations

* **Razorpay Live Configuration**:
  1. Access your Razorpay Dashboard.
  2. Switch to **Live Mode**.
  3. Generate a new API Key and Secret. Save them securely in your backend Render parameters.
* **Cloudinary Activation**:
  1. Log into Cloudinary.
  2. Navigate to Settings and locate your Cloud Name, API Key, and Secret.
  3. Map these to the backend variables. Images will now stream directly to Cloudinary CDN storage buckets.
