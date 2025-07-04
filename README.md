# Finako - SaaS Multi-Tenant POS Platform untuk UMKM

Finako adalah platform Point of Sale (POS) berbasis SaaS yang dirancang khusus untuk memberdayakan Usaha Mikro, Kecil, dan Menengah (UMKM) di Indonesia dengan arsitektur multi-tenant yang modern.

## 🚀 **Version 2.0.0 - SaaS Multi-Tenant Platform**

### ✨ **Key Features**
- **🏢 Multi-Tenant Architecture** - Satu platform, multiple tenants
- **🔐 Self-Service Registration** - Tenant dapat mendaftar sendiri
- **⚡ Smart Onboarding** - Wizard setup bisnis untuk tenant baru
- **👥 Role-Based Access Control** - Owner, staff, admin permissions
- **💳 Payment Status Management** - Admin approval workflow
- **📊 Data Isolation** - Each tenant hanya lihat data mereka sendiri

### 🛠️ **Tech Stack**
- **Frontend:** Vue.js 3 + Vite + Tailwind CSS + DaisyUI
- **Backend:** Node.js + Express.js + Supabase
- **Database:** PostgreSQL dengan Row Level Security (RLS)
- **Authentication:** Supabase Auth dengan multi-tenant support
- **API Architecture:** RESTful dengan tenant isolation

### 🏗️ **Architecture Overview**
```
Frontend (Vue.js) → Backend API (Express) → Supabase (PostgreSQL + Auth)
                                          ↓
                            Multi-tenant Database dengan RLS
```

## 🚀 **Quick Start**

### Prerequisites
- Node.js 18+ 
- Supabase Account
- Git

### 1. Clone Repository
```bash
git clone https://github.com/username/finako-app.git
cd finako-app
```

### 2. Backend Setup
```bash
cd finako-backend
npm install
cp .env.example .env
# Edit .env dengan Supabase credentials
npm start
```

### 3. Frontend Setup  
```bash
# Di root directory
npm install
cp .env.example .env
# Edit .env dengan Supabase dan backend URL
npm run dev
```

### 4. Database Setup
- Run SQL schema dari `fix-rls-policies.sql` di Supabase SQL Editor
- Setup RLS policies untuk multi-tenant isolation

## 🎯 **SaaS Flow Overview**

### For New Tenants:
1. **Register** → Create organization dengan status 'pending'
2. **Payment Info** → Wait untuk admin approval
3. **Admin Approval** → Status changed ke 'active'  
4. **Onboarding** → Setup business profile dan configurations
5. **Dashboard Access** → Full platform access

### For Existing Tenants:
1. **Login** → Smart redirect berdasarkan status
2. **Dashboard** → Direct access (skip onboarding)

## 📁 **Project Structure**
```
finako-app/
├── src/                     # Frontend Vue.js
│   ├── views/
│   │   ├── RegisterView.vue     # Tenant registration
│   │   ├── PaymentInfoView.vue  # Payment status
│   │   ├── OnboardingView.vue   # Business setup
│   │   └── LoginView.vue        # Smart login
│   ├── router/index.js          # Navigation guards
│   └── stores/userStore.js      # Multi-tenant state
├── finako-backend/          # Backend API
│   ├── src/
│   │   ├── controllers/         # API controllers
│   │   ├── routes/              # API routes
│   │   └── index.js             # Express server
│   └── .env.example             # Environment template
└── fix-rls-policies.sql     # Database RLS setup
```

## 🔐 **Security Features**
- **Row Level Security (RLS)** - Database-level tenant isolation
- **Service Key vs Anon Key** - Proper permission separation
- **Navigation Guards** - Route protection berdasarkan tenant status
- **Environment Variables** - Secure credential management

## 📊 **Database Schema**
- `organizations` - Tenant data dengan approval status
- `organization_members` - User-tenant relationships dengan roles
- `organization_features` - Feature flags per tenant
- `business_profiles` - Business settings dan configurations

## 🎯 **Roadmap**
- [x] ✅ Multi-tenant SaaS architecture
- [x] ✅ Tenant registration & onboarding 
- [x] ✅ Payment status management
- [ ] 🔄 Real database migration (from dummy data)
- [ ] 📊 Super admin dashboard
- [ ] 💳 Payment gateway integration
- [ ] 👥 Enhanced user management
- [ ] 📈 Analytics & reporting

## 🤝 **Contributing**
Proyek ini sedang dalam pengembangan aktif. Contributions welcome!

---

## 📝 **Release Notes**
Lihat [RELEASE_NOTES.md](./RELEASE_NOTES.md) untuk detail perubahan terbaru.

---
*🎓 Proyek ini dikembangkan sebagai bagian dari program pembelajaran yang didukung oleh GitHub Student Developer Pack.*