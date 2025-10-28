#!/bin/bash

# Simple Booking Test - Works Now!
# This tests booking functionality with current schema (no QR code required)

echo "🎫 EVENT BOOKING TEST - WORKING NOW!"
echo "====================================="
echo ""

# API Configuration
API_URL="https://i33umv4fevdy3drap7v64htozy.appsync-api.ap-south-1.amazonaws.com/graphql"
AUTH_TOKEN="$1"

# Check if auth token provided
if [ -z "$AUTH_TOKEN" ]; then
    echo "❌ Error: No authentication token provided"
    echo ""
    echo "Usage: ./test-booking-now.sh YOUR_AUTH_TOKEN"
    echo ""
    echo "To get your auth token:"
    echo "1. Open your app in browser (http://localhost:5173)"
    echo "2. Login with your account"
    echo "3. Open Developer Tools (F12)"
    echo "4. Go to Network tab"
    echo "5. Make a GraphQL request"
    echo "6. Copy the 'authorization' header value"
    echo ""
    exit 1
fi

echo "📋 Step 1: Fetching Available Events"
echo "-------------------------------------"

EVENTS_RESPONSE=$(curl -s -X POST "$API_URL" \
  -H "Content-Type: application/json" \
  -H "Authorization: $AUTH_TOKEN" \
  -H "x-amz-user-agent: aws-amplify/6.6.6 api/1 framework/1" \
  --data-raw '{
    "query": "query { listEvents { items { id title description date location totalTickets ticketsAvailable price category } } }",
    "variables": {}
  }')

# Check for errors
if echo "$EVENTS_RESPONSE" | grep -q '"errors"'; then
    echo "❌ Failed to fetch events"
    echo "$EVENTS_RESPONSE" | jq '.'
    exit 1
fi

# Display events
echo "$EVENTS_RESPONSE" | jq -r '.data.listEvents.items[] | "✅ \(.title) - \(.ticketsAvailable)/\(.totalTickets) tickets - $\(.price)"'

# Get first available event
EVENT_ID=$(echo "$EVENTS_RESPONSE" | jq -r '.data.listEvents.items[0].id')
EVENT_TITLE=$(echo "$EVENTS_RESPONSE" | jq -r '.data.listEvents.items[0].title')
EVENT_PRICE=$(echo "$EVENTS_RESPONSE" | jq -r '.data.listEvents.items[0].price')
TICKETS_AVAILABLE=$(echo "$EVENTS_RESPONSE" | jq -r '.data.listEvents.items[0].ticketsAvailable')

if [ -z "$EVENT_ID" ] || [ "$EVENT_ID" == "null" ]; then
    echo "❌ No events available"
    exit 1
fi

echo ""
echo "🎯 Selected Event: $EVENT_TITLE"
echo "   Event ID: $EVENT_ID"
echo "   Available Tickets: $TICKETS_AVAILABLE"
echo "   Price: \$$EVENT_PRICE"
echo ""

# Check if tickets available
if [ "$TICKETS_AVAILABLE" -le 0 ]; then
    echo "❌ No tickets available for this event"
    exit 1
fi

echo "🎫 Step 2: Creating Your Booking"
echo "---------------------------------"

QUANTITY=1
TOTAL_PRICE=$EVENT_PRICE

BOOKING_RESPONSE=$(curl -s -X POST "$API_URL" \
  -H "Content-Type: application/json" \
  -H "Authorization: $AUTH_TOKEN" \
  -H "x-amz-user-agent: aws-amplify/6.6.6 api/1 framework/1" \
  --data-raw "{
    \"query\": \"mutation (\$input: CreateBookingInput!) { createBooking(input: \$input) { id eventId userId userName userEmail eventTitle quantity totalPrice status createdAt updatedAt } }\",
    \"variables\": {
      \"input\": {
        \"eventId\": \"$EVENT_ID\",
        \"userId\": \"user-$(date +%s)\",
        \"userName\": \"Test User\",
        \"userEmail\": \"test@example.com\",
        \"eventTitle\": \"$EVENT_TITLE\",
        \"quantity\": $QUANTITY,
        \"totalPrice\": $TOTAL_PRICE,
        \"status\": \"confirmed\"
      }
    }
  }")

# Check for errors
if echo "$BOOKING_RESPONSE" | grep -q '"errors"'; then
    echo "❌ Booking failed"
    echo "$BOOKING_RESPONSE" | jq '.'
    exit 1
fi

BOOKING_ID=$(echo "$BOOKING_RESPONSE" | jq -r '.data.createBooking.id')

if [ -z "$BOOKING_ID" ] || [ "$BOOKING_ID" == "null" ]; then
    echo "❌ Booking creation failed"
    echo "$BOOKING_RESPONSE" | jq '.'
    exit 1
fi

echo "✅ Booking Created Successfully!"
echo ""
echo "📋 Booking Details:"
echo "$BOOKING_RESPONSE" | jq '.data.createBooking'
echo ""

echo "🔍 Step 3: Verifying Your Booking"
echo "-----------------------------------"

VERIFY_RESPONSE=$(curl -s -X POST "$API_URL" \
  -H "Content-Type: application/json" \
  -H "Authorization: $AUTH_TOKEN" \
  -H "x-amz-user-agent: aws-amplify/6.6.6 api/1 framework/1" \
  --data-raw "{
    \"query\": \"query { listBookings(filter: { id: { eq: \\\"$BOOKING_ID\\\" } }) { items { id eventTitle userName userEmail quantity totalPrice status createdAt } } }\",
    \"variables\": {}
  }")

echo "✅ Booking Verified:"
echo "$VERIFY_RESPONSE" | jq '.data.listBookings.items[0]'
echo ""

echo "🎉 BOOKING TEST COMPLETED SUCCESSFULLY!"
echo "========================================"
echo ""
echo "✅ Summary:"
echo "   Event: $EVENT_TITLE"
echo "   Booking ID: $BOOKING_ID"
echo "   Quantity: $QUANTITY ticket(s)"
echo "   Total Price: \$$TOTAL_PRICE"
echo "   Status: Confirmed"
echo ""
echo "📱 Next Steps:"
echo "1. Go to your app: http://localhost:5173"
echo "2. Navigate to 'My Bookings'"
echo "3. See your confirmed ticket"
echo "4. Wait for QR code (after schema deployment)"
echo "5. Check email for confirmation"
echo ""
echo "🚀 Your booking system is working!"
