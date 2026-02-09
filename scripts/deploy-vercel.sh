#!/bin/bash
# Quick deployment script for Vercel

set -e

echo "🚀 Momentum - Vercel Deployment Script"
echo ""

# Check if vercel is installed
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI not found. Install it with: npm i -g vercel"
    exit 1
fi

echo "📋 Pre-deployment checklist:"
echo ""
echo "✓ Migrations created (prisma/migrations/)"
echo "✓ package.json updated with build script"
echo "✓ Database setup ready"
echo ""

# Check if project is linked
if [ ! -d ".vercel" ]; then
    echo "🔗 Project not linked to Vercel. Let's link it..."
    vercel link
    echo ""
fi

# Ask deployment type
echo "Which environment do you want to deploy to?"
echo "1) Preview (test deployment)"
echo "2) Production"
read -p "Choose (1 or 2): " choice

echo ""

if [ "$choice" = "2" ]; then
    echo "🚀 Deploying to PRODUCTION..."
    vercel --prod
else
    echo "🚀 Deploying to PREVIEW..."
    vercel
fi

echo ""
echo "✅ Deployment complete!"
echo ""
echo "📝 Next steps:"
echo "1. Visit the URL shown above"
echo "2. Test authentication"
echo "3. Create a test goal"
echo "4. Verify AI features work"
