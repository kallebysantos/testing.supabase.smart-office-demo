# Smart Office Dashboard 🏢

A sophisticated conference room utilization and analytics dashboard built for enterprise tradeshows. This application demonstrates real-time IoT sensor data processing capabilities in a professional law firm environment.

**Company**: Dewey, Cheatham & Howe (Law Firm)  
**Purpose**: Enterprise booth demo showcasing modern office technology

## 🚀 Features

- **Real-time Room Monitoring**: Live occupancy and environmental data
- **Interactive Analytics**: Historical usage patterns and insights  
- **Professional Authentication**: Secure login with company branding
- **Live Data Streaming**: Raw sensor data feed for demonstrations
- **Responsive Design**: Optimized for both desktop and mobile devices
- **Enterprise-grade UI**: Built with shadcn/ui components

## 🛠️ Tech Stack

- **Framework**: [Next.js 14](https://nextjs.org/) with App Router
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **UI Components**: [shadcn/ui](https://ui.shadcn.com/)
- **Database**: [Supabase](https://supabase.com/)
- **Charts**: [Recharts](https://recharts.org/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **External APIs**: Unsplash, OpenAI

## 📋 Prerequisites

- Node.js 18+ 
- npm, yarn, or pnpm
- Supabase account
- Unsplash API account
- OpenAI API account

## ⚙️ Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Unsplash API
NEXT_PUBLIC_UNSPLASH_ACCESS_KEY=your_unsplash_access_key

# OpenAI API  
OPENAI_API_KEY=your_openai_api_key

# App Configuration
NEXTAUTH_SECRET=your_nextauth_secret
NEXTAUTH_URL=http://localhost:3000
```

### Environment Variable Descriptions

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL | ✅ |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous/public key | ✅ |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (server-side) | ✅ |
| `NEXT_PUBLIC_UNSPLASH_ACCESS_KEY` | Unsplash API access key for office images | ✅ |
| `OPENAI_API_KEY` | OpenAI API key for intelligent insights | ✅ |
| `NEXTAUTH_SECRET` | Secret for NextAuth.js sessions | ✅ |
| `NEXTAUTH_URL` | Base URL for authentication callbacks | ✅ |

## 🚀 Getting Started

1. **Clone and Install**
   ```bash
   git clone <repository-url>
   cd smart-office-dashboard
   npm install
   ```

2. **Set up Environment Variables**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your actual API keys
   ```

3. **Initialize Supabase**
   ```bash
   npx supabase init
   npx supabase start
   ```

4. **Run Development Server**
   ```bash
   npm run dev
   ```

5. **Open Application**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📱 Application Structure

```
src/
├── app/                    # Next.js App Router
│   ├── login/             # Authentication page
│   ├── rooms/             # Main dashboard
│   ├── analytics/         # Historical data analysis  
│   └── raw-data/          # Live sensor data stream
├── components/
│   ├── ui/                # shadcn/ui components
│   ├── dashboard/         # Dashboard-specific components
│   ├── auth/              # Authentication components
│   └── common/            # Shared components
├── lib/
│   ├── supabase/          # Database configuration
│   ├── utils/             # Utility functions
│   └── types/             # TypeScript definitions
└── hooks/                 # Custom React hooks
```

## 🎯 Key Pages

### 🔐 Login (`/login`)
- Branded authentication interface
- Secure login with Supabase Auth
- Professional law firm styling

### 🏢 Main Dashboard (`/rooms`)
- Real-time room occupancy display
- Environmental monitoring (temperature, etc.)
- Historical occupancy charts (24-hour view, 30-minute segments)
- Live sensor integration

### 📊 Analytics (`/analytics`) 
- Historical usage patterns
- Trend analysis and insights
- Interactive data visualizations
- Usage optimization recommendations

### 🔴 Raw Data Stream (`/raw-data`)
- Live sensor data feed
- Real-time updates for demos
- Technical monitoring interface
- WebSocket connections for live data

## 🔧 Development Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run type-check   # TypeScript type checking
```

## 🏗️ Database Schema

The application uses Supabase with the following main tables:

- `rooms` - Conference room information
- `sensors` - IoT sensor configurations  
- `sensor_readings` - Historical sensor data
- `occupancy_events` - Room occupancy tracking
- `users` - User authentication and profiles

## 🚦 API Integrations

### Supabase
- Real-time database subscriptions
- Authentication and user management
- Row Level Security (RLS) policies

### Unsplash
- Professional office imagery
- Dynamic background images
- High-quality room photographs

### OpenAI  
- Intelligent data insights
- Usage pattern analysis
- Natural language summaries

## 🔒 Security Features

- Row Level Security (RLS) with Supabase
- Environment variable protection
- Secure API key management
- Authentication middleware
- Input validation and sanitization

## 📈 Performance Optimizations

- Server-side rendering with Next.js 14
- Image optimization with next/image
- Code splitting and lazy loading
- Efficient real-time subscriptions
- Optimized bundle sizes

## 🚀 Deployment

### Vercel (Recommended)
```bash
npm run build
# Deploy to Vercel with environment variables configured
```

### Manual Deployment
```bash
npm run build
npm run start
```

## 🧪 Testing

```bash
npm run test         # Run unit tests
npm run test:e2e     # Run end-to-end tests  
npm run test:watch   # Watch mode testing
```

## 📝 Contributing

1. Fork the repository
2. Create a feature branch
3. Follow code quality standards
4. Add tests for new features
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details

## 🤝 Support

For demo setup assistance or technical questions:
- Create an issue in this repository
- Contact the development team
- Review the `Agents.md` file for detailed technical specifications

---

**Built with ❤️ for enterprise demonstrations**