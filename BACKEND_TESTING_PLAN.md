# Backend Multi-Tenant Testing Plan
## Testing dengan Persona Tuan A & Tuan B

### Prerequisites
1. Backend running di port 3000
2. Supabase database dengan sample data
3. Postman atau similar API testing tool
4. 2 organization dengan data berbeda

---

## Test Setup: Persona Creation

### Persona Tuan A (Organization Alpha)
- **User**: tuan.a@alpha.com
- **Organization**: "Alpha Corp" (ID: org-alpha-123)
- **Role**: owner
- **Products**: Kopi, Teh, Roti
- **Customers**: Customer A1, A2, A3

### Persona Tuan B (Organization Beta) 
- **User**: tuan.b@beta.com  
- **Organization**: "Beta Ltd" (ID: org-beta-456)
- **Role**: owner
- **Products**: Nasi, Ayam, Sayur
- **Customers**: Customer B1, B2, B3

### Persona Staff A (Organization Alpha - Different Role)
- **User**: staff.a@alpha.com
- **Organization**: "Alpha Corp" (ID: org-alpha-123)
- **Role**: staff
- **Access**: Read-only, cannot create/update/delete
- **Purpose**: Test role-based access control within same organization

### Persona Tuan C (Organization Gamma - Empty Data)
- **User**: tuan.c@gamma.com
- **Organization**: "Gamma Inc" (ID: org-gamma-789)
- **Role**: owner
- **Data**: No products, customers, sales (fresh organization)
- **Purpose**: Test empty data scenarios and edge cases

---

## Phase 1: Authentication & Authorization Testing

### Test 1.1: User Authentication
```http
POST /api/auth/login
{
  "email": "tuan.a@alpha.com",
  "password": "password123"
}
```
**Expected**: JWT token untuk Tuan A

```http
POST /api/auth/login  
{
  "email": "tuan.b@beta.com",
  "password": "password123"
}
```
**Expected**: JWT token untuk Tuan B

### Test 1.2: Token Validation
```http
GET /api/health
Authorization: Bearer [TUAN_A_TOKEN]
```
**Expected**: 200 OK

```http
GET /api/health
Authorization: Bearer [INVALID_TOKEN]
```
**Expected**: 401 Unauthorized

---

## Phase 2: Data Isolation Testing

### Test 2.1: Products Isolation
```http
GET /api/products
Authorization: Bearer [TUAN_A_TOKEN]
```
**Expected**: Only Alpha Corp products (Kopi, Teh, Roti)

```http
GET /api/products
Authorization: Bearer [TUAN_B_TOKEN]
```
**Expected**: Only Beta Ltd products (Nasi, Ayam, Sayur)

### Test 2.2: Cross-Tenant Access Prevention
```http
GET /api/products?organization_id=org-beta-456
Authorization: Bearer [TUAN_A_TOKEN]
```
**Expected**: Empty result atau error (Tuan A tidak boleh akses data Beta)

### Test 2.3: Customers Isolation
```http
GET /api/customers
Authorization: Bearer [TUAN_A_TOKEN]
```
**Expected**: Only Alpha Corp customers

```http
GET /api/customers
Authorization: Bearer [TUAN_B_TOKEN]  
```
**Expected**: Only Beta Ltd customers

---

## Phase 3: CRUD Operations Testing

### Test 3.1: Create Product (Tuan A)
```http
POST /api/products
Authorization: Bearer [TUAN_A_TOKEN]
{
  "name": "Kopi Susu",
  "price": 15000,
  "cost_price": 8000,
  "stock": 50
}
```
**Expected**: Product created dengan organization_id Alpha

### Test 3.2: Verify Isolation After Create
```http
GET /api/products  
Authorization: Bearer [TUAN_B_TOKEN]
```
**Expected**: Kopi Susu TIDAK muncul di hasil Tuan B

### Test 3.3: Update Product Cross-Tenant
```http
PUT /api/products/[ALPHA_PRODUCT_ID]
Authorization: Bearer [TUAN_B_TOKEN]
{
  "name": "Hacked Product"
}
```
**Expected**: 403 Forbidden atau 404 Not Found

---

## Phase 4: Sales & Transaction Testing

### Test 4.1: Create Sale (Tuan A)
```http
POST /api/sales
Authorization: Bearer [TUAN_A_TOKEN]
{
  "customer_id": "[ALPHA_CUSTOMER_ID]",
  "items": [
    {
      "product_id": "[ALPHA_PRODUCT_ID]",
      "quantity": 2,
      "price": 15000
    }
  ],
  "total_amount": 30000
}
```
**Expected**: Sale created untuk Alpha organization

### Test 4.2: Sales Isolation
```http
GET /api/sales
Authorization: Bearer [TUAN_B_TOKEN]
```
**Expected**: Alpha sales TIDAK muncul di hasil Tuan B

---

## Phase 5: Dashboard & Reports Testing

### Test 5.1: Dashboard Data Isolation
```http
GET /api/dashboard
Authorization: Bearer [TUAN_A_TOKEN]
```
**Expected**: Dashboard data hanya dari Alpha organization

```http
GET /api/dashboard
Authorization: Bearer [TUAN_B_TOKEN]
```
**Expected**: Dashboard data hanya dari Beta organization

---

## Phase 6: Error Handling Testing

### Test 6.1: Missing Authorization
```http
GET /api/products
```
**Expected**: 401 Unauthorized dengan proper error message

### Test 6.2: Invalid Organization Access
```http
GET /api/products/[BETA_PRODUCT_ID]
Authorization: Bearer [TUAN_A_TOKEN]
```
**Expected**: 404 Not Found atau 403 Forbidden

### Test 6.3: Malformed Request
```http
POST /api/products
Authorization: Bearer [TUAN_A_TOKEN]
{
  "invalid": "data"
}
```
**Expected**: 400 Bad Request dengan validation errors

---

## Phase 8: Role-Based Access Control Testing

### Test 8.1: Same Organization, Different Roles
```http
GET /api/products
Authorization: Bearer [STAFF_A_TOKEN]
```
**Expected**: 200 OK, staff dapat read products dari Alpha Corp

```http
GET /api/products
Authorization: Bearer [TUAN_A_TOKEN]
```
**Expected**: 200 OK, owner dapat read products dari Alpha Corp
**Verify**: Both should see same Alpha Corp products (same organization)

### Test 8.2: Staff Cannot Delete (Role Restriction)
```http
DELETE /api/products/[ALPHA_PRODUCT_ID]
Authorization: Bearer [STAFF_A_TOKEN]
```
**Expected**: 403 Forbidden - staff role tidak bisa delete products

```http
DELETE /api/products/[ALPHA_PRODUCT_ID]
Authorization: Bearer [TUAN_A_TOKEN]
```
**Expected**: 200 OK - owner role bisa delete products

### Test 8.3: Staff Cannot Create (Role Restriction)
```http
POST /api/products
Authorization: Bearer [STAFF_A_TOKEN]
{
  "name": "Staff Product Test",
  "price": 10000,
  "cost_price": 5000,
  "stock": 10
}
```
**Expected**: 403 Forbidden - staff role tidak bisa create products

### Test 8.4: Staff Cannot Update (Role Restriction)
```http
PUT /api/products/[ALPHA_PRODUCT_ID]
Authorization: Bearer [STAFF_A_TOKEN]
{
  "name": "Updated by Staff"
}
```
**Expected**: 403 Forbidden - staff role tidak bisa update products

### Test 8.5: Role Hierarchy Validation
```http
GET /api/dashboard
Authorization: Bearer [STAFF_A_TOKEN]
```
**Expected**: 403 Forbidden - dashboard biasanya hanya untuk owner/manager

---

## Phase 9: Edge Cases & Empty Data Testing

### Test 9.1: Fresh Organization with No Data
```http
GET /api/products
Authorization: Bearer [TUAN_C_TOKEN]
```
**Expected**: 200 OK dengan empty array `[]`, bukan error

```http
GET /api/customers
Authorization: Bearer [TUAN_C_TOKEN]
```
**Expected**: 200 OK dengan empty array `[]`, bukan error

```http
GET /api/sales
Authorization: Bearer [TUAN_C_TOKEN]
```
**Expected**: 200 OK dengan empty array `[]`, bukan error

### Test 9.2: Dashboard with No Data
```http
GET /api/dashboard
Authorization: Bearer [TUAN_C_TOKEN]
```
**Expected**: 200 OK dengan proper structure:
```json
{
  "totalSales": 0,
  "totalExpenses": 0,
  "profit": 0,
  "salesCount": 0,
  "topProducts": [],
  "recentTransactions": []
}
```

### Test 9.3: Operations on Empty Organization
```http
POST /api/sales
Authorization: Bearer [TUAN_C_TOKEN]
{
  "customer_id": "non-existent-customer",
  "items": [{"product_id": "non-existent-product", "quantity": 1}],
  "total_amount": 10000
}
```
**Expected**: 400 Bad Request - proper validation untuk non-existent references

### Test 9.4: Search in Empty Data
```http
GET /api/products?search=kopi
Authorization: Bearer [TUAN_C_TOKEN]
```
**Expected**: 200 OK dengan empty array `[]`, bukan error

### Test 9.5: Pagination with No Data
```http
GET /api/products?page=1&limit=10
Authorization: Bearer [TUAN_C_TOKEN]
```
**Expected**: 200 OK dengan proper pagination structure:
```json
{
  "data": [],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 0,
    "totalPages": 0
  }
}
```

---

## Phase 10: Boundary Testing & Validation

### Test 10.1: Invalid Product Creation
```http
POST /api/products
Authorization: Bearer [TUAN_A_TOKEN]
{
  "name": "",
  "price": -1000,
  "cost_price": "invalid",
  "stock": -5
}
```
**Expected**: 400 Bad Request dengan detailed validation errors

### Test 10.2: SQL Injection Prevention
```http
GET /api/products?search='; DROP TABLE products; --
Authorization: Bearer [TUAN_A_TOKEN]
```
**Expected**: 200 OK atau 400 Bad Request, tapi TIDAK boleh execute SQL

### Test 10.3: Large Data Handling
```http
POST /api/products
Authorization: Bearer [TUAN_A_TOKEN]
{
  "name": "A".repeat(1000),
  "description": "B".repeat(10000),
  "price": 999999999999
}
```
**Expected**: 400 Bad Request - proper validation untuk data size limits

### Test 10.4: Concurrent Same Operation
- Send 10 concurrent DELETE requests untuk same product
**Expected**: Only first should succeed (200), others should get 404/409

---

## Phase 7: Performance Testing

### Test 7.1: Concurrent Requests
- Send 50 concurrent GET /api/products requests dengan Tuan A token
- Send 50 concurrent GET /api/products requests dengan Tuan B token
**Expected**: All requests succeed, data properly isolated

### Test 7.2: Bulk Operations
```http
POST /api/products/bulk
Authorization: Bearer [TUAN_A_TOKEN]
{
  "products": [... 100 products ...]
}
```
**Expected**: All created under Alpha organization

---

## Success Criteria

### ✅ Security Criteria
- [ ] Zero cross-tenant data leakage
- [ ] Proper JWT validation pada semua endpoints
- [ ] Role-based access working correctly (owner vs staff)
- [ ] Organization membership validation working
- [ ] Same organization users see same data (different roles)
- [ ] Staff cannot perform owner-only operations

### ✅ Functionality Criteria  
- [ ] All CRUD operations working per organization
- [ ] Dashboard data aggregation correct per tenant
- [ ] Sales/transaction flow complete
- [ ] Business logic calculations correct
- [ ] Empty data scenarios handled gracefully
- [ ] Proper validation for invalid inputs

### ✅ Performance Criteria
- [ ] Response time < 500ms untuk CRUD operations
- [ ] Support concurrent users per organization
- [ ] No memory leaks atau crashes
- [ ] Proper error recovery
- [ ] Empty data responses fast (<100ms)

### ✅ Error Handling Criteria
- [ ] Consistent error response format
- [ ] Proper HTTP status codes
- [ ] User-friendly error messages
- [ ] No sensitive data leakage dalam errors
- [ ] Graceful handling of edge cases
- [ ] Proper validation error messages

### ✅ Role-Based Access Criteria
- [ ] Staff can read but not write
- [ ] Owner can perform all operations
- [ ] Role hierarchy respected
- [ ] Same organization data visible to all roles
- [ ] Role restrictions consistently enforced

### ✅ Edge Case Criteria
- [ ] Empty arrays returned for no data (not null/error)
- [ ] Dashboard works with zero data
- [ ] Search works with empty results
- [ ] Pagination works with zero records
- [ ] Invalid references properly validated

---

## Test Execution Checklist

### Preparation
- [ ] Setup 2 organizations dengan sample data
- [ ] Get JWT tokens untuk Tuan A & Tuan B
- [ ] Prepare Postman collection
- [ ] Setup monitoring/logging

### Execution
- [ ] Run all security tests
- [ ] Run all functionality tests  
- [ ] Run all performance tests
- [ ] Run all error handling tests
- [ ] Document all findings

### Validation
- [ ] No data leakage detected
- [ ] All expected behaviors confirmed
- [ ] Performance benchmarks met
- [ ] Error scenarios handled gracefully

---

## Tools Needed

1. **Postman/Thunder Client**: API testing
2. **Database Browser**: Verify data in Supabase
3. **Network Monitor**: Check response times
4. **Logs**: Backend console untuk debugging

Jika semua test ini PASS, maka kita 100% yakin backend siap untuk frontend integration! 🚀

## 🎯 Why This Enhanced Testing Is Critical

### Multi-Layer Security Validation
1. **Organization Isolation**: Tuan A ≠ Tuan B (different organizations)
2. **Role-Based Access**: Owner ≠ Staff (same organization, different permissions)
3. **Empty Data Resilience**: New organizations must work flawlessly

### Real-World Scenarios Covered
- **Enterprise Setup**: Multiple roles within organization
- **New Customer Onboarding**: Empty data scenarios
- **Security Penetration**: Cross-tenant access attempts
- **Input Validation**: Malicious/invalid data handling

### Frontend Integration Confidence
- **No Surprises**: All edge cases tested beforehand
- **Predictable API**: Consistent response formats
- **Error Handling**: Frontend knows what to expect
- **Performance**: No slowdowns from bad queries

### Business Risk Mitigation
- **Data Privacy**: GDPR/SOC2 compliance through isolation
- **User Experience**: Graceful handling of all scenarios
- **Scalability**: Performance validated under various conditions
- **Security**: Multi-layer protection validated

**Bottom Line**: Spending 2+ hours on thorough backend testing saves weeks of frontend debugging and potential security issues in production! 💪
