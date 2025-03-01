# Multi-Domain Deployment Guide

This guide explains how to deploy the application to multiple domains (505meds.com and 303meds.com) using Firebase Hosting.

## Prerequisites

1. Firebase CLI installed: `npm install -g firebase-tools`
2. Firebase project set up with multiple hosting targets
3. Domain names configured in Firebase console

## Quick Deployment Steps

If everything is already set up, here are the exact steps to deploy:

1. Make sure you're logged in to Firebase:
   ```bash
   firebase login
   ```

2. Deploy to 505meds.com:
   ```bash
   npm run deploy:nm
   ```

3. Deploy to 303meds.com:
   ```bash
   npm run deploy:co
   ```

4. Or deploy to both at once:
   ```bash
   npm run deploy:all
   ```

   Alternatively, use the deployment script:
   ```bash
   ./scripts/deploy.sh
   ```

That's it! Your sites will be available at:
- https://505meds.web.app (and 505meds.com if custom domain is set up)
- https://303meds.web.app (and 303meds.com if custom domain is set up)

## Domain Configuration

The application uses a domain context to handle domain-specific content and styling. The configuration is in `src/context/DomainContext.jsx`.

## Deployment Options

### Option 1: Using NPM Scripts

We've added several scripts to package.json for easy deployment:

```bash
# Deploy to 505meds.com only
npm run deploy:nm

# Deploy to 303meds.com only
npm run deploy:co

# Deploy to both domains
npm run deploy:all
```

### Option 2: Using the Deployment Script

We've created a deployment script that handles the entire process:

```bash
# Make sure the script is executable
chmod +x scripts/deploy.sh

# Run the deployment script
./scripts/deploy.sh
```

## Setting Up Custom Domains

1. Go to the Firebase console: https://console.firebase.google.com/
2. Select your project
3. Go to Hosting in the left sidebar
4. Click on "Add custom domain" for each hosting site
5. Follow the instructions to verify domain ownership and set up DNS records

## Domain-Specific Environment Variables

Each domain build uses the `VITE_DOMAIN` environment variable to determine which domain configuration to use:

- `VITE_DOMAIN=505meds` for 505meds.com
- `VITE_DOMAIN=303meds` for 303meds.com

## Testing Domain-Specific Builds Locally

You can test each domain configuration locally using:

```bash
# Test 505meds.com configuration
npm run dev:nm

# Test 303meds.com configuration
npm run dev:co
```

## Troubleshooting

If you encounter issues with the deployment:

1. Check that your Firebase CLI is logged in: `firebase login`
2. Verify that your .firebaserc file has the correct project and target configuration
3. Make sure your firebase.json has the correct hosting targets
4. Check that your custom domains are properly set up in the Firebase console 