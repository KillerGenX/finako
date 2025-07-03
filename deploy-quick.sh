#!/bin/bash

# Finako Quick Deployment Script for Azure VM
# Run this script on your Azure VM after cloning the repository

set -e  # Exit on any error

echo "🚀 Starting Finako Quick Deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if running as correct user
if [ "$USER" != "azureuser" ]; then
    print_warning "This script is designed to run as 'azureuser'. Current user: $USER"
fi

# Update system
print_status "Updating system packages..."
sudo apt update && sudo apt upgrade -y

# Install Node.js 18 if not installed
if ! command -v node &> /dev/null; then
    print_status "Installing Node.js 18..."
    curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
    sudo apt-get install -y nodejs
else
    print_status "Node.js already installed: $(node --version)"
fi

# Install PM2 if not installed
if ! command -v pm2 &> /dev/null; then
    print_status "Installing PM2..."
    sudo npm install -g pm2
else
    print_status "PM2 already installed: $(pm2 --version)"
fi

# Install Nginx if not installed
if ! command -v nginx &> /dev/null; then
    print_status "Installing Nginx..."
    sudo apt install nginx -y
else
    print_status "Nginx already installed"
fi

# Create log directory
print_status "Creating log directory..."
sudo mkdir -p /var/log/finako
sudo chown $USER:$USER /var/log/finako

# Setup backend
print_status "Setting up backend..."
cd finako-backend
npm install

# Copy production environment
if [ ! -f .env ]; then
    cp .env.production .env
    print_warning "Created .env from .env.production. Please edit with your domain!"
fi

# Setup frontend
print_status "Setting up frontend..."
cd ..
npm install

# Check if .env exists and has production URL
if grep -q "github.dev" .env; then
    print_warning "Frontend .env still has development URL. Please update VITE_API_BASE_URL!"
fi

# Build frontend
print_status "Building frontend for production..."
npm run build

# Setup Nginx
print_status "Configuring Nginx..."
sudo cp nginx.conf /etc/nginx/sites-available/finako

# Update nginx config with actual paths
sudo sed -i "s|/home/azureuser/finako-app|$(pwd)|g" /etc/nginx/sites-available/finako

# Enable site
sudo ln -sf /etc/nginx/sites-available/finako /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default

# Test nginx config
if sudo nginx -t; then
    print_status "Nginx configuration is valid"
else
    print_error "Nginx configuration has errors!"
    exit 1
fi

# Start backend with PM2
print_status "Starting backend with PM2..."
cd finako-backend
pm2 start ecosystem.config.js

# Start nginx
print_status "Starting Nginx..."
sudo systemctl restart nginx
sudo systemctl enable nginx

# Setup PM2 to start on boot
print_status "Setting up PM2 startup..."
pm2 startup | grep "sudo env" | sudo bash
pm2 save

# Configure firewall
print_status "Configuring firewall..."
sudo ufw allow 22/tcp comment 'SSH'
sudo ufw allow 80/tcp comment 'HTTP'
sudo ufw allow 443/tcp comment 'HTTPS'
sudo ufw --force enable

print_status "🎉 Deployment completed successfully!"
echo ""
print_status "Next steps:"
echo "1. Update .env files with your actual domain/IP"
echo "2. Update frontend .env: VITE_API_BASE_URL=http://your-domain.com"
echo "3. Rebuild frontend: npm run build"
echo "4. Test your application!"
echo ""
print_status "Useful commands:"
echo "• Check backend: pm2 status"
echo "• View logs: pm2 logs finako-backend"
echo "• Restart backend: pm2 restart finako-backend"
echo "• Check nginx: sudo systemctl status nginx"
echo ""
print_status "Your application should be accessible at: http://$(curl -s ifconfig.me)"
