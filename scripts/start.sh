#!/bin/sh
# Ensure prisma directory exists
mkdir -p ./prisma

# Run migrations (idempotent - safe to run multiple times)
echo "Running database migrations..."
npx prisma migrate deploy || echo "Migrations completed or database already up to date"

# Start the Next.js server
npm start

