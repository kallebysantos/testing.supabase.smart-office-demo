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

## 📱 Application Architecture

### Page Structure
```
📁 src/app/
├── 📄 page.tsx           # Landing/redirect page
├── 🔐 login/             # Authentication
├── 📊 dashboard/         # Executive metrics overview  
├── 🏢 rooms/             # Live room monitoring (main page)
├── 📅 bookings/          # Booking management
├── 📈 analytics/         # Historical analysis & Analytics Buckets
├── 🚨 alerts/            # Real-time facilities management system
└── 👤 profile/           # User profile settings
```

### Component Architecture
```
📁 src/components/
├── 🎨 ui/                # shadcn/ui base components
├── 🧭 navigation/        # Navigation menu with role-based access
├── 🏢 dashboard/         # Dashboard-specific widgets
├── 📊 charts/            # Custom chart components
└── 🔧 common/            # Shared utility components
```

### Data Layer
```
📁 src/lib/
├── 🔌 supabase/          # Database client and configuration
├── 🎯 types/             # TypeScript definitions
└── 🛠️ utils/             # Helper functions and utilities
```

## 🏗️ Database Schema

### Core Tables
- **`rooms`** - Conference room details (57 rooms across multiple floors)
- **`sensor_readings`** - IoT sensor data (occupancy, temperature, noise, air quality)
- **`room_bookings`** - Calendar integration and booking data
- **`user_profiles`** - User authentication and role management
- **`service_tickets`** - Automated facilities management tickets with ServiceNow integration
- **`facility_alerts`** - Legacy system notifications and maintenance alerts

### Real-time Features
- **Live sensor updates** via Supabase real-time subscriptions
- **Booking status changes** with immediate UI updates
- **Automated capacity violation detection** with service ticket creation
- **Real-time ticket queue processing** and assignment workflows
- **ServiceNow integration** for enterprise facilities management
- **Environmental monitoring** with threshold notifications

### Analytics Buckets Integration
- **Large-scale historical analysis** using Apache Iceberg
- **Time travel queries** for data versioning
- **Schema evolution support** for changing data requirements
- **Open table format** for data portability

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