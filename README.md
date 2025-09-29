# Smart Office Dashboard 🏢

A comprehensive conference room utilization and analytics platform built for **Dewey, Cheatham & Howe Law Firm**. This Next.js application demonstrates enterprise-grade IoT sensor data processing, real-time monitoring, and advanced analytics capabilities using Supabase as the backend.

For more information, please refer to the [FEATURES.md](FEATURES.md) file.

## 📋 Prerequisites

- **Node.js 18+**
- **npm/yarn/pnpm**
- **Supabase account** with project setup
- **Environment variables** (see configuration below)

## 🚀 Quick Start

1. **Clone and Install**

   ```bash
   git clone git@github.com:supabase/smart-office-demo.git
   cd smart-office-dashboard
   npm install
   ```

2. **Environment Configuration**

   ```bash
   # Configure your Supabase project specific variables
   cp .env.example .env.local

   # add a functions .env.local file, add an OPENAI_API_KEY to it
   cp supabase/functions/.env.example supabase/functions/.env.local
   ```

3. **Start a local Supabase dev environment**

   ```bash
   npx supabase start
   ```

4. **Start the Next.js dev server**

   ```bash
   npm run dev
   ```

5. **Access Application**
   Open [http://localhost:3000](http://localhost:3000)

## Generate demo data

1. Run the following command to generate rooms, users, tickets and associated images

   ```bash
   npm run generate:all
   ```

2. Serve all the functions:

   ```bash
   npm run functions:serve-all
   ```

3. Load some initial sensor data simulator:

   ```bash
   npm run simulate:sensors
   # Run it every time you want to simulate new sensor data for the real-time floorplan viewer
   ```

4. Load some initial booking data simulator:
   ```bash
   npm run simulate:bookings
   ```

## 🌊 pgflow Workflow Engine

This project includes [pgflow](https://pgflow.dev), a workflow engine for Supabase that helps with background jobs and queue processing. See [PGFLOW.md](./PGFLOW.md) for local development setup and examples.

# 🚀 Deploy your project!

## Deploy the website to Vercel

### Step 1: Create a GitHub Repository

1. **Fork this repository** on GitHub
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/YOUR_USERNAME/smart-office-demo.git
   cd smart-office-demo
   ```

### Step 2: Connect to Vercel

1. **Go to [vercel.com](https://vercel.com)** and sign up/login
2. **Click "New Project"**
3. **Import your GitHub repository**
4. **Vercel will auto-detect Next.js** - click "Deploy"

### Step 3: Add Environment Variables

1. **In your Vercel project dashboard**, go to **Settings** → **Environment Variables**
2. **Add these variables**:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   OPENAI_API_KEY=your_openai_api_key
   NEXT_PUBLIC_UNSPLASH_ACCESS_KEY=your_unsplash_access_key
   ```
3. **Click "Redeploy"** to apply the new variables

### Step 4: Deploy Supabase Functions

```bash
npm run functions:deploy-all
```

## Deploy the local Supabase project to hosted one

### Step 1: Create a Supabase Project

1. **Go to [supabase.com](https://supabase.com)** and sign up/login
2. **Click "New Project"**
3. **Choose your organization** and enter project details
4. **Wait for the project to be created** (takes a few minutes)

### Step 2: Link Your Local Project

1. **In your terminal**, run:
   ```bash
   npx supabase link --project-ref YOUR_PROJECT_REF
   ```
   (Find your project ref in the Supabase dashboard URL)

### Step 3: Push Your Database Schema

1. **Push migrations and seed data**:
   ```bash
   npx supabase db push
   ```

### Step 5: Update Environment Variables

1. **Copy your new Supabase credentials** from the project dashboard
2. **Update your Vercel environment variables** with the new hosted URLs and keys
3. **Redeploy your Vercel project**

**That's it!** Your Smart Office Dashboard is now live on Vercel with a hosted Supabase backend.

For pgflow workflows in production, see [Deploy to Supabase.com](https://www.pgflow.dev/how-to/deploy-to-supabasecom/).

### Environment Variables for Production

Ensure all environment variables are configured in your deployment platform with production Supabase credentials.

## 🤝 Contributing

1. Fork the repository
2. Create feature branches (`feature/analytics-enhancement`)
3. Follow TypeScript best practices
4. Add tests for new features
5. Submit pull request with detailed description

## 📄 License

MIT License - see LICENSE file for details

## 🏢 About Dewey, Cheatham & Howe

This application is built for the fictional law firm "Dewey, Cheatham & Howe," serving as a sophisticated demonstration of modern office technology solutions. The firm's 57 conference rooms across multiple floors provide an ideal scenario for showcasing enterprise-scale IoT monitoring and analytics capabilities.

---

**Built with ❤️ for enterprise IoT demonstrations**
**Showcasing: Next.js 15, Supabase, Analytics Buckets, Real-time Data Processing**
