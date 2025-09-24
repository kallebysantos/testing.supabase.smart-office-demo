#!/bin/bash

# Room Booking Simulator - Production Cron Job Simulator
# This script calls the deployed room-booking-simulator Edge Function
# to simulate the cron job that would run every 20 minutes in production

set -e

# Load environment variables from .env.local if present (or override via ENV_FILE)
ENV_FILE="${ENV_FILE:-.env.local}"
if [ -f "$ENV_FILE" ]; then
  # Export all variables defined in the env file
  set -a
  # shellcheck disable=SC1090
  . "$ENV_FILE"
  set +a
fi

echo "🏛️ Starting room booking simulation..."
echo "⏰ Simulating cron job that runs every 20 minutes"
echo ""

# Supabase project configuration (loaded from environment)
# Allow SUPABASE_URL to fall back to NEXT_PUBLIC_SUPABASE_URL
SUPABASE_URL="${SUPABASE_URL:-$NEXT_PUBLIC_SUPABASE_URL}"
: "${SUPABASE_URL:?SUPABASE_URL or NEXT_PUBLIC_SUPABASE_URL is required (set in your shell or in $ENV_FILE)}"

# For key prefer ANON_KEY, fallback to NEXT_PUBLIC_SUPABASE_ANON_KEY
ANON_KEY="${ANON_KEY:-$NEXT_PUBLIC_SUPABASE_ANON_KEY}"
: "${ANON_KEY:?ANON_KEY or NEXT_PUBLIC_SUPABASE_ANON_KEY is required (set in your shell or in $ENV_FILE)}"

echo "🔑 Using deployed Edge Function at $SUPABASE_URL"
echo ""

# Call the deployed Edge Function
echo "📞 Calling room-booking-simulator Edge Function..."
echo ""

RESPONSE=$(curl -s -L -X POST \
    "$SUPABASE_URL/functions/v1/room-booking-simulator" \
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
echo "✅ Room booking simulation completed!"
echo ""

# Extract stats if available
if command -v jq >/dev/null 2>&1; then
    echo "📊 Booking Statistics:"
    echo "$RESPONSE" | jq -r '
        if .stats then
            "   • Total bookings created: \(.stats.totalBookings)",
            "   • Rooms processed: \(.stats.roomCount)",
            "   • Time slots processed: \(.stats.timeSlotsProcessed)",
            "   • Available organizers: \(.stats.userCount)"
        else
            "   (Statistics not available)"
        end'
else
    echo "📊 Raw response:"
    echo "$RESPONSE"
fi

echo ""
echo "🎉 Room booking simulation complete!"
echo ""
echo "💡 In production, this would run automatically every 20 minutes via cron job"
echo "💡 Check your /bookings page to see the newly created meetings"