#!/bin/bash

# Test Admin Authentication Script
# This script helps debug 401 Unauthorized errors

echo "=== Testing Admin Authentication ==="
echo ""

# Step 1: Admin Login
echo "Step 1: Attempting admin login..."
LOGIN_RESPONSE=$(curl -s -X POST http://localhost:5000/api/admin/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "your-password"
  }')

echo "Login Response:"
echo "$LOGIN_RESPONSE" | jq '.' 2>/dev/null || echo "$LOGIN_RESPONSE"
echo ""

# Extract access token
ACCESS_TOKEN=$(echo "$LOGIN_RESPONSE" | jq -r '.data.accessToken' 2>/dev/null)

if [ "$ACCESS_TOKEN" == "null" ] || [ -z "$ACCESS_TOKEN" ]; then
  echo "❌ Failed to get access token. Please check your credentials."
  echo "Make sure to update the email and password in this script."
  exit 1
fi

echo "✅ Access token obtained"
echo "Token: ${ACCESS_TOKEN:0:50}..."
echo ""

# Step 2: Test Protected Endpoint
echo "Step 2: Testing /api/admin/admins endpoint..."
ADMINS_RESPONSE=$(curl -s -X GET http://localhost:5000/api/admin/admins \
  -H "Authorization: Bearer $ACCESS_TOKEN")

echo "Admins Response:"
echo "$ADMINS_RESPONSE" | jq '.' 2>/dev/null || echo "$ADMINS_RESPONSE"
echo ""

# Check if successful
if echo "$ADMINS_RESPONSE" | grep -q '"statusCode":401'; then
  echo "❌ Still getting 401 Unauthorized"
  echo ""
  echo "Possible issues:"
  echo "1. JWT_SECRET mismatch between login and validation"
  echo "2. Token format issue"
  echo "3. Authentication guard configuration problem"
elif echo "$ADMINS_RESPONSE" | grep -q '"success":true'; then
  echo "✅ Authentication successful!"
else
  echo "⚠️  Unexpected response. Check the output above."
fi


