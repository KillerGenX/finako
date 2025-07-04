-- SAMPLE DATA READY TO RUN - WITH ACTUAL USER IDs
-- All user IDs and emails have been updated with your actual data

-- User IDs Reference:
-- Alpha Owner (tuan.a@alpha.com): a9a93a2a-8779-4723-8ab8-5d72699e5c79
-- Alpha Staff (staff.a@alpha.com): fd805424-f104-411c-9346-5b8e271e7d0f
-- Beta Owner (tuan.b@beta.com): 41e15dff-920f-4007-821c-83c4cae97bbc
-- Gamma Owner (tuan.c@gamma.com): 145243d0-d89f-4d24-a7d9-5f2bff9468f3

-- ⚠️ IMPORTANT: Run manual-setup-users-orgs.sql FIRST to get organization IDs
-- Then replace the ORGANIZATION IDs below with actual values from that script

-- Organization ID Placeholders (replace with actual values):
-- Alpha Corp: '7adc3b86-d86c-4785-a5c7-6382216bb729'
-- Beta Ltd: 'ac8aae2e-0b23-41d0-b595-fe1174efbf39' 
-- Gamma Inc: 'ed59f6a4-bb75-419f-8deb-e771ac37e3ad'

-- 1. Setup Business Profiles
INSERT INTO business_profiles (organization_id, fixed_costs, avg_variable_cost, avg_selling_price, tax_enabled, service_charge_enabled) VALUES
('7adc3b86-d86c-4785-a5c7-6382216bb729', 2000000, 5000, 15000, false, false),
('ac8aae2e-0b23-41d0-b595-fe1174efbf39', 1500000, 4000, 12000, true, false),
('ed59f6a4-bb75-419f-8deb-e771ac37e3ad', 1000000, 3000, 10000, false, false)
ON CONFLICT (organization_id) DO NOTHING;

-- 2. Setup Sample Products for Alpha Corp
INSERT INTO products (organization_id, user_id, name, selling_price, purchase_price, description, created_at) VALUES
('7adc3b86-d86c-4785-a5c7-6382216bb729', 'a9a93a2a-8779-4723-8ab8-5d72699e5c79', 'Kopi Americano', 12000, 6000, 'Kopi hitam tanpa gula', NOW()),
('7adc3b86-d86c-4785-a5c7-6382216bb729', 'a9a93a2a-8779-4723-8ab8-5d72699e5c79', 'Teh Manis', 8000, 4000, 'Teh manis hangat', NOW()),
('7adc3b86-d86c-4785-a5c7-6382216bb729', 'a9a93a2a-8779-4723-8ab8-5d72699e5c79', 'Roti Bakar', 15000, 8000, 'Roti bakar dengan selai', NOW());

-- 3. Setup Sample Products for Beta Ltd  
INSERT INTO products (organization_id, user_id, name, selling_price, purchase_price, description, created_at) VALUES
('ac8aae2e-0b23-41d0-b595-fe1174efbf39', '41e15dff-920f-4007-821c-83c4cae97bbc', 'Nasi Gudeg', 18000, 10000, 'Nasi gudeg jogja asli', NOW()),
('ac8aae2e-0b23-41d0-b595-fe1174efbf39', '41e15dff-920f-4007-821c-83c4cae97bbc', 'Ayam Bakar', 25000, 15000, 'Ayam bakar bumbu kecap', NOW()),
('ac8aae2e-0b23-41d0-b595-fe1174efbf39', '41e15dff-920f-4007-821c-83c4cae97bbc', 'Sayur Lodeh', 10000, 5000, 'Sayur lodeh santan', NOW());

-- 4. Setup Sample Customers for Alpha Corp
INSERT INTO customers (organization_id, name, phone_number, created_at) VALUES
('7adc3b86-d86c-4785-a5c7-6382216bb729', 'Customer Alpha 1', '081234567890', NOW()),
('7adc3b86-d86c-4785-a5c7-6382216bb729', 'Customer Alpha 2', '081234567891', NOW()),
('7adc3b86-d86c-4785-a5c7-6382216bb729', 'Customer Alpha 3', '081234567892', NOW());

-- 5. Setup Sample Customers for Beta Ltd
INSERT INTO customers (organization_id, name, phone_number, created_at) VALUES
('ac8aae2e-0b23-41d0-b595-fe1174efbf39', 'Customer Beta 1', '089876543210', NOW()),
('ac8aae2e-0b23-41d0-b595-fe1174efbf39', 'Customer Beta 2', '089876543211', NOW()),
('ac8aae2e-0b23-41d0-b595-fe1174efbf39', 'Customer Beta 3', '089876543212', NOW());

-- 6. Setup Expense Categories for Alpha Corp
INSERT INTO expense_categories (organization_id, user_id, name, created_at) VALUES
('7adc3b86-d86c-4785-a5c7-6382216bb729', 'a9a93a2a-8779-4723-8ab8-5d72699e5c79', 'Operasional', NOW()),
('7adc3b86-d86c-4785-a5c7-6382216bb729', 'a9a93a2a-8779-4723-8ab8-5d72699e5c79', 'Marketing', NOW()),
('7adc3b86-d86c-4785-a5c7-6382216bb729', 'a9a93a2a-8779-4723-8ab8-5d72699e5c79', 'Utilities', NOW());

-- 7. Setup Expense Categories for Beta Ltd
INSERT INTO expense_categories (organization_id, user_id, name, created_at) VALUES  
('ac8aae2e-0b23-41d0-b595-fe1174efbf39', '41e15dff-920f-4007-821c-83c4cae97bbc', 'Bahan Baku', NOW()),
('ac8aae2e-0b23-41d0-b595-fe1174efbf39', '41e15dff-920f-4007-821c-83c4cae97bbc', 'Transport', NOW()),
('ac8aae2e-0b23-41d0-b595-fe1174efbf39', '41e15dff-920f-4007-821c-83c4cae97bbc', 'Maintenance', NOW());

-- 8. Get IDs for next steps (run this after the above inserts)
SELECT 'COPY THESE IDs FOR EXPENSES AND SALES:' as info;

SELECT 'Alpha Products:' as section;
SELECT id, name FROM products WHERE organization_id = '7adc3b86-d86c-4785-a5c7-6382216bb729' ORDER BY name;

SELECT 'Beta Products:' as section;
SELECT id, name FROM products WHERE organization_id = 'ac8aae2e-0b23-41d0-b595-fe1174efbf39' ORDER BY name;

SELECT 'Alpha Customers:' as section;
SELECT id, name FROM customers WHERE organization_id = '7adc3b86-d86c-4785-a5c7-6382216bb729' ORDER BY id;

SELECT 'Beta Customers:' as section;
SELECT id, name FROM customers WHERE organization_id = 'ac8aae2e-0b23-41d0-b595-fe1174efbf39' ORDER BY id;

SELECT 'Alpha Expense Categories:' as section;
SELECT id, name FROM expense_categories WHERE organization_id = '7adc3b86-d86c-4785-a5c7-6382216bb729' ORDER BY name;

SELECT 'Beta Expense Categories:' as section;
SELECT id, name FROM expense_categories WHERE organization_id = 'ac8aae2e-0b23-41d0-b595-fe1174efbf39' ORDER BY name;

-- ===== PART 2: EXPENSES, SALES, TRANSACTIONS =====
-- Replace the IDs below with actual values from the queries above

-- 9. Setup Sample Expenses for Alpha Corp
-- Replace expense_category_id with actual IDs from query above
INSERT INTO expenses (organization_id, user_id, description, amount, expense_category_id, created_at) VALUES
('7adc3b86-d86c-4785-a5c7-6382216bb729', 'a9a93a2a-8779-4723-8ab8-5d72699e5c79', 'Bayar listrik bulan Juli', 450000, 'ALPHA_UTILITIES_CAT_ID', NOW()),
('7adc3b86-d86c-4785-a5c7-6382216bb729', 'a9a93a2a-8779-4723-8ab8-5d72699e5c79', 'Beli bahan promosi', 200000, 'ALPHA_MARKETING_CAT_ID', NOW()),
('7adc3b86-d86c-4785-a5c7-6382216bb729', 'a9a93a2a-8779-4723-8ab8-5d72699e5c79', 'Biaya cleaning service', 300000, 'ALPHA_OPERASIONAL_CAT_ID', NOW());

-- 10. Setup Sample Expenses for Beta Ltd
INSERT INTO expenses (organization_id, user_id, description, amount, expense_category_id, created_at) VALUES
('ac8aae2e-0b23-41d0-b595-fe1174efbf39', '41e15dff-920f-4007-821c-83c4cae97bbc', 'Beli beras premium', 500000, 'BETA_BAHAN_BAKU_CAT_ID', NOW()),
('ac8aae2e-0b23-41d0-b595-fe1174efbf39', '41e15dff-920f-4007-821c-83c4cae97bbc', 'Bensin motor delivery', 150000, 'BETA_TRANSPORT_CAT_ID', NOW()),
('ac8aae2e-0b23-41d0-b595-fe1174efbf39', '41e15dff-920f-4007-821c-83c4cae97bbc', 'Service kompor gas', 100000, 'BETA_MAINTENANCE_CAT_ID', NOW());

-- 11. Setup Sample Sales for Alpha Corp
-- Replace customer_id and product_id with actual values
INSERT INTO sales (organization_id, user_id, customer_id, total, items, created_at) VALUES
('7adc3b86-d86c-4785-a5c7-6382216bb729', 'a9a93a2a-8779-4723-8ab8-5d72699e5c79', 'ALPHA_CUSTOMER_1_ID', 35000,
 '[{"product_id":"ALPHA_KOPI_PRODUCT_ID","name":"Kopi Americano","quantity":2,"price":12000},{"product_id":"ALPHA_ROTI_PRODUCT_ID","name":"Roti Bakar","quantity":1,"price":15000}]'::jsonb,
 NOW()),
('7adc3b86-d86c-4785-a5c7-6382216bb729', 'a9a93a2a-8779-4723-8ab8-5d72699e5c79', 'ALPHA_CUSTOMER_2_ID', 24000,
 '[{"product_id":"ALPHA_KOPI_PRODUCT_ID","name":"Kopi Americano","quantity":1,"price":12000},{"product_id":"ALPHA_TEH_PRODUCT_ID","name":"Teh Manis","quantity":2,"price":8000}]'::jsonb,
 NOW());

-- 12. Setup Sample Sales for Beta Ltd
INSERT INTO sales (organization_id, user_id, customer_id, total, items, created_at) VALUES
('ac8aae2e-0b23-41d0-b595-fe1174efbf39', '41e15dff-920f-4007-821c-83c4cae97bbc', 'BETA_CUSTOMER_1_ID', 58300,
 '[{"product_id":"BETA_GUDEG_PRODUCT_ID","name":"Nasi Gudeg","quantity":2,"price":18000},{"product_id":"BETA_SAYUR_PRODUCT_ID","name":"Sayur Lodeh","quantity":1,"price":10000}]'::jsonb,
 NOW()),
('ac8aae2e-0b23-41d0-b595-fe1174efbf39', '41e15dff-920f-4007-821c-83c4cae97bbc', 'BETA_CUSTOMER_2_ID', 47300,
 '[{"product_id":"BETA_GUDEG_PRODUCT_ID","name":"Nasi Gudeg","quantity":1,"price":18000},{"product_id":"BETA_AYAM_PRODUCT_ID","name":"Ayam Bakar","quantity":1,"price":25000}]'::jsonb,
 NOW());

-- 13. Create Transactions for Alpha Corp
INSERT INTO transactions (organization_id, user_id, type, category, amount, description, created_at) VALUES
('7adc3b86-d86c-4785-a5c7-6382216bb729', 'a9a93a2a-8779-4723-8ab8-5d72699e5c79', 'income', 'Penjualan', 35000, 'Penjualan ke Customer Alpha 1', NOW()),
('7adc3b86-d86c-4785-a5c7-6382216bb729', 'a9a93a2a-8779-4723-8ab8-5d72699e5c79', 'income', 'Penjualan', 24000, 'Penjualan ke Customer Alpha 2', NOW()),
('7adc3b86-d86c-4785-a5c7-6382216bb729', 'a9a93a2a-8779-4723-8ab8-5d72699e5c79', 'expense', 'Utilities', 450000, 'Bayar listrik bulan Juli', NOW()),
('7adc3b86-d86c-4785-a5c7-6382216bb729', 'a9a93a2a-8779-4723-8ab8-5d72699e5c79', 'expense', 'Marketing', 200000, 'Beli bahan promosi', NOW());

-- 14. Create Transactions for Beta Ltd
INSERT INTO transactions (organization_id, user_id, type, category, amount, description, created_at) VALUES
('ac8aae2e-0b23-41d0-b595-fe1174efbf39', '41e15dff-920f-4007-821c-83c4cae97bbc', 'income', 'Penjualan', 58300, 'Penjualan ke Customer Beta 1', NOW()),
('ac8aae2e-0b23-41d0-b595-fe1174efbf39', '41e15dff-920f-4007-821c-83c4cae97bbc', 'income', 'Penjualan', 47300, 'Penjualan ke Customer Beta 2', NOW()),
('ac8aae2e-0b23-41d0-b595-fe1174efbf39', '41e15dff-920f-4007-821c-83c4cae97bbc', 'expense', 'Bahan Baku', 500000, 'Beli beras premium', NOW()),
('ac8aae2e-0b23-41d0-b595-fe1174efbf39', '41e15dff-920f-4007-821c-83c4cae97bbc', 'expense', 'Transport', 150000, 'Bensin motor delivery', NOW());

-- 15. Final verification
SELECT 'SETUP COMPLETED! Verifying data:' as status;

SELECT 'Alpha Corp Summary:' as section;
SELECT 
    'Products' as type, COUNT(*) as count FROM products WHERE organization_id = '7adc3b86-d86c-4785-a5c7-6382216bb729'
UNION ALL SELECT 
    'Customers' as type, COUNT(*) as count FROM customers WHERE organization_id = '7adc3b86-d86c-4785-a5c7-6382216bb729'
UNION ALL SELECT 
    'Sales' as type, COUNT(*) as count FROM sales WHERE organization_id = '7adc3b86-d86c-4785-a5c7-6382216bb729'
UNION ALL SELECT 
    'Expenses' as type, COUNT(*) as count FROM expenses WHERE organization_id = '7adc3b86-d86c-4785-a5c7-6382216bb729';

SELECT 'Beta Ltd Summary:' as section;
SELECT 
    'Products' as type, COUNT(*) as count FROM products WHERE organization_id = 'ac8aae2e-0b23-41d0-b595-fe1174efbf39'
UNION ALL SELECT 
    'Customers' as type, COUNT(*) as count FROM customers WHERE organization_id = 'ac8aae2e-0b23-41d0-b595-fe1174efbf39'
UNION ALL SELECT 
    'Sales' as type, COUNT(*) as count FROM sales WHERE organization_id = 'ac8aae2e-0b23-41d0-b595-fe1174efbf39'
UNION ALL SELECT 
    'Expenses' as type, COUNT(*) as count FROM expenses WHERE organization_id = 'ac8aae2e-0b23-41d0-b595-fe1174efbf39';

SELECT 'Multi-tenant sample data ready for testing!' as final_status;
