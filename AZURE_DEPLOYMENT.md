# Finako Azure VM Deployment Guide

## Prerequisites
- Ubuntu 20.04+ Azure VM
- Domain name (optional)
- SSH access to VM

## Deployment Steps

### 1. Server Setup
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2
npm install -g pm2

# Install Nginx
sudo apt install nginx -y

# Create log directory
sudo mkdir -p /var/log/finako
sudo chown azureuser:azureuser /var/log/finako
```

### 2. Application Deployment
```bash
# Clone repository
git clone https://github.com/your-username/finako-app.git
cd finako-app

# Setup backend
cd finako-backend
npm install
cp .env.example .env
# Edit .env file with production settings

# Setup frontend
cd ../finako-app
npm install

# Update environment for production
echo "VITE_API_BASE_URL=http://your-domain.com" > .env
# or for IP: VITE_API_BASE_URL=http://YOUR_VM_IP

# Build frontend
npm run build
```

### 3. Start Services
```bash
# Start backend with PM2
cd finako-backend
pm2 start ecosystem.config.js

# Configure Nginx
sudo cp ../finako-app/nginx.conf /etc/nginx/sites-available/finako
sudo ln -s /etc/nginx/sites-available/finako /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default

# Test nginx config
sudo nginx -t

# Start services
sudo systemctl restart nginx
sudo systemctl enable nginx
pm2 startup
pm2 save
```

### 4. Configure Firewall
```bash
# Allow HTTP, HTTPS, SSH
sudo ufw allow 22
sudo ufw allow 80
sudo ufw allow 443
sudo ufw enable
```

### 5. SSL Setup (Optional)
```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx -y

# Get SSL certificate
sudo certbot --nginx -d your-domain.com
```

## Environment Variables

### Backend (.env in finako-backend/)
```
NODE_ENV=production
PORT=3000
DATABASE_URL=./finako.db
```

### Frontend (built with production API URL)
```
VITE_API_BASE_URL=http://your-domain.com
```

## Monitoring & Maintenance

```bash
# Check backend status
pm2 status
pm2 logs finako-backend

# Check nginx status
sudo systemctl status nginx
sudo tail -f /var/log/nginx/access.log

# Restart services
pm2 restart finako-backend
sudo systemctl restart nginx
```

## Application Status
✅ Backend API ready (Node.js/Express)
✅ Frontend ready (Vue 3 + Vite)
✅ Database ready (SQLite)
✅ Core business features migrated (85%)
⚠️  Auth still uses Supabase (can deploy as-is)

## Core Features Ready for Production:
- ✅ Product Management
- ✅ Expense Management  
- ✅ Transaction Processing
- ✅ Customer Management
- ✅ Sales Reporting
- ✅ Dashboard Analytics
- ✅ Category Management

## Access Application
- Frontend: http://your-domain.com
- API: http://your-domain.com/api/products (test endpoint)
