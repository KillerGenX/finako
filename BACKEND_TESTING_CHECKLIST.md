# 🧪 Backend Multi-Tenant Testing Checklist

## Pre-Testing Setup ✅

### 1. Environment Ready
- [x] Backend running on port 3000
- [x] Supabase database accessible
- [x] Sample data SQL script ready
- [x] Postman collection ready

### 2. Data Setup (Run Once)
- [ ] Execute `setup-sample-data.sql` in Supabase SQL Editor
- [ ] Verify organizations created (org-alpha-123, org-beta-456)
- [ ] Verify sample products, customers, sales, expenses created
- [ ] Check data separation: Alpha Corp ≠ Beta Ltd data

### 3. User Accounts Setup
- [ ] Create Tuan A user: tuan.a@alpha.com (owner role)
- [ ] Create Staff A user: staff.a@alpha.com (staff role)
- [ ] Create Tuan B user: tuan.b@beta.com (owner role)
- [ ] Create Tuan C user: tuan.c@gamma.com (owner role, empty org)
- [ ] Assign users to respective organizations
- [ ] Verify role assignments in organization_members table

### 4. JWT Tokens
- [ ] Get Tuan A JWT token (owner)
- [ ] Get Staff A JWT token (staff)
- [ ] Get Tuan B JWT token (owner)
- [ ] Get Tuan C JWT token (owner, empty org)
- [ ] Update Postman environment variables

---

## Testing Execution 🎯

### Phase 1: Authentication (5 mins)
- [ ] Health check without token → 200 OK
- [ ] Health check with valid token → 200 OK  
- [ ] Health check with invalid token → 401 Unauthorized

### Phase 2: Data Isolation (15 mins)
- [ ] GET /api/products with Tuan A token → Only Alpha products
- [ ] GET /api/products with Tuan B token → Only Beta products
- [ ] Cross-tenant access test → Blocked/Empty
- [ ] Same tests for customers, sales, expenses

### Phase 3: Role-Based Access Control (10 mins)
- [ ] Staff A can read Alpha products → 200 OK
- [ ] Staff A cannot delete products → 403 Forbidden
- [ ] Staff A cannot create products → 403 Forbidden
- [ ] Staff A cannot access dashboard → 403 Forbidden
- [ ] Owner A can perform all operations → 200 OK
- [ ] Staff A sees same data as Owner A (same org)

### Phase 4: Edge Cases & Empty Data (10 mins)
- [ ] Empty org GET /api/products → 200 OK with []
- [ ] Empty org GET /api/customers → 200 OK with []
- [ ] Empty org GET /api/dashboard → 200 OK with zeros
- [ ] Search in empty data → 200 OK with []
- [ ] Pagination with empty data → 200 OK with proper structure

### Phase 5: CRUD Operations (20 mins)
- [ ] Create product as Tuan A → Success, assigned to Alpha org
- [ ] Create product as Tuan B → Success, assigned to Beta org
- [ ] Verify new products don't appear in other tenant
- [ ] Update/Delete operations respect tenant boundaries

### Phase 6: Validation & Security (15 mins)
- [ ] Invalid product data → 400 with validation errors
- [ ] SQL injection attempt → Blocked/Safe response
- [ ] Access non-existent resource → 404 with proper message
- [ ] Large data handling → Proper validation

### Phase 7: Error Handling (10 mins)
- [ ] No auth header → 401 with proper message
- [ ] Invalid token → 401 with proper message
- [ ] Malformed data → 400 with validation errors
- [ ] Non-existent resource → 404 with proper message

### Phase 8: Performance (5 mins)
- [ ] Response time < 500ms for CRUD operations
- [ ] Bulk requests handle correctly
- [ ] Concurrent requests don't interfere

---

## Critical Success Criteria ⚠️

### 🔒 Security (MUST PASS)
- [ ] **Zero cross-tenant data leakage**
- [ ] **JWT validation working on all endpoints**
- [ ] **Organization filtering enforced**
- [ ] **No unauthorized access possible**
- [ ] **Role-based access control working (owner vs staff)**
- [ ] **Same org users see same data, different access levels**

### 🏗️ Functionality (MUST PASS)
- [ ] **All CRUD operations work per tenant**
- [ ] **Data aggregation (dashboard) correct per tenant**
- [ ] **Business logic calculations isolated**
- [ ] **Error responses consistent and safe**
- [ ] **Empty data scenarios handled gracefully**
- [ ] **Staff can read but not write**

### ⚡ Performance (SHOULD PASS)
- [ ] Response time < 500ms for standard operations
- [ ] No memory leaks or crashes
- [ ] Handles concurrent users gracefully
- [ ] Empty data responses fast (<100ms)

---

## Red Flags 🚨

**STOP FRONTEND MIGRATION IF:**
- ❌ Any cross-tenant data visible
- ❌ API returns wrong organization data
- ❌ JWT validation bypassed
- ❌ Error responses reveal sensitive info
- ❌ Dashboard shows mixed tenant data
- ❌ CRUD operations affect wrong tenant
- ❌ Staff can perform owner-only operations
- ❌ Empty data scenarios cause crashes
- ❌ Role restrictions not enforced

**PROCEED TO FRONTEND IF:**
- ✅ All security tests pass 100%
- ✅ All functionality tests pass 100%
- ✅ Role-based access working perfectly
- ✅ Empty data handled gracefully
- ✅ Performance acceptable
- ✅ Error handling consistent

---

## Testing Tools

### Required
- **Postman/Thunder Client**: Import `Finako_Backend_Testing.postman_collection.json`
- **Browser DevTools**: For JWT token extraction
- **Supabase Dashboard**: For data verification

### Quick Commands
```bash
# Start backend
cd finako-backend && npm start

# Check health
curl http://localhost:3000/health

# Test without auth (should fail)
curl http://localhost:3000/api/products

# Test with auth (replace TOKEN)
curl -H "Authorization: Bearer TOKEN" http://localhost:3000/api/products
```

---

## Expected Timeline

- **Setup**: 20 minutes (include role setup)
- **Testing**: 90 minutes (expanded scope)
- **Verification**: 20 minutes
- **Total**: ~130 minutes (2+ hours)

**If testing passes → Proceed to Phase 2 Frontend Migration**
**If testing fails → Fix backend issues first**

---

## Documentation

After successful testing, update:
- [ ] `BACKEND_TESTING_PLAN.md` dengan hasil testing
- [ ] `FRONTEND_MIGRATION_PLAN.md` dengan konfirmasi backend ready
- [ ] Screenshot hasil testing untuk dokumentasi

**Ready to test? 🚀**
