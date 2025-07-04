# Final Sample Data SQL Execution Guide

## Overview
This guide will help you execute the final multi-tenant sample data SQL that has been synchronized with your actual Supabase table schemas.

## ✅ What Was Fixed

### Schema Alignment Fixes:
1. **Products Table**: 
   - ✅ Fixed `cost_price` → `purchase_price`
   - ✅ Added required `user_id` field
   - ✅ Updated IDs to proper UUID format

2. **Customers Table**: 
   - ✅ Removed auto-generated `id` field from INSERT
   - ✅ Fixed `phone` → `phone_number`
   - ✅ Removed non-existent `email` and `address` fields

3. **Expenses Table**: 
   - ✅ Fixed `category_id` → `expense_category_id`
   - ✅ Added required `user_id` field
   - ✅ Removed auto-generated `id` field from INSERT

4. **Sales Table**: 
   - ✅ Updated customer_id references to use bigint IDs
   - ✅ Updated product_id references in JSON to use UUID format
   - ✅ Removed auto-generated `id` field from INSERT

5. **Transactions Table**: 
   - ✅ Removed auto-generated `id` field from INSERT
   - ✅ Updated reference_id to use generic references

6. **Stocks Table**: 
   - ✅ Added complete stocks data for both organizations

## 🚀 Step-by-Step Execution

### Step 1: Pre-execution Checklist
```sql
-- Verify you have the required auth users in your Supabase
SELECT id, email FROM auth.users 
WHERE id IN (
  'a9a93a2a-8779-4723-8ab8-5d72699e5c79',
  'fd805424-f104-411c-9346-5b8e271e7d0f', 
  '41e15dff-920f-4007-821c-83c4cae97bbc',
  '145243d0-d89f-4d24-a7d9-5f2bff9468f3'
);
```

**📋 Expected Result**: You should see 4 users. If missing, add them through Supabase Auth.

### Step 2: Execute the Main SQL File
1. Open Supabase SQL Editor
2. Copy the entire content from `final-sample-data-setup.sql`
3. Click "Run" to execute all statements

### Step 3: Verify Successful Execution
The SQL file includes built-in verification queries that will show:

```
-- Expected Results:
Alpha Corp Products: 3
Beta Ltd Products: 3  
Alpha Corp Customers: 3
Beta Ltd Customers: 3
Alpha Corp Sales: 2
Beta Ltd Sales: 2
Alpha Corp Stocks: 3
Beta Ltd Stocks: 3
Organizations Created: 3
Organization Members: 4
```

### Step 4: Test Data Isolation
```sql
-- Test 1: Verify product isolation
SELECT organization_id, COUNT(*) FROM products GROUP BY organization_id;

-- Test 2: Verify customer isolation  
SELECT organization_id, COUNT(*) FROM customers GROUP BY organization_id;

-- Test 3: Check sales with customer relationships
SELECT s.organization_id, c.name as customer_name, s.total_amount 
FROM sales s 
JOIN customers c ON s.customer_id = c.id
WHERE s.organization_id = '550e8400-e29b-41d4-a716-446655440001';

-- Test 4: Verify stocks-products relationship
SELECT st.organization_id, p.name as product_name, st.quantity
FROM stocks st
JOIN products p ON st.product_id = p.id
WHERE st.organization_id = '550e8400-e29b-41d4-a716-446655440001';
```

## 🔍 Key Features to Test

### 1. Multi-Tenant Isolation
```sql
-- Ensure no cross-tenant data leakage
SELECT 'Products' as table_name, 
       COUNT(DISTINCT organization_id) as org_count,
       COUNT(*) as total_records
FROM products
UNION ALL
SELECT 'Customers' as table_name,
       COUNT(DISTINCT organization_id) as org_count, 
       COUNT(*) as total_records
FROM customers;
```

### 2. Referential Integrity
```sql
-- Check that all sales reference valid customers within same org
SELECT s.organization_id, COUNT(*) as sales_count
FROM sales s
JOIN customers c ON s.customer_id = c.id AND s.organization_id = c.organization_id
GROUP BY s.organization_id;

-- Check that all stocks reference valid products within same org  
SELECT st.organization_id, COUNT(*) as stocks_count
FROM stocks st
JOIN products p ON st.product_id = p.id AND st.organization_id = p.organization_id
GROUP BY st.organization_id;
```

### 3. User-Organization Relationships
```sql
-- Verify organization membership
SELECT o.name, u.email, om.role
FROM organizations o
JOIN organization_members om ON o.id = om.organization_id
JOIN auth.users u ON om.user_id = u.id
ORDER BY o.name, om.role;
```

## 🐛 Troubleshooting

### Common Issues and Solutions:

1. **UUID Format Error**
   ```
   Error: invalid input syntax for type uuid
   ```
   **Solution**: All UUIDs in the SQL are properly formatted. This shouldn't occur.

2. **Foreign Key Constraint Error**
   ```
   Error: insert or update on table violates foreign key constraint
   ```
   **Solution**: Ensure auth users exist before running the script.

3. **Column Does Not Exist Error**
   ```
   Error: column "xyz" of relation "table" does not exist
   ```
   **Solution**: The SQL has been aligned with your schema. This shouldn't occur.

4. **Customer ID Reference Issue**
   ```
   Error: insert or update on table "sales" violates foreign key constraint
   ```
   **Solution**: The SQL assumes customers are inserted in order (1,2,3 for Alpha, 4,5,6 for Beta). If this fails, check customer insertion order.

## 📊 Expected Data Summary

After successful execution, you should have:

| Organization | Products | Customers | Sales | Stocks | Expenses | Transactions |
|-------------|----------|-----------|-------|--------|----------|--------------|
| Alpha Corp  | 3        | 3         | 2     | 3      | 3        | 4            |
| Beta Ltd    | 3        | 3         | 2     | 3      | 3        | 4            |
| Gamma Inc   | 0        | 0         | 0     | 0      | 0        | 0            |

## 🔄 Next Steps After Success

1. **Backend Testing**: Use the Postman collection to test API endpoints
2. **Authentication Testing**: Test JWT tokens with different users
3. **Role-Based Access**: Verify owner vs staff permissions
4. **Frontend Migration**: Continue with frontend migration to use the backend APIs

## 📝 Sample API Test Scenarios

Once data is loaded, test these scenarios:

1. **Alpha Corp Owner** (a9a93a2a-8779-4723-8ab8-5d72699e5c79):
   - Can access 3 products, 3 customers, 2 sales
   - Cannot see Beta Ltd data

2. **Beta Ltd Owner** (41e15dff-920f-4007-821c-83c4cae97bbc):
   - Can access 3 products, 3 customers, 2 sales  
   - Cannot see Alpha Corp data

3. **Cross-tenant isolation**:
   - GET /api/products with Alpha token → only Alpha products
   - GET /api/products with Beta token → only Beta products

The sample data is now fully ready for comprehensive multi-tenant testing! 🎉
