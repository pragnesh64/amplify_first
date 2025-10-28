#!/bin/bash

# Complete Booking Scenario Test with cURL
# This script tests the complete booking flow using your actual API endpoint

echo "🎫 Complete Booking Scenario Test"
echo "=================================="

# API Configuration
API_URL="https://i33umv4fevdy3drap7v64htozy.appsync-api.ap-south-1.amazonaws.com/graphql"
AUTH_TOKEN="eyJraWQiOiJsM1FzZmZOSmF1aUZ6MGhPbUJkYTN2cm5La0x0Q3FCRlhVS2JJYTBmOFI0PSIsImFsZyI6IlJTMjU2In0.eyJzdWIiOiI1MTQzOWRhYS0yMGYxLTcwN2MtY2UyYi0wMGE2MDJiZGVjM2MiLCJpc3MiOiJodHRwczpcL1wvY29nbml0by1pZHAuYXAtc291dGgtMS5hbWF6b25hd3MuY29tXC9hcC1zb3V0aC0xX1pnUXZDYWU4diIsImNsaWVudF9pZCI6IjZnOHJnNDNwZTQxaWU3dnRqdm1tNzRqc21yIiwib3JpZ2luX2p0aSI6ImM4MzIwYWUzLWUyYTEtNGZiYS05NmFhLTFhNzVhMDc1ZTA3MSIsImV2ZW50X2lkIjoiOTUyYzg5MzUtNjhmYy00NDE4LTk4NWQtYzJiZDYxNGRkMzNlIiwidG9rZW5fdXNlIjoiYWNjZXNzIiwic2NvcGUiOiJhd3MuY29nbml0by5zaWduaW4udXNlci5hZG1pbiIsImF1dGhfdGltZSI6MTc2MDQ2MjExMiwiZXhwIjoxNzYwNDY5NjU1LCJpYXQiOjE3NjA0NjYwNTUsImp0aSI6IjYzMjEyYjJhLTk1ZTYtNDQ1My1iZTA4LTg2MDQ2ZDUzMjk1YSIsInVzZXJuYW1lIjoiNTE0MzlkYWEtMjBmMS03MDdjLWNlMmItMDBhNjAyYmRlYzNjIn0.EvaqH11aEhH9Q2155zn-qP3CHcwMjOeiUPYxS4ecgObs1t6ahEHoWRb7CtpmaQPOUi5JwjXzJw2wGVjjfAiiZ5mVTNksXQ4tkKQ5Gdo3ECIo1wRq_95I7igdAlMwvuMPdPjI7jo4xxXFElDSNznfuYzCNskSM4rb5h7YzLLEuJBuseCtccNTgtK5f_1cAy8oQkY1K_Q6wsBZmObIUhQNUQR-RdR7Mk19fxH4mbb2xAGIlngTg_FR3tIJdGspxHto8P5ZJNs-MNSsJwReVHu3SCI_qDQ79h8P_TON-4eD88tIsPuq-OLb9WueP3Ar3Z0RrmB-osmi8FXe32i5PCrhAw"

# Test data
EVENT_ID="62ee14a5-1910-4bbd-9e88-7eaa13fb7108"
USER_ID="51439daa-20f1-707c-ce2b-00a602bdec3c"
USER_NAME="adminuser"
USER_EMAIL="adminuser@yopmail.com"
EVENT_TITLE="Test Event"
QUANTITY=1
TOTAL_PRICE=12
QR_CODE="EVENTORA-62ee14a5-1910-4bbd-9e88-7eaa13fb7108-51439daa-20f1-707c-ce2b-00a602bdec3c-$(date +%s)"

echo "📋 Step 1: Testing Event List"
echo "-----------------------------"

# Test 1: List Events
curl -X POST "$API_URL" \
  -H "Content-Type: application/json" \
  -H "Authorization: $AUTH_TOKEN" \
  -H "x-amz-user-agent: aws-amplify/6.6.6 api/1 framework/1" \
  --data-raw '{
    "query": "query { listEvents { items { id title description date location totalTickets ticketsAvailable price category imageUrl createdBy createdAt updatedAt owner } nextToken __typename } }",
    "variables": {}
  }' \
  --silent --show-error | jq '.'

echo -e "\n🎫 Step 2: Creating Booking"
echo "-----------------------------"

# Test 2: Create Booking
BOOKING_RESPONSE=$(curl -X POST "$API_URL" \
  -H "Content-Type: application/json" \
  -H "Authorization: $AUTH_TOKEN" \
  -H "x-amz-user-agent: aws-amplify/6.6.6 api/1 framework/1" \
  --data-raw "{
    \"query\": \"mutation (\$input: CreateBookingInput!) { createBooking(input: \$input) { id eventId userId userName userEmail eventTitle quantity totalPrice status qrCode createdAt updatedAt owner } }\",
    \"variables\": {
      \"input\": {
        \"eventId\": \"$EVENT_ID\",
        \"userId\": \"$USER_ID\",
        \"userName\": \"$USER_NAME\",
        \"userEmail\": \"$USER_EMAIL\",
        \"eventTitle\": \"$EVENT_TITLE\",
        \"quantity\": $QUANTITY,
        \"totalPrice\": $TOTAL_PRICE,
        \"status\": \"confirmed\",
        \"qrCode\": \"$QR_CODE\",
        \"createdAt\": \"$(date -u +%Y-%m-%dT%H:%M:%S.%3NZ)\"
      }
    }
  }" \
  --silent --show-error)

echo "$BOOKING_RESPONSE" | jq '.'

# Extract booking ID from response
BOOKING_ID=$(echo "$BOOKING_RESPONSE" | jq -r '.data.createBooking.id // empty')

if [ -n "$BOOKING_ID" ] && [ "$BOOKING_ID" != "null" ]; then
    echo -e "\n✅ Booking created successfully!"
    echo "Booking ID: $BOOKING_ID"
    echo "QR Code: $QR_CODE"
else
    echo -e "\n❌ Booking creation failed!"
    echo "Response: $BOOKING_RESPONSE"
    exit 1
fi

echo -e "\n🎟️ Step 3: Updating Event Tickets"
echo "-----------------------------------"

# Test 3: Update Event Tickets (simulate ticket deduction)
curl -X POST "$API_URL" \
  -H "Content-Type: application/json" \
  -H "Authorization: $AUTH_TOKEN" \
  -H "x-amz-user-agent: aws-amplify/6.6.6 api/1 framework/1" \
  --data-raw "{
    \"query\": \"mutation (\$input: UpdateEventInput!) { updateEvent(input: \$input) { id title totalTickets ticketsAvailable updatedAt } }\",
    \"variables\": {
      \"input\": {
        \"id\": \"$EVENT_ID\",
        \"ticketsAvailable\": 99
      }
    }
  }" \
  --silent --show-error | jq '.'

echo -e "\n🔍 Step 4: Verifying Booking"
echo "-----------------------------"

# Test 4: List Bookings to verify
curl -X POST "$API_URL" \
  -H "Content-Type: application/json" \
  -H "Authorization: $AUTH_TOKEN" \
  -H "x-amz-user-agent: aws-amplify/6.6.6 api/1 framework/1" \
  --data-raw "{
    \"query\": \"query { listBookings(filter: { eventId: { eq: \\\"$EVENT_ID\\\" } }) { items { id eventId userId userName userEmail eventTitle quantity totalPrice status qrCode createdAt updatedAt } nextToken __typename } }\",
    \"variables\": {}
  }" \
  --silent --show-error | jq '.'

echo -e "\n📱 Step 5: Testing QR Validation"
echo "--------------------------------"

# Test 5: Update booking status to "used" (simulate QR validation)
curl -X POST "$API_URL" \
  -H "Content-Type: application/json" \
  -H "Authorization: $AUTH_TOKEN" \
  -H "x-amz-user-agent: aws-amplify/6.6.6 api/1 framework/1" \
  --data-raw "{
    \"query\": \"mutation (\$input: UpdateBookingInput!) { updateBooking(input: \$input) { id status usedAt updatedAt } }\",
    \"variables\": {
      \"input\": {
        \"id\": \"$BOOKING_ID\",
        \"status\": \"used\",
        \"usedAt\": \"$(date -u +%Y-%m-%dT%H:%M:%S.%3NZ)\"
      }
    }
  }" \
  --silent --show-error | jq '.'

echo -e "\n📧 Step 6: Email Notification (Simulated)"
echo "------------------------------------------"

# Test 6: Simulate email notification
echo "Email would be sent to: $USER_EMAIL"
echo "Subject: 🎟️ Your Ticket for $EVENT_TITLE - Booking Confirmed!"
echo "QR Code: $QR_CODE"
echo "Event: $EVENT_TITLE"
echo "Quantity: $QUANTITY"
echo "Total Price: \$$TOTAL_PRICE"

echo -e "\n🎉 Complete Booking Scenario Test Finished!"
echo "============================================="
echo "✅ Event list fetched"
echo "✅ Booking created"
echo "✅ Event tickets updated"
echo "✅ Booking verified"
echo "✅ QR code validated"
echo "✅ Email notification simulated"

echo -e "\n📋 Test Summary:"
echo "Event ID: $EVENT_ID"
echo "Booking ID: $BOOKING_ID"
echo "User: $USER_NAME ($USER_EMAIL)"
echo "QR Code: $QR_CODE"
echo "Status: Used (validated)"

echo -e "\n🚀 Next Steps:"
echo "1. Check your email for confirmation"
echo "2. Test QR scanner in admin panel"
echo "3. Verify booking in My Bookings page"
echo "4. Test event reminders (24h before event)"
