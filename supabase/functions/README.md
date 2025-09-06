# Smart Office Dashboard - Edge Functions

This directory contains Supabase Edge Functions for the Smart Office Dashboard application.

## 📡 sensor-data-simulator

A sophisticated IoT sensor data simulator that generates realistic readings for all conference rooms over a 5-minute period.

### 🎯 Purpose

Perfect for live demos and presentations where you need:
- **Real-time sensor data** flowing into your dashboard
- **Realistic patterns** that match actual office usage
- **Controlled timing** (exactly 5 minutes for presentations)
- **Professional appearance** with smooth data transitions

### 🏗️ How It Works

The simulator generates data every **3-5 seconds** for all conference rooms with:

**📊 Occupancy Data:**
- Business hours patterns (8 AM - 6 PM high activity)
- Lunch time dips (12-2 PM lower occupancy) 
- Peak meeting times (9-11 AM, 2-4 PM)
- Room size considerations (large rooms used less frequently)
- Floor-based variations (executive floors less busy)

**🌡️ Temperature Readings:**
- Base temperature: ~70°F with floor variations
- Occupancy heat effect (more people = warmer)
- Time of day variations (warmer afternoons)
- Realistic fluctuations (±2°F)

**🔊 Noise Levels:**
- Ambient office noise baseline (32-35 dB)
- Conversation levels based on occupancy
- Room acoustics considerations
- Ground floor street noise effects

**💨 Air Quality Index:**
- High baseline quality (85/100 for office environment)
- Degradation with occupancy
- Better quality on higher floors
- HVAC improvement throughout the day

### 🚀 Deployment

1. **Deploy the function:**
   ```bash
   supabase functions deploy sensor-data-simulator
   ```

2. **Test locally first:**
   ```bash
   supabase start
   supabase functions serve
   curl -X POST "http://localhost:54321/functions/v1/sensor-data-simulator" \
     -H "Authorization: Bearer [anon-key]" \
     -H "Content-Type: application/json" \
     -d '{}'
   ```

3. **Use the test script:**
   ```bash
   ./scripts/test-edge-function.sh
   ```

### 📈 Usage Scenarios

**🎪 Live Demos:**
```bash
# Start simulation right before presenting dashboard
curl -X POST "https://[project-ref].supabase.co/functions/v1/sensor-data-simulator" \
  -H "Authorization: Bearer [anon-key]" \
  -H "Content-Type: application/json" \
  -d '{}'
```

**⏰ Scheduled Simulations (Future):**
```sql
-- Cron job example (can be set up in Supabase)
SELECT cron.schedule('sensor-simulation', '*/10 * * * *', 
  'SELECT net.http_post(url:=''https://[project-ref].supabase.co/functions/v1/sensor-data-simulator'')');
```

**🧪 Development Testing:**
```bash
# Quick test with immediate results
npm run test:sensors
```

### 📊 Output Example

The function returns comprehensive statistics:

```json
{
  "success": true,
  "message": "Sensor data simulation completed",
  "stats": {
    "totalReadings": 1710,
    "roomCount": 57,
    "durationSeconds": 300,
    "averageReadingsPerSecond": 5.7
  }
}
```

### 🎛️ Data Patterns

The simulator creates realistic patterns that demo attendees will recognize:

- **Morning rush:** Rooms fill up as people arrive
- **Meeting blocks:** Popular times show high occupancy  
- **Lunch lull:** Notable decrease in activity
- **Afternoon peak:** Second wave of meetings
- **End of day:** Gradual emptying

### 🔧 Technical Details

**Architecture:**
- **Runtime:** Deno with TypeScript
- **Database:** Direct Supabase client with service role
- **Batching:** Inserts all room data per cycle
- **Error Handling:** Continues on individual failures
- **Logging:** Comprehensive console output

**Performance:**
- **Rooms Supported:** Unlimited (tested with 57 rooms)
- **Data Points:** ~300-400 readings per minute
- **Memory Usage:** Low (stateless generation)
- **Execution Time:** Exactly 5 minutes

**Dependencies:**
- `@supabase/supabase-js@2` - Database operations
- Standard Deno runtime libraries

### 🔒 Security

- Uses **Service Role Key** for database writes
- **CORS enabled** for dashboard integration  
- **Input validation** on all generated data
- **Rate limiting** through natural 3-5 second delays

### 🐛 Troubleshooting

**Common Issues:**

1. **Permission Errors:**
   ```
   Ensure SUPABASE_SERVICE_ROLE_KEY is set in Supabase dashboard
   ```

2. **No Rooms Found:**
   ```
   Run seed data generator first: npm run seed:generate
   ```

3. **Timeout Issues:**
   ```
   Function has 30-second default timeout - increase in Supabase settings
   ```

4. **Database Errors:**
   ```
   Check RLS policies allow service role to insert sensor_readings
   ```

### 📈 Monitoring

View real-time function execution:

```bash
# Watch logs during execution
supabase functions logs sensor-data-simulator --follow

# Check function metrics in Supabase dashboard
# Functions → sensor-data-simulator → Metrics
```

### 🎯 Demo Tips

1. **Pre-demo:** Clear old sensor data for clean slate
2. **Timing:** Start function 30 seconds before showing dashboard
3. **Visuals:** Point out the live updating timestamps
4. **Story:** Explain the realistic office patterns being generated
5. **Interaction:** Show different room types having different patterns

Perfect for creating that "wow factor" when prospects see live data flowing in real-time! 🌟