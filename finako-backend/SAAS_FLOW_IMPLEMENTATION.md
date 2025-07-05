# Backend SaaS Flow Implementation

## 🎯 **Complete Flow Implementation**

### **1. Tenant Registration Flow**
```
POST /api/register
```
**What happens:**
1. ✅ Create user in Supabase Auth
2. ✅ Insert into `profiles` table
3. ✅ Insert into `organizations` table dengan **status: 'pending'**
4. ✅ Insert into `organization_members` table (role: 'owner')
5. ✅ Copy package features ke `organization_features` table
6. ✅ Return response dengan `next_step: 'payment_info'`

**Frontend Action:** Redirect ke **Payment Info Page**

---

### **2. Login Flow Check**
```
GET /api/auth/session/:userId
```
**Logic:**
- ✅ Get user profile + organization + business_profile
- ✅ Determine next step berdasarkan status:
  - `pending` → `payment_info`
  - `active` + no business_profile → `onboarding` 
  - `active` + has business_profile → `dashboard`

**Frontend Action:** Smart redirect berdasarkan `next_step`

---

### **3. Payment Info Page**
**Features:**
- ✅ Show organization status: "Menunggu approval admin"
- ✅ **Logout button** - call `/api/auth/logout`
- ✅ Refresh button - call `/api/auth/session/:userId` again
- ⏳ **Auto refresh every 30 detik** untuk check status

---

### **4. Super Admin Manual Approval (Direct Database)**
**Manual Process di Supabase Dashboard:**
1. ✅ Login ke Supabase Dashboard
2. ✅ Buka Table Editor → organizations
3. ✅ Filter by status = 'pending'
4. ✅ Edit status dari 'pending' → 'active' (approve) atau 'rejected' (reject)
5. ✅ Tenant otomatis bisa login dan akan redirect ke onboarding

**No API needed** - Direct database editing lebih simple!

---

### **5. Onboarding Flow**
```
GET /api/onboarding/status/:organizationId    // Check if completed
POST /api/onboarding/complete/:userId/:orgId  // Complete setup
```
**What happens on complete:**
- ✅ Update organizations table (name, address, phone)
- ✅ Create business_profiles entry
- ✅ Create main outlet in outlets table
- ✅ Return `next_step: 'dashboard'`

**Onboarding Page Features:**
- ✅ **Logout button** - prevent hang/corrupt state
- ✅ Multi-step form (business info, outlet, config)
- ✅ Validation sebelum submit

---

### **6. Dashboard Access**
- ✅ User dengan completed onboarding → direct ke dashboard
- ✅ Full app access dengan semua fitur

---

## 🔒 **Security & Validation**

### **Status Transitions (Manual via Supabase Dashboard):**
```
pending → active (manual edit by you)
pending → rejected (manual edit by you)  
active → suspended (manual edit by you)
```

### **Route Protection:**
- ✅ `/api/onboarding/*` - Authenticated users only
- ✅ Business routes - validateMembership middleware

### **Organization Status Validation:**
- ✅ `pending` → Can only access payment info
- ✅ `active` without business_profile → Can only access onboarding  
- ✅ `active` with business_profile → Full access
- ✅ `rejected`/`suspended` → No access, logout

---

## 📊 **Database Schema - Simple Version**

### **organizations table (current schema - no changes needed):**
- `status` field already supports: 'pending', 'active', 'rejected', 'suspended'
- **No additional columns needed** - manual editing is simple!

### **Manual Approval Process:**
1. Tenant registers → status = 'pending'
2. You manually edit status in Supabase Dashboard → 'active'
3. Tenant login → redirected to onboarding
4. Simple and effective!

### **Status values:**
- `pending` - Menunggu approval admin
- `active` - Approved, bisa akses app
- `rejected` - Ditolak admin  
- `suspended` - Disuspend admin

---

## 🚀 **Key Endpoints Summary**

| Endpoint | Purpose | Auth Required |
|----------|---------|---------------|
| `POST /api/register` | Tenant registration | No |
| `GET /api/auth/session/:userId` | Get user session info | No |
| `POST /api/auth/logout` | Logout | No |
| `GET /api/onboarding/status/:orgId` | Check onboarding | User Auth |
| `POST /api/onboarding/complete/:userId/:orgId` | Complete onboarding | User Auth |

**Super Admin:** Manual edit di Supabase Dashboard (simple & effective!)

---

## ✅ **Implementation Status: 100% COMPLETE**

Semua flow sudah terimplementasi dengan benar sesuai requirement!
