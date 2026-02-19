#!/bin/bash

# Configuration
EMAIL="admin@test.com"
PASSWORD="supersecret"

# Parse arguments
while [[ "$#" -gt 0 ]]; do
    case $1 in
        -e|--email) EMAIL="$2"; shift ;;
        -p|--password) PASSWORD="$2"; shift ;;
        *) echo "Unknown parameter passed: $1"; exit 1 ;;
    esac
    shift
done

echo "Creating Admin User..."
echo "Email: $EMAIL"
echo "Password: $PASSWORD"

# Run Medusa CLI command to create user
npx medusa user -e "$EMAIL" -p "$PASSWORD"
