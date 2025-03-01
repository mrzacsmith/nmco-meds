#!/bin/bash

# Exit on error
set -e

echo "🚀 Starting deployment process for multiple domains..."

# Step 1: Build for 505meds
echo "📦 Building for 505meds.com..."
VITE_DOMAIN=505meds npm run build
echo "✅ Build for 505meds.com completed"

# Step 2: Deploy to 505meds hosting target
echo "🔥 Deploying to 505meds.com..."
firebase deploy --only hosting:505meds
echo "✅ Deployment to 505meds.com completed"

# Step 3: Build for 303meds
echo "📦 Building for 303meds.com..."
VITE_DOMAIN=303meds npm run build
echo "✅ Build for 303meds.com completed"

# Step 4: Deploy to 303meds hosting target
echo "🔥 Deploying to 303meds.com..."
firebase deploy --only hosting:303meds
echo "✅ Deployment to 303meds.com completed"

echo "🎉 All deployments completed successfully!" 