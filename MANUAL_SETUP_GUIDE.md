# Manual Setup Guide - Users & Organizations

## 📋 Step-by-Step Setup Process

### **Step 1: Create Users Manually**
1. **Via Supabase Dashboard:**
   - Go to Supabase Dashboard → Authentication → Users
   - Click "Add User" and create these users:
     ```
     📧 admin@alpha.com (password: your choice)
     📧 staff@alpha.com (password: your choice)  
     📧 admin@beta.com (password: your choice)
     📧 admin@gamma.com (password: your choice)
     ```

2. **OR Via SQL** (if you have direct access):
   ```sql
   -- Create users in auth.users if you have direct access
   INSERT INTO auth.users (email, encrypted_password, email_confirmed_at, created_at, updated_at)
   VALUES 
   ('admin@alpha.com', crypt('password123', gen_salt('bf')), NOW(), NOW(), NOW()),
   ('staff@alpha.com', crypt('password123', gen_salt('bf')), NOW(), NOW(), NOW()),
   ('admin@beta.com', crypt('password123', gen_salt('bf')), NOW(), NOW(), NOW()),
   ('admin@gamma.com', crypt('password123', gen_salt('bf')), NOW(), NOW(), NOW());
   ```

### **Step 2: Get User IDs**
Run this query to get the actual user IDs:
```sql
SELECT email, id as user_id FROM auth.users 
WHERE email IN ('admin@alpha.com', 'staff@alpha.com', 'admin@beta.com', 'admin@gamma.com')
ORDER BY email;
```

**Copy the results:**
```
admin@alpha.com → [COPY_THIS_UUID]
admin@beta.com → [COPY_THIS_UUID] 
admin@gamma.com → [COPY_THIS_UUID]
staff@alpha.com → [COPY_THIS_UUID]
```

### **Step 3: Create Organizations**
1. Open `manual-setup-users-orgs.sql`
2. Replace the placeholder UUIDs with actual user IDs from Step 2
3. Run the script in Supabase SQL Editor

### **Step 4: Get Organization IDs** 
After Step 3, copy the organization IDs:
```sql
SELECT name, id as organization_id FROM organizations 
WHERE name IN ('Alpha Corp', 'Beta Ltd', 'Gamma Inc')
ORDER BY name;
```

### **Step 5: Setup Sample Data**
1. Open `sample-data-part1-template.sql`
2. Replace all placeholder values with actual IDs:
   ```
   ALPHA_ORG_ID_HERE → [Alpha Corp UUID]
   BETA_ORG_ID_HERE → [Beta Ltd UUID] 
   GAMMA_ORG_ID_HERE → [Gamma Inc UUID]
   ALPHA_OWNER_USER_ID_HERE → [admin@alpha.com UUID]
   BETA_OWNER_USER_ID_HERE → [admin@beta.com UUID]
   GAMMA_OWNER_USER_ID_HERE → [admin@gamma.com UUID]
   ALPHA_STAFF_USER_ID_HERE → [staff@alpha.com UUID]
   ```
3. Run the updated script
4. Copy the product/customer/category IDs from the query results

### **Step 6: Complete Setup**
1. Open `sample-data-part2-template.sql`
2. Replace all placeholder values with actual IDs from Step 5
3. Run the final script

## 🎯 Benefits of This Approach

✅ **Real UUIDs**: Uses actual Supabase-generated UUIDs
✅ **No Conflicts**: Avoids UUID format or constraint errors  
✅ **Flexible**: Easy to adapt if you need different users
✅ **Testable**: Each step can be verified before continuing
✅ **Production-Ready**: Same process works for real deployment

## 📁 Files Created

1. `manual-setup-users-orgs.sql` - Create users & organizations
2. `sample-data-part1-template.sql` - Products, customers, categories  
3. `sample-data-part2-template.sql` - Sales, expenses, transactions

## 🔄 Next Steps After Setup

1. Test API endpoints with real JWT tokens
2. Verify multi-tenant isolation 
3. Run Postman collection with actual IDs
4. Continue frontend migration

**Ready to start? Begin with Step 1 and let me know the user IDs once you've created them!** 🚀
