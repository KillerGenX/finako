# 🧪 Finako Backend - API Testing Checklist

**Untuk memverifikasi semua endpoint berfungsi dengan benar sebelum migrasi frontend**

---

## 🚀 **Quick Setup untuk Testing**

### **1. Start Backend**
```bash
cd finako-backend
npm run dev
```

### **2. Test Headers**
```bash
# Untuk development testing
x-user-id: your-user-uuid-here
x-organization-id: your-org-uuid-here

# Atau untuk production
Authorization: Bearer your-jwt-token
```

### **3. Base URL**
```
http://localhost:3000/api
```

---

## ✅ **Core SaaS Flow Testing**

### **1. Health Check**
```bash
GET http://localhost:3000/health
Expected: { "status": "OK", "version": "2.0.0" }
```

### **2. Get Packages**
```bash
GET /api/packages
Expected: Array of packages with id, name, price, features
```

### **3. Register New Tenant**
```bash
POST /api/register
Body: {
  "email": "test@company.com",
  "password": "password123", 
  "businessName": "Test Company",
  "packageId": "starter",
  "ownerName": "Test Owner"
}
Expected: {
  "success": true,
  "data": {
    "user_id": "uuid",
    "organization": { "status": "pending" },
    "next_step": "payment_info"
  }
}
```

### **4. Check Session Info**
```bash
GET /api/auth/session/:userId
Expected: User data with organization status and next_step
```

### **5. Complete Onboarding (after approval)**
```bash
POST /api/onboarding/complete/:userId/:organizationId
Body: {
  "business_name": "Updated Company Name",
  "business_address": "Test Address",
  "business_phone": "08123456789",
  "tax_enabled": true,
  "tax_percent": 11,
  "outlet_name": "Main Branch",
  "outlet_address": "Main Address"
}
Expected: {
  "success": true,
  "next_step": "dashboard"
}
```

---

## 📊 **Business Operations Testing**

### **6. Dashboard Data**
```bash
GET /api/dashboard?organization_id=uuid
Headers: x-user-id, x-organization-id
Expected: {
  "sales_last_7_days": [],
  "total_expenses_this_month": 0,
  "total_products": 0,
  "total_customers": 0
}
```

### **7. Product Categories**
```bash
# Create category
POST /api/product-categories
Headers: x-user-id, x-organization-id
Body: {
  "organization_id": "uuid",
  "name": "Test Category"
}

# Get all categories
GET /api/product-categories?organization_id=uuid
Headers: x-user-id, x-organization-id
Expected: Array of categories
```

### **8. Products Management**
```bash
# Create product
POST /api/products
Headers: x-user-id, x-organization-id
Body: {
  "organization_id": "uuid",
  "name": "Test Product",
  "sku": "TEST-001",
  "category_id": "category-uuid",
  "unit": "pcs",
  "purchase_price": 10000,
  "selling_price": 15000,
  "min_stock": 5,
  "is_active": true
}

# Get all products
GET /api/products?organization_id=uuid
Headers: x-user-id, x-organization-id
Expected: Array of products with category info
```

### **9. Customers Management**
```bash
# Create customer
POST /api/customers
Headers: x-user-id, x-organization-id
Body: {
  "organization_id": "uuid",
  "name": "Test Customer",
  "phone_number": "08123456789",
  "points": 0
}

# Get all customers
GET /api/customers?organization_id=uuid
Headers: x-user-id, x-organization-id
Expected: Array of customers
```

### **10. Sales Transaction**
```bash
# Create sale
POST /api/sales
Headers: x-user-id, x-organization-id
Body: {
  "organization_id": "uuid",
  "customer_name": "Test Customer",
  "customer_phone": "08123456789",
  "items": [
    {
      "product_id": "product-uuid",
      "product_name": "Test Product",
      "quantity": 2,
      "price": 15000,
      "subtotal": 30000
    }
  ],
  "total": 33000,
  "tax_amount": 3000,
  "payments": [
    {
      "method": "cash",
      "amount": 33000
    }
  ]
}

# Get all sales
GET /api/sales?organization_id=uuid
Headers: x-user-id, x-organization-id
Expected: Array of sales with payment info
```

### **11. Expense Management**
```bash
# Create expense category
POST /api/expense-categories
Headers: x-user-id, x-organization-id
Body: {
  "organization_id": "uuid",
  "name": "Test Expense Category"
}

# Create expense
POST /api/expenses
Headers: x-user-id, x-organization-id
Body: {
  "organization_id": "uuid",
  "expense_category_id": "category-uuid",
  "amount": 50000,
  "description": "Test Expense"
}

# Get all expenses
GET /api/expenses?organization_id=uuid
Headers: x-user-id, x-organization-id
Expected: Array of expenses with category info
```

### **12. Inventory Management**
```bash
# Create outlet
POST /api/outlets
Headers: x-user-id, x-organization-id
Body: {
  "organization_id": "uuid",
  "name": "Test Outlet",
  "address": "Test Address"
}

# Create/Update stock
POST /api/stocks
Headers: x-user-id, x-organization-id
Body: {
  "organization_id": "uuid",
  "product_id": "product-uuid",
  "outlet_id": "outlet-uuid",
  "stock": 100
}

# Get all stocks
GET /api/stocks?organization_id=uuid
Headers: x-user-id, x-organization-id
Expected: Array of stocks with product and outlet info
```

---

## 🏢 **Organization Management Testing**

### **13. Business Profile**
```bash
# Get business profile
GET /api/business-profile?organization_id=uuid
Headers: x-user-id, x-organization-id
Expected: Business profile data or null

# Update business profile
PUT /api/business-profile
Headers: x-user-id, x-organization-id
Body: {
  "organization_id": "uuid",
  "tax_enabled": true,
  "tax_percent": 11,
  "service_charge_enabled": false,
  "fixed_costs": 5000000
}
```

### **14. Organization Features**
```bash
# Get all features
GET /api/organization-features?organization_id=uuid
Headers: x-user-id, x-organization-id
Expected: Array of features with enabled status

# Get enabled features only
GET /api/organization-features/enabled?organization_id=uuid
Headers: x-user-id, x-organization-id
Expected: Array of enabled features only
```

### **15. User Management**
```bash
# Get organization members
GET /api/users?organization_id=uuid
Headers: x-user-id, x-organization-id
Expected: Array of members with profile info

# Add new member (owner only)
POST /api/users
Headers: x-user-id, x-organization-id
Body: {
  "organization_id": "uuid",
  "email": "newuser@company.com",
  "full_name": "New User",
  "role": "pegawai"
}
```

### **16. Financial Transactions**
```bash
# Get all transactions
GET /api/transactions?organization_id=uuid
Headers: x-user-id, x-organization-id
Expected: Array of all financial transactions
```

---

## 🔒 **Security Testing**

### **17. Authentication Required**
```bash
# Test without headers - should fail
GET /api/products
Expected: 401 Unauthorized or 403 Forbidden
```

### **18. Organization Isolation**
```bash
# Test with wrong organization_id - should return empty or forbidden
GET /api/products?organization_id=wrong-uuid
Headers: x-user-id (with valid user)
Expected: 403 Forbidden or empty results
```

### **19. Input Validation**
```bash
# Test with invalid data
POST /api/products
Headers: x-user-id, x-organization-id
Body: {
  "name": "", // empty name should fail
  "selling_price": "invalid" // invalid price should fail
}
Expected: 400 Bad Request with validation errors
```

---

## 🚨 **Error Handling Testing**

### **20. Not Found Endpoints**
```bash
GET /api/nonexistent
Expected: 404 with proper error message
```

### **21. Invalid IDs**
```bash
GET /api/products/invalid-uuid?organization_id=uuid
Headers: x-user-id, x-organization-id
Expected: 400 or 404 with proper error message
```

### **22. Database Errors**
```bash
# Test with malformed organization_id
GET /api/products?organization_id=not-a-uuid
Headers: x-user-id
Expected: 400 Bad Request
```

---

## 📝 **Testing Checklist**

### **Setup Phase**
- [ ] Backend server running on port 3000
- [ ] Supabase database connected
- [ ] Test user created in Supabase Auth
- [ ] Test organization created and approved

### **Core Flow Testing**
- [ ] Health check passes
- [ ] Package listing works
- [ ] Tenant registration creates all records
- [ ] Session info returns correct next_step
- [ ] Onboarding completion works

### **Business Operations**
- [ ] Product categories CRUD works
- [ ] Products CRUD with category join works
- [ ] Customers CRUD works
- [ ] Sales creation with payments works
- [ ] Expense categories and expenses work
- [ ] Outlets and stocks management works

### **Organization Features**
- [ ] Business profile management works
- [ ] Organization features listing works
- [ ] User management (owner permissions) works
- [ ] Financial transactions listing works

### **Security & Error Handling**
- [ ] Authentication required for protected endpoints
- [ ] Organization isolation working properly
- [ ] Input validation catching invalid data
- [ ] Proper error responses with correct status codes
- [ ] No sensitive data in error messages

---

## 🎯 **Expected Test Results**

**All endpoints should return:**
- ✅ Correct HTTP status codes
- ✅ Consistent JSON response format
- ✅ Proper data filtering by organization
- ✅ Secure error messages
- ✅ Required authentication enforcement

**Performance expectations:**
- Response time < 500ms for simple queries
- Response time < 1000ms for complex joins
- No memory leaks during extended testing

---

## 🔧 **Troubleshooting**

### **Common Issues**
1. **401/403 Errors**: Check x-user-id and x-organization-id headers
2. **Empty Results**: Verify organization membership exists
3. **500 Errors**: Check Supabase connection and RLS policies
4. **Validation Errors**: Review request body format

### **Debug Endpoints**
```bash
# Check membership
GET /api/debug/members/:organizationId/:userId

# Check business profile (bypass RLS)
GET /api/business-profile/:organizationId
```

---

**🚀 Ready untuk testing! Gunakan checklist ini untuk memverifikasi semua fungsi backend sebelum migrasi frontend.**
