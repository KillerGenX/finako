-- STEP 2: SALES, EXPENSES, TRANSACTIONS
-- Replace all the placeholder IDs below with actual IDs from Step 1

-- ===== REPLACE THESE WITH ACTUAL IDs FROM STEP 1 =====
-- Alpha Products:
-- ALPHA_KOPI_ID: ac05c95f-30a0-4997-9623-552872868d05
-- ALPHA_TEH_ID: e777f037-5748-4855-ac7b-5389f02391de  
-- ALPHA_ROTI_ID: da337231-ecc6-4546-95ea-7a7e5977d4e1

-- Alpha Customers:
-- ALPHA_CUSTOMER_1_ID: 14
-- ALPHA_CUSTOMER_2_ID: 15
-- ALPHA_CUSTOMER_3_ID: 16

-- Alpha Categories:
-- ALPHA_MARKETING_CAT_ID: e15f7bf7-8c4e-4ee7-a84c-ad53e419978b
-- ALPHA_OPERASIONAL_CAT_ID: 0a6363aa-2c03-4256-995e-7e9c6dc162d6
-- ALPHA_UTILITIES_CAT_ID: 4ea99e71-c0bb-401b-a0b2-0dff11ea305e

-- Beta Products:
-- BETA_AYAM_ID: 391d97c2-18bf-4fed-8331-6c0922a60617
-- BETA_GUDEG_ID: f2a66758-3fd3-4ff6-9767-9d854f2f1b4e
-- BETA_SAYUR_ID: 2dfb36dd-7b5d-4d8f-b936-2289962c4ce8

-- Beta Customers:
-- BETA_CUSTOMER_1_ID: 17
-- BETA_CUSTOMER_2_ID: 18
-- BETA_CUSTOMER_3_ID: 19

-- Beta Categories:
-- BETA_BAHAN_BAKU_CAT_ID: 2c47cde6-71f9-4ce4-8d9e-9c5a26c36780
-- BETA_MAINTENANCE_CAT_ID: 08418f59-5edd-4e2c-b482-b30e6a88970e
-- BETA_TRANSPORT_CAT_ID: eb465f3d-5bbb-4fb6-8718-2b9d28a12ba2

-- 1. Setup Sample Expenses for Alpha Corp
INSERT INTO expenses (organization_id, user_id, description, amount, expense_category_id, created_at) VALUES
('7adc3b86-d86c-4785-a5c7-6382216bb729', 'a9a93a2a-8779-4723-8ab8-5d72699e5c79', 'Bayar listrik bulan Juli', 450000, '4ea99e71-c0bb-401b-a0b2-0dff11ea305e', NOW()),
('7adc3b86-d86c-4785-a5c7-6382216bb729', 'a9a93a2a-8779-4723-8ab8-5d72699e5c79', 'Beli bahan promosi', 200000, 'e15f7bf7-8c4e-4ee7-a84c-ad53e419978b', NOW()),
('7adc3b86-d86c-4785-a5c7-6382216bb729', 'a9a93a2a-8779-4723-8ab8-5d72699e5c79', 'Biaya cleaning service', 300000, '0a6363aa-2c03-4256-995e-7e9c6dc162d6', NOW());

-- 2. Setup Sample Expenses for Beta Ltd
INSERT INTO expenses (organization_id, user_id, description, amount, expense_category_id, created_at) VALUES
('ac8aae2e-0b23-41d0-b595-fe1174efbf39', '41e15dff-920f-4007-821c-83c4cae97bbc', 'Beli beras premium', 500000, '2c47cde6-71f9-4ce4-8d9e-9c5a26c36780', NOW()),
('ac8aae2e-0b23-41d0-b595-fe1174efbf39', '41e15dff-920f-4007-821c-83c4cae97bbc', 'Bensin motor delivery', 150000, 'eb465f3d-5bbb-4fb6-8718-2b9d28a12ba2', NOW()),
('ac8aae2e-0b23-41d0-b595-fe1174efbf39', '41e15dff-920f-4007-821c-83c4cae97bbc', 'Service kompor gas', 100000, '08418f59-5edd-4e2c-b482-b30e6a88970e', NOW());

-- 3. Setup Sample Sales for Alpha Corp
INSERT INTO sales (organization_id, user_id, customer_id, total, items, created_at) VALUES
('7adc3b86-d86c-4785-a5c7-6382216bb729', 'a9a93a2a-8779-4723-8ab8-5d72699e5c79', 14, 35000,
 '[{"product_id":"ac05c95f-30a0-4997-9623-552872868d05","name":"Kopi Americano","quantity":2,"price":12000},{"product_id":"da337231-ecc6-4546-95ea-7a7e5977d4e1","name":"Roti Bakar","quantity":1,"price":15000}]'::jsonb,
 NOW()),
('7adc3b86-d86c-4785-a5c7-6382216bb729', 'a9a93a2a-8779-4723-8ab8-5d72699e5c79', 15, 24000,
 '[{"product_id":"ac05c95f-30a0-4997-9623-552872868d05","name":"Kopi Americano","quantity":1,"price":12000},{"product_id":"e777f037-5748-4855-ac7b-5389f02391de","name":"Teh Manis","quantity":2,"price":8000}]'::jsonb,
 NOW());

-- 4. Setup Sample Sales for Beta Ltd
INSERT INTO sales (organization_id, user_id, customer_id, total, items, created_at) VALUES
('ac8aae2e-0b23-41d0-b595-fe1174efbf39', '41e15dff-920f-4007-821c-83c4cae97bbc', 17, 58300,
 '[{"product_id":"f2a66758-3fd3-4ff6-9767-9d854f2f1b4e","name":"Nasi Gudeg","quantity":2,"price":18000},{"product_id":"2dfb36dd-7b5d-4d8f-b936-2289962c4ce8","name":"Sayur Lodeh","quantity":1,"price":10000}]'::jsonb,
 NOW()),
('ac8aae2e-0b23-41d0-b595-fe1174efbf39', '41e15dff-920f-4007-821c-83c4cae97bbc', 18, 47300,
 '[{"product_id":"f2a66758-3fd3-4ff6-9767-9d854f2f1b4e","name":"Nasi Gudeg","quantity":1,"price":18000},{"product_id":"391d97c2-18bf-4fed-8331-6c0922a60617","name":"Ayam Bakar","quantity":1,"price":25000}]'::jsonb,
 NOW());

-- 5. Create Transactions for Alpha Corp
INSERT INTO transactions (organization_id, user_id, type, category, amount, description, created_at) VALUES
('7adc3b86-d86c-4785-a5c7-6382216bb729', 'a9a93a2a-8779-4723-8ab8-5d72699e5c79', 'income', 'Penjualan', 35000, 'Penjualan ke Customer Alpha 1', NOW()),
('7adc3b86-d86c-4785-a5c7-6382216bb729', 'a9a93a2a-8779-4723-8ab8-5d72699e5c79', 'income', 'Penjualan', 24000, 'Penjualan ke Customer Alpha 2', NOW()),
('7adc3b86-d86c-4785-a5c7-6382216bb729', 'a9a93a2a-8779-4723-8ab8-5d72699e5c79', 'expense', 'Utilities', 450000, 'Bayar listrik bulan Juli', NOW()),
('7adc3b86-d86c-4785-a5c7-6382216bb729', 'a9a93a2a-8779-4723-8ab8-5d72699e5c79', 'expense', 'Marketing', 200000, 'Beli bahan promosi', NOW());

-- 6. Create Transactions for Beta Ltd
INSERT INTO transactions (organization_id, user_id, type, category, amount, description, created_at) VALUES
('ac8aae2e-0b23-41d0-b595-fe1174efbf39', '41e15dff-920f-4007-821c-83c4cae97bbc', 'income', 'Penjualan', 58300, 'Penjualan ke Customer Beta 1', NOW()),
('ac8aae2e-0b23-41d0-b595-fe1174efbf39', '41e15dff-920f-4007-821c-83c4cae97bbc', 'income', 'Penjualan', 47300, 'Penjualan ke Customer Beta 2', NOW()),
('ac8aae2e-0b23-41d0-b595-fe1174efbf39', '41e15dff-920f-4007-821c-83c4cae97bbc', 'expense', 'Bahan Baku', 500000, 'Beli beras premium', NOW()),
('ac8aae2e-0b23-41d0-b595-fe1174efbf39', '41e15dff-920f-4007-821c-83c4cae97bbc', 'expense', 'Transport', 150000, 'Bensin motor delivery', NOW());

-- 7. Final verification
SELECT 'SETUP COMPLETED! Verifying data:' as status;

SELECT 'Alpha Corp Summary:' as section;
SELECT 
    'Products' as type, COUNT(*) as count FROM products WHERE organization_id = '7adc3b86-d86c-4785-a5c7-6382216bb729'
UNION ALL SELECT 
    'Customers' as type, COUNT(*) as count FROM customers WHERE organization_id = '7adc3b86-d86c-4785-a5c7-6382216bb729'
UNION ALL SELECT 
    'Sales' as type, COUNT(*) as count FROM sales WHERE organization_id = '7adc3b86-d86c-4785-a5c7-6382216bb729'
UNION ALL SELECT 
    'Expenses' as type, COUNT(*) as count FROM expenses WHERE organization_id = '7adc3b86-d86c-4785-a5c7-6382216bb729'
UNION ALL SELECT 
    'Transactions' as type, COUNT(*) as count FROM transactions WHERE organization_id = '7adc3b86-d86c-4785-a5c7-6382216bb729';

SELECT 'Beta Ltd Summary:' as section;
SELECT 
    'Products' as type, COUNT(*) as count FROM products WHERE organization_id = 'ac8aae2e-0b23-41d0-b595-fe1174efbf39'
UNION ALL SELECT 
    'Customers' as type, COUNT(*) as count FROM customers WHERE organization_id = 'ac8aae2e-0b23-41d0-b595-fe1174efbf39'
UNION ALL SELECT 
    'Sales' as type, COUNT(*) as count FROM sales WHERE organization_id = 'ac8aae2e-0b23-41d0-b595-fe1174efbf39'
UNION ALL SELECT 
    'Expenses' as type, COUNT(*) as count FROM expenses WHERE organization_id = 'ac8aae2e-0b23-41d0-b595-fe1174efbf39'
UNION ALL SELECT 
    'Transactions' as type, COUNT(*) as count FROM transactions WHERE organization_id = 'ac8aae2e-0b23-41d0-b595-fe1174efbf39';

-- Test multi-tenant isolation
SELECT 'Multi-tenant Isolation Test:' as test_section;
SELECT 
    o.name as organization,
    COUNT(DISTINCT p.id) as products,
    COUNT(DISTINCT c.id) as customers,
    COUNT(DISTINCT s.id) as sales,
    COUNT(DISTINCT e.id) as expenses
FROM organizations o
LEFT JOIN products p ON o.id = p.organization_id
LEFT JOIN customers c ON o.id = c.organization_id  
LEFT JOIN sales s ON o.id = s.organization_id
LEFT JOIN expenses e ON o.id = e.organization_id
WHERE o.name IN ('Alpha Corp', 'Beta Ltd')
GROUP BY o.id, o.name
ORDER BY o.name;

SELECT 'Multi-tenant sample data setup completed successfully!' as final_status;
