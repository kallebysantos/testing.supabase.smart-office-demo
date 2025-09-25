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
