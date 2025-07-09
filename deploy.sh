#!/bin/bash

# Deployment script for PayPal and Stripe Cloudflare Functions

echo "🚀 Deploying Payment Functions to Cloudflare Workers..."

# Function to deploy a service
deploy_service() {
    local service_name=$1
    local service_dir=$2
    
    echo "📦 Deploying $service_name..."
    cd $service_dir
    
    # Deploy to development environment
    echo "  → Deploying to development environment..."
    wrangler deploy --env development
    
    # Deploy to production environment
    echo "  → Deploying to production environment..."
    wrangler deploy --env production
    
    cd ..
    echo "✅ $service_name deployment completed"
}

# Check if wrangler is installed
if ! command -v wrangler &> /dev/null; then
    echo "❌ Wrangler CLI not found. Please install it first:"
    echo "npm install -g wrangler"
    exit 1
fi

# Check if user is logged in
if ! wrangler whoami &> /dev/null; then
    echo "❌ Please login to Cloudflare first:"
    echo "wrangler login"
    exit 1
fi

# Deploy PayPal service
deploy_service "PayPal Payment Service" "paypal"

# Deploy Stripe service
deploy_service "Stripe Payment Service" "stripe"

echo "🎉 All payment functions deployed successfully!"
echo ""
echo "📝 Next steps:"
echo "1. Set up environment variables in Cloudflare Dashboard:"
echo "   - For PayPal: PAYPAL_CLIENT_ID, PAYPAL_CLIENT_SECRET"
echo "   - For Stripe: STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET"
echo "2. Configure custom domains if needed"
echo "3. Test the endpoints"