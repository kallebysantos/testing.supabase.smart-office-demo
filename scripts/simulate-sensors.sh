#!/bin/bash

# Sensor Data Simulator - Production Cron Job Simulator  
# This script calls the deployed sensor-data-simulator Edge Function
# to simulate the cron job that would run every minute in production

set -e

echo "📡 Starting sensor data simulation..."
echo "⏰ Simulating cron job that runs every minute (45 seconds of data)"
echo ""

# Supabase project configuration
SUPABASE_URL="https://nnipoczsqoylnrwidbgp.supabase.co"
ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5uaXBvY3pzcW95bG5yd2lkYmdwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcxODU0MDUsImV4cCI6MjA3Mjc2MTQwNX0.-AVWvor9auHAz3CI8RYPrFW3UPhUbBbHEAYWK7YdVQY"

echo "🔑 Using deployed Edge Function at $SUPABASE_URL"
echo ""

# Call the deployed Edge Function
echo "📞 Calling sensor-data-simulator Edge Function..."
echo "⏱️ This will generate 45 seconds of sensor data..."
echo ""

RESPONSE=$(curl -s -L -X POST \
    "$SUPABASE_URL/functions/v1/sensor-data-simulator" \
    -H "Authorization: Bearer $ANON_KEY" \
    -H "Content-Type: application/json" \
    -d '{}')

# Check if the response contains an error
if echo "$RESPONSE" | grep -q '"error"'; then
    echo "❌ Edge Function returned an error:"
    echo "$RESPONSE" | jq -r '.error' 2>/dev/null || echo "$RESPONSE"
    exit 1
fi

# Parse and display the results
echo ""
echo "✅ Sensor data simulation completed!"
echo ""

# Extract stats if available
if command -v jq >/dev/null 2>&1; then
    echo "📊 Sensor Statistics:"
    echo "$RESPONSE" | jq -r '
        if .stats then
            "   • Total readings generated: \(.stats.totalReadings)",
            "   • Rooms monitored: \(.stats.roomCount)",  
            "   • Bookings considered: \(.stats.bookingCount // 0)",
            "   • Duration: \(.stats.durationSeconds)s",
            "   • Readings per room: \(.stats.readingsPerRoom)"
        else
            "   (Statistics not available)"
        end'
else
    echo "📊 Raw response:"
    echo "$RESPONSE"
fi

echo ""
echo "🎉 Sensor data simulation complete!"
echo ""
echo "💡 In production, this would run automatically every minute via cron job"
echo "💡 Check your /rooms and /dashboard pages to see live sensor data"
echo "💡 Run this script multiple times to simulate continuous data flow"