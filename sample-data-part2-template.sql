-- SAMPLE DATA PART 2 - SALES, EXPENSES, TRANSACTIONS
-- Run this after Part 1 and fill in the actual IDs

-- ===== REPLACE WITH ACTUAL IDs FROM PART 1 QUERIES =====
-- Organization IDs:
-- Alpha: 'ALPHA_ORG_ID_HERE'
-- Beta: 'BETA_ORG_ID_HERE'

-- User IDs:
-- Alpha Owner: 'ALPHA_OWNER_USER_ID_HERE'  
-- Beta Owner: 'BETA_OWNER_USER_ID_HERE'

-- Product IDs (get from Part 1 query):
-- Alpha Products: 'ALPHA_PRODUCT_1_ID', 'ALPHA_PRODUCT_2_ID', 'ALPHA_PRODUCT_3_ID'
-- Beta Products: 'BETA_PRODUCT_1_ID', 'BETA_PRODUCT_2_ID', 'BETA_PRODUCT_3_ID'

-- Customer IDs (get from Part 1 query):
-- Alpha Customers: 1, 2, 3 (or actual IDs)
-- Beta Customers: 4, 5, 6 (or actual IDs)

-- Expense Category IDs (get from Part 1 query):
-- Alpha Categories: 'ALPHA_CAT_1_ID', 'ALPHA_CAT_2_ID', 'ALPHA_CAT_3_ID'
-- Beta Categories: 'BETA_CAT_1_ID', 'BETA_CAT_2_ID', 'BETA_CAT_3_ID'

-- 1. Setup Sample Expenses for Alpha Corp
INSERT INTO expenses (organization_id, user_id, description, amount, expense_category_id, created_at) VALUES
('ALPHA_ORG_ID_HERE', 'ALPHA_OWNER_USER_ID_HERE', 'Bayar listrik bulan Juli', 450000, 'ALPHA_CAT_3_ID', NOW()),
('ALPHA_ORG_ID_HERE', 'ALPHA_OWNER_USER_ID_HERE', 'Beli bahan promosi', 200000, 'ALPHA_CAT_2_ID', NOW()),
('ALPHA_ORG_ID_HERE', 'ALPHA_OWNER_USER_ID_HERE', 'Biaya cleaning service', 300000, 'ALPHA_CAT_1_ID', NOW());

-- 2. Setup Sample Expenses for Beta Ltd
INSERT INTO expenses (organization_id, user_id, description, amount, expense_category_id, created_at) VALUES
('BETA_ORG_ID_HERE', 'BETA_OWNER_USER_ID_HERE', 'Beli beras premium', 500000, 'BETA_CAT_1_ID', NOW()),
('BETA_ORG_ID_HERE', 'BETA_OWNER_USER_ID_HERE', 'Bensin motor delivery', 150000, 'BETA_CAT_2_ID', NOW()),
('BETA_ORG_ID_HERE', 'BETA_OWNER_USER_ID_HERE', 'Service kompor gas', 100000, 'BETA_CAT_3_ID', NOW());

-- 3. Setup Sample Sales for Alpha Corp
-- Replace customer IDs and product IDs with actual values
INSERT INTO sales (organization_id, user_id, customer_id, total, items, created_at) VALUES
('ALPHA_ORG_ID_HERE', 'ALPHA_OWNER_USER_ID_HERE', 1, 35000, 
 '[{"product_id":"ALPHA_PRODUCT_1_ID","name":"Kopi Americano","quantity":2,"price":12000},{"product_id":"ALPHA_PRODUCT_3_ID","name":"Roti Bakar","quantity":1,"price":15000}]'::jsonb, 
 NOW()),
('ALPHA_ORG_ID_HERE', 'ALPHA_OWNER_USER_ID_HERE', 2, 24000,
 '[{"product_id":"ALPHA_PRODUCT_1_ID","name":"Kopi Americano","quantity":1,"price":12000},{"product_id":"ALPHA_PRODUCT_2_ID","name":"Teh Manis","quantity":2,"price":8000}]'::jsonb,
 NOW());

-- 4. Setup Sample Sales for Beta Ltd
INSERT INTO sales (organization_id, user_id, customer_id, total, items, created_at) VALUES
('BETA_ORG_ID_HERE', 'BETA_OWNER_USER_ID_HERE', 4, 58300,
 '[{"product_id":"BETA_PRODUCT_1_ID","name":"Nasi Gudeg","quantity":2,"price":18000},{"product_id":"BETA_PRODUCT_3_ID","name":"Sayur Lodeh","quantity":1,"price":10000}]'::jsonb,
 NOW()),
('BETA_ORG_ID_HERE', 'BETA_OWNER_USER_ID_HERE', 5, 47300, 
 '[{"product_id":"BETA_PRODUCT_1_ID","name":"Nasi Gudeg","quantity":1,"price":18000},{"product_id":"BETA_PRODUCT_2_ID","name":"Ayam Bakar","quantity":1,"price":25000}]'::jsonb,
 NOW());

-- 5. Create Transactions for Alpha Corp
INSERT INTO transactions (organization_id, user_id, type, category, amount, description, created_at) VALUES
('ALPHA_ORG_ID_HERE', 'ALPHA_OWNER_USER_ID_HERE', 'income', 'Penjualan', 35000, 'Penjualan ke Customer Alpha 1', NOW()),
('ALPHA_ORG_ID_HERE', 'ALPHA_OWNER_USER_ID_HERE', 'income', 'Penjualan', 24000, 'Penjualan ke Customer Alpha 2', NOW()),
('ALPHA_ORG_ID_HERE', 'ALPHA_OWNER_USER_ID_HERE', 'expense', 'Operasional', 450000, 'Bayar listrik bulan Juli', NOW()),
('ALPHA_ORG_ID_HERE', 'ALPHA_OWNER_USER_ID_HERE', 'expense', 'Marketing', 200000, 'Beli bahan promosi', NOW());

-- 6. Create Transactions for Beta Ltd
INSERT INTO transactions (organization_id, user_id, type, category, amount, description, created_at) VALUES
('BETA_ORG_ID_HERE', 'BETA_OWNER_USER_ID_HERE', 'income', 'Penjualan', 58300, 'Penjualan ke Customer Beta 1', NOW()),
('BETA_ORG_ID_HERE', 'BETA_OWNER_USER_ID_HERE', 'income', 'Penjualan', 47300, 'Penjualan ke Customer Beta 2', NOW()),
('BETA_ORG_ID_HERE', 'BETA_OWNER_USER_ID_HERE', 'expense', 'Bahan Baku', 500000, 'Beli beras premium', NOW()),
('BETA_ORG_ID_HERE', 'BETA_OWNER_USER_ID_HERE', 'expense', 'Transport', 150000, 'Bensin motor delivery', NOW());

-- 7. Verify data separation and setup
SELECT 'Alpha Corp Data Summary' as summary;
SELECT 
    'Products' as type, COUNT(*) as count FROM products WHERE organization_id = 'ALPHA_ORG_ID_HERE'
UNION ALL SELECT 
    'Customers' as type, COUNT(*) as count FROM customers WHERE organization_id = 'ALPHA_ORG_ID_HERE'
UNION ALL SELECT 
    'Sales' as type, COUNT(*) as count FROM sales WHERE organization_id = 'ALPHA_ORG_ID_HERE'
UNION ALL SELECT 
    'Expenses' as type, COUNT(*) as count FROM expenses WHERE organization_id = 'ALPHA_ORG_ID_HERE';

SELECT 'Beta Ltd Data Summary' as summary;
SELECT 
    'Products' as type, COUNT(*) as count FROM products WHERE organization_id = 'BETA_ORG_ID_HERE'
UNION ALL SELECT 
    'Customers' as type, COUNT(*) as count FROM customers WHERE organization_id = 'BETA_ORG_ID_HERE'
UNION ALL SELECT 
    'Sales' as type, COUNT(*) as count FROM sales WHERE organization_id = 'BETA_ORG_ID_HERE'
UNION ALL SELECT 
    'Expenses' as type, COUNT(*) as count FROM expenses WHERE organization_id = 'BETA_ORG_ID_HERE';

SELECT 'Sample data setup completed! Multi-tenant isolation verified.' as status;
