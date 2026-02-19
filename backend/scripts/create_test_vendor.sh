#!/bin/bash

# Configuration
API_URL="http://localhost:9000"
# Use a random email to ensure fresh start
RANDOM_ID=$(date +%s)
EMAIL="kaninsorn27@gmail.com"
# EMAIL="vendor_$RANDOM_ID@test.com"
PASSWORD="password"
VENDOR_NAME="KNS Test"
VENDOR_HANDLE="KNS-$RANDOM_ID"
COOKIE_FILE="/tmp/cookies_$RANDOM_ID.txt"

echo "Creating Test Vendor with Email: $EMAIL"

# Function to check response code
check_success() {
  if [ $1 -ge 200 ] && [ $1 -lt 300 ]; then
    return 0
  else
    return 1
  fi
}

echo "1. Registering Identity..."
REGISTER_HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" -c "$COOKIE_FILE" -X POST "$API_URL/auth/vendor/emailpass/register" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"$EMAIL\",
    \"password\": \"$PASSWORD\"
  }")

if check_success $REGISTER_HTTP_CODE; then
  echo "   Registration successful (HTTP $REGISTER_HTTP_CODE)."
else
  echo "   Registration failed (HTTP $REGISTER_HTTP_CODE)."
fi

# 2. Login (Initial)
echo "2. Logging in (Initial)..."
LOGIN_RESPONSE=$(curl -s -w "\nHTTP_CODE:%{http_code}" -c "$COOKIE_FILE" -X POST "$API_URL/auth/vendor/emailpass" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"$EMAIL\",
    \"password\": \"$PASSWORD\"
  }")

LOGIN_HTTP_CODE=$(echo "$LOGIN_RESPONSE" | grep "HTTP_CODE" | cut -d: -f2)
LOGIN_BODY=$(echo "$LOGIN_RESPONSE" | sed 's/HTTP_CODE:.*//')

if [ "$LOGIN_HTTP_CODE" = "200" ]; then
  # Extract Token if present
  TOKEN=$(echo "$LOGIN_BODY" | grep -o '"token":"[^"]*' | cut -d'"' -f4)
  if [ -n "$TOKEN" ]; then
    echo "   Found Token (Initial): $TOKEN"
  fi
else
  echo "   Login failed (HTTP $LOGIN_HTTP_CODE)."
  exit 1
fi

# 3. Create Vendor
echo "3. Creating Vendor Profile..."
CREATE_RESPONSE=""
if [ -n "$TOKEN" ]; then
    CREATE_RESPONSE=$(curl -s -w "\nHTTP_CODE:%{http_code}" \
      -H "Authorization: Bearer $TOKEN" \
      -H "Content-Type: application/json" \
      -X POST "$API_URL/vendors" \
      -d "{
        \"name\": \"$VENDOR_NAME\",
        \"handle\": \"$VENDOR_HANDLE\",
        \"admin\": {
          \"email\": \"$EMAIL\",
          \"first_name\": \"Test\",
          \"last_name\": \"Vendor\"
        }
      }")
else
    # Use Cookie
    CREATE_RESPONSE=$(curl -s -w "\nHTTP_CODE:%{http_code}" -b "$COOKIE_FILE" \
      -H "Content-Type: application/json" \
      -X POST "$API_URL/vendors" \
      -d "{
        \"name\": \"$VENDOR_NAME\",
        \"handle\": \"$VENDOR_HANDLE\",
        \"admin\": {
          \"email\": \"$EMAIL\",
          \"first_name\": \"Test\",
          \"last_name\": \"Vendor\"
        }
      }")
fi

HTTP_CODE=$(echo "$CREATE_RESPONSE" | grep "HTTP_CODE" | cut -d: -f2)
BODY=$(echo "$CREATE_RESPONSE" | sed 's/HTTP_CODE:.*//')

if [ "$HTTP_CODE" = "200" ]; then
  echo "   Vendor created successfully."
else
  echo "   Error creating vendor (HTTP $HTTP_CODE): $BODY"
fi

# 4. Re-Login (To get new token with actor_id)
# IMPORTANT: The old token does NOT have the actor_id because the vendor didn't exist when it was issued.
echo "4. Re-Logging in (To refresh token)..."
LOGIN_RESPONSE=$(curl -s -w "\nHTTP_CODE:%{http_code}" -c "$COOKIE_FILE" -X POST "$API_URL/auth/vendor/emailpass" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"$EMAIL\",
    \"password\": \"$PASSWORD\"
  }")

LOGIN_HTTP_CODE=$(echo "$LOGIN_RESPONSE" | grep "HTTP_CODE" | cut -d: -f2)
LOGIN_BODY=$(echo "$LOGIN_RESPONSE" | sed 's/HTTP_CODE:.*//')
if [ "$LOGIN_HTTP_CODE" = "200" ]; then
  # Extract NEW Token
  TOKEN=$(echo "$LOGIN_BODY" | grep -o '"token":"[^"]*' | cut -d'"' -f4)
  if [ -n "$TOKEN" ]; then
    echo "   Found Token (Refreshed): $TOKEN"
  fi
else
    echo "   Re-Login failed (HTTP $LOGIN_HTTP_CODE)."
    exit 1
fi


# 5. DEBUG: Check Session via /vendors/me
echo "5. Checking Session via /vendors/me..."
if [ -n "$TOKEN" ]; then
    SESSION_RESPONSE=$(curl -s -w "\nHTTP_CODE:%{http_code}" \
      -H "Authorization: Bearer $TOKEN" \
      -X GET "$API_URL/vendors/me")
else
    SESSION_RESPONSE=$(curl -s -w "\nHTTP_CODE:%{http_code}" -b "$COOKIE_FILE" -X GET "$API_URL/vendors/me")
fi

SESSION_HTTP_CODE=$(echo "$SESSION_RESPONSE" | grep "HTTP_CODE" | cut -d: -f2)
SESSION_BODY=$(echo "$SESSION_RESPONSE" | sed 's/HTTP_CODE:.*//')

echo "   Session HTTP Code: $SESSION_HTTP_CODE"
echo "   Session Body: $SESSION_BODY"
echo ""

if [ "$SESSION_HTTP_CODE" = "200" ]; then
   echo "SUCCESS: /vendors/me is working!"
   echo "Make sure to login with the credentials below:"
   echo "Email: $EMAIL"
   echo "Password: $PASSWORD"
else
   echo "FAILURE: /vendors/me returned $SESSION_HTTP_CODE"
fi

rm -f "$COOKIE_FILE"
