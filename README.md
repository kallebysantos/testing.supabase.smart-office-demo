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
   git clone <repository-url>
   cd smart-office-dashboard
   npm install
   ```

2. **Environment Configuration**

   ```bash
   cp .env.example .env.local
   # Configure your Supabase project specific variables
   ```

3. **Start Supabase local dev environment**

   ```bash
   npx supabase start
   ```

4. **Start Development**

   ```bash
   npm run dev
   ```

5. **Access Application**
   Open [http://localhost:3000](http://localhost:3000)

## Generate demo data

1. Run the following commands, either in parallel or sequentially:

   ```bash
   npm run generate:rooms
   npm run generate:users
   npm run generate:tickets
   npm run generate:images
   ```

2. Deploy the functions:

   ```bash
   npm run functions:deploy-all
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

## 🚀 Deployment

### Vercel Deployment (Recommended)

```bash
# Build and deploy
npm run build
# Configure environment variables in Vercel dashboard
# Connect GitHub repository for automatic deployments
```

### Manual Production Deployment

```bash
npm run build
npm run start
```

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
**Showcasing: Next.js 14, Supabase, Analytics Buckets, Real-time Data Processing**
