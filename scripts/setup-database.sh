#!/bin/bash
# Database setup script for Vercel deployment
# This runs during the build process

set -e

echo "🔄 Generating Prisma Client..."
npx prisma generate

echo "🔄 Running database migrations..."
npx prisma migrate deploy

echo "✅ Database setup complete!"
