-- Sample Data Setup for Multi-Tenant Testing
-- Run this in Supabase SQL Editor

-- Note: Using valid UUIDs for organization IDs (Supabase requirement)
-- IMPORTANT: Create users in Supabase Auth FIRST, then get their user_id for owner_id

-- Step 1: Create users in Supabase Auth Dashboard first:
-- 1. tuan.a@alpha.com (will be owner of Alpha Corp)
-- 2. staff.a@alpha.com (will be staff in Alpha Corp) 
-- 3. tuan.b@beta.com (will be owner of Beta Ltd)
-- 4. tuan.c@gamma.com (will be owner of Gamma Inc)

-- Step 2: Get the user IDs from auth.users table and replace the placeholders below
-- SELECT id, email FROM auth.users WHERE email IN ('tuan.a@alpha.com', 'tuan.b@beta.com', 'tuan.c@gamma.com');

-- Step 3: Replace the USER_ID placeholders below with actual UUIDs from auth.users

-- 1. Setup Organizations (with actual user IDs)
INSERT INTO organizations (id, name, email, status, owner_id, created_at) VALUES 
('550e8400-e29b-41d4-a716-446655440001', 'Alpha Corp', 'admin@alpha.com', 'active', 'a9a93a2a-8779-4723-8ab8-5d72699e5c79', NOW()),
('550e8400-e29b-41d4-a716-446655440002', 'Beta Ltd', 'admin@beta.com', 'active', '41e15dff-920f-4007-821c-83c4cae97bbc', NOW()),
('550e8400-e29b-41d4-a716-446655440003', 'Gamma Inc', 'admin@gamma.com', 'active', '145243d0-d89f-4d24-a7d9-5f2bff9468f3', NOW())
ON CONFLICT (id) DO NOTHING;

-- 2. Setup Business Profiles
INSERT INTO business_profiles (organization_id, fixed_costs, avg_variable_cost, avg_selling_price, tax_enabled, service_charge_enabled) VALUES
('550e8400-e29b-41d4-a716-446655440001', 2000000, 5000, 15000, false, false),
('550e8400-e29b-41d4-a716-446655440002', 1500000, 4000, 12000, true, false),
('550e8400-e29b-41d4-a716-446655440003', 1000000, 3000, 10000, false, false)
ON CONFLICT (organization_id) DO NOTHING;

-- 3. Setup Sample Products for Alpha Corp
INSERT INTO products (id, organization_id, name, selling_price, cost_price, stock, description, created_at) VALUES
('prod-alpha-1', '550e8400-e29b-41d4-a716-446655440001', 'Kopi Americano', 12000, 6000, 100, 'Kopi hitam tanpa gula', NOW()),
('prod-alpha-2', '550e8400-e29b-41d4-a716-446655440001', 'Teh Manis', 8000, 4000, 80, 'Teh manis hangat', NOW()),
('prod-alpha-3', '550e8400-e29b-41d4-a716-446655440001', 'Roti Bakar', 15000, 8000, 50, 'Roti bakar dengan selai', NOW())
ON CONFLICT (id) DO NOTHING;

-- 4. Setup Sample Products for Beta Ltd  
INSERT INTO products (id, organization_id, name, selling_price, cost_price, stock, description, created_at) VALUES
('prod-beta-1', '550e8400-e29b-41d4-a716-446655440002', 'Nasi Gudeg', 18000, 10000, 30, 'Nasi gudeg jogja asli', NOW()),
('prod-beta-2', '550e8400-e29b-41d4-a716-446655440002', 'Ayam Bakar', 25000, 15000, 20, 'Ayam bakar bumbu kecap', NOW()),
('prod-beta-3', '550e8400-e29b-41d4-a716-446655440002', 'Sayur Lodeh', 10000, 5000, 40, 'Sayur lodeh santan', NOW())
ON CONFLICT (id) DO NOTHING;

-- 5. Setup Sample Customers for Alpha Corp
INSERT INTO customers (id, organization_id, name, phone, email, address, created_at) VALUES
('cust-alpha-1', '550e8400-e29b-41d4-a716-446655440001', 'Customer Alpha 1', '081234567890', 'customer.a1@alpha.com', 'Jl. Alpha Raya No. 1', NOW()),
('cust-alpha-2', '550e8400-e29b-41d4-a716-446655440001', 'Customer Alpha 2', '081234567891', 'customer.a2@alpha.com', 'Jl. Alpha Raya No. 2', NOW()),
('cust-alpha-3', '550e8400-e29b-41d4-a716-446655440001', 'Customer Alpha 3', '081234567892', 'customer.a3@alpha.com', 'Jl. Alpha Raya No. 3', NOW())
ON CONFLICT (id) DO NOTHING;

-- 6. Setup Sample Customers for Beta Ltd
INSERT INTO customers (id, organization_id, name, phone, email, address, created_at) VALUES
('cust-beta-1', '550e8400-e29b-41d4-a716-446655440002', 'Customer Beta 1', '089876543210', 'customer.b1@beta.com', 'Jl. Beta Indah No. 1', NOW()),
('cust-beta-2', '550e8400-e29b-41d4-a716-446655440002', 'Customer Beta 2', '089876543211', 'customer.b2@beta.com', 'Jl. Beta Indah No. 2', NOW()),
('cust-beta-3', '550e8400-e29b-41d4-a716-446655440002', 'Customer Beta 3', '089876543212', 'customer.b3@beta.com', 'Jl. Beta Indah No. 3', NOW())
ON CONFLICT (id) DO NOTHING;

-- 7. Setup Expense Categories for Alpha Corp
INSERT INTO expense_categories (id, organization_id, name, description, created_at) VALUES
('cat-alpha-1', '550e8400-e29b-41d4-a716-446655440001', 'Operasional', 'Biaya operasional harian', NOW()),
('cat-alpha-2', '550e8400-e29b-41d4-a716-446655440001', 'Marketing', 'Biaya pemasaran dan promosi', NOW()),
('cat-alpha-3', '550e8400-e29b-41d4-a716-446655440001', 'Utilities', 'Biaya listrik, air, internet', NOW())
ON CONFLICT (id) DO NOTHING;

-- 8. Setup Expense Categories for Beta Ltd
INSERT INTO expense_categories (id, organization_id, name, description, created_at) VALUES  
('cat-beta-1', '550e8400-e29b-41d4-a716-446655440002', 'Bahan Baku', 'Biaya pembelian bahan baku', NOW()),
('cat-beta-2', '550e8400-e29b-41d4-a716-446655440002', 'Transport', 'Biaya transportasi dan pengiriman', NOW()),
('cat-beta-3', '550e8400-e29b-41d4-a716-446655440002', 'Maintenance', 'Biaya perawatan peralatan', NOW())
ON CONFLICT (id) DO NOTHING;

-- 9. Setup Sample Expenses for Alpha Corp
INSERT INTO expenses (id, organization_id, description, amount, category_id, expense_date, notes, created_at) VALUES
('exp-alpha-1', '550e8400-e29b-41d4-a716-446655440001', 'Bayar listrik bulan Juli', 450000, 'cat-alpha-3', '2025-07-01', 'Pembayaran via transfer', NOW()),
('exp-alpha-2', '550e8400-e29b-41d4-a716-446655440001', 'Beli bahan promosi', 200000, 'cat-alpha-2', '2025-07-02', 'Flyer dan banner', NOW()),
('exp-alpha-3', '550e8400-e29b-41d4-a716-446655440001', 'Biaya cleaning service', 300000, 'cat-alpha-1', '2025-07-03', 'Cleaning mingguan', NOW())
ON CONFLICT (id) DO NOTHING;

-- 10. Setup Sample Expenses for Beta Ltd
INSERT INTO expenses (id, organization_id, description, amount, category_id, expense_date, notes, created_at) VALUES
('exp-beta-1', '550e8400-e29b-41d4-a716-446655440002', 'Beli beras premium', 500000, 'cat-beta-1', '2025-07-01', 'Beras untuk nasi gudeg', NOW()),
('exp-beta-2', '550e8400-e29b-41d4-a716-446655440002', 'Bensin motor delivery', 150000, 'cat-beta-2', '2025-07-02', 'Isi bensin motor', NOW()),
('exp-beta-3', '550e8400-e29b-41d4-a716-446655440002', 'Service kompor gas', 100000, 'cat-beta-3', '2025-07-03', 'Maintenance kompor', NOW())
ON CONFLICT (id) DO NOTHING;

-- 11. Setup Sample Sales for Alpha Corp
INSERT INTO sales (id, organization_id, customer_id, subtotal, tax, service_charge, total_amount, payment_method, items, sale_date, created_at) VALUES
('sale-alpha-1', '550e8400-e29b-41d4-a716-446655440001', 'cust-alpha-1', 35000, 0, 0, 35000, 'cash', 
 '[{"product_id":"prod-alpha-1","name":"Kopi Americano","quantity":2,"price":12000},{"product_id":"prod-alpha-3","name":"Roti Bakar","quantity":1,"price":15000}]'::jsonb, 
 '2025-07-04', NOW()),
('sale-alpha-2', '550e8400-e29b-41d4-a716-446655440001', 'cust-alpha-2', 24000, 0, 0, 24000, 'card',
 '[{"product_id":"prod-alpha-1","name":"Kopi Americano","quantity":1,"price":12000},{"product_id":"prod-alpha-2","name":"Teh Manis","quantity":2,"price":8000}]'::jsonb,
 '2025-07-04', NOW())
ON CONFLICT (id) DO NOTHING;

-- 12. Setup Sample Sales for Beta Ltd
INSERT INTO sales (id, organization_id, customer_id, subtotal, tax, service_charge, total_amount, payment_method, items, sale_date, created_at) VALUES
('sale-beta-1', '550e8400-e29b-41d4-a716-446655440002', 'cust-beta-1', 53000, 5300, 0, 58300, 'cash',
 '[{"product_id":"prod-beta-1","name":"Nasi Gudeg","quantity":2,"price":18000},{"product_id":"prod-beta-3","name":"Sayur Lodeh","quantity":1,"price":10000}]'::jsonb,
 '2025-07-04', NOW()),
('sale-beta-2', '550e8400-e29b-41d4-a716-446655440002', 'cust-beta-2', 43000, 4300, 0, 47300, 'transfer', 
 '[{"product_id":"prod-beta-1","name":"Nasi Gudeg","quantity":1,"price":18000},{"product_id":"prod-beta-2","name":"Ayam Bakar","quantity":1,"price":25000}]'::jsonb,
 '2025-07-04', NOW())
ON CONFLICT (id) DO NOTHING;

-- 13. Create Transactions for Alpha Corp
INSERT INTO transactions (id, organization_id, type, category, amount, description, reference_id, transaction_date, created_at) VALUES
('trans-alpha-1', '550e8400-e29b-41d4-a716-446655440001', 'income', 'Penjualan', 35000, 'Penjualan ke Customer Alpha 1', 'sale-alpha-1', '2025-07-04', NOW()),
('trans-alpha-2', '550e8400-e29b-41d4-a716-446655440001', 'income', 'Penjualan', 24000, 'Penjualan ke Customer Alpha 2', 'sale-alpha-2', '2025-07-04', NOW()),
('trans-alpha-3', '550e8400-e29b-41d4-a716-446655440001', 'expense', 'Operasional', 450000, 'Bayar listrik bulan Juli', 'exp-alpha-1', '2025-07-01', NOW()),
('trans-alpha-4', '550e8400-e29b-41d4-a716-446655440001', 'expense', 'Marketing', 200000, 'Beli bahan promosi', 'exp-alpha-2', '2025-07-02', NOW())
ON CONFLICT (id) DO NOTHING;

-- 14. Create Transactions for Beta Ltd
INSERT INTO transactions (id, organization_id, type, category, amount, description, reference_id, transaction_date, created_at) VALUES
('trans-beta-1', '550e8400-e29b-41d4-a716-446655440002', 'income', 'Penjualan', 58300, 'Penjualan ke Customer Beta 1', 'sale-beta-1', '2025-07-04', NOW()),
('trans-beta-2', '550e8400-e29b-41d4-a716-446655440002', 'income', 'Penjualan', 47300, 'Penjualan ke Customer Beta 2', 'sale-beta-2', '2025-07-04', NOW()),
('trans-beta-3', '550e8400-e29b-41d4-a716-446655440002', 'expense', 'Bahan Baku', 500000, 'Beli beras premium', 'exp-beta-1', '2025-07-01', NOW()),
('trans-beta-4', '550e8400-e29b-41d4-a716-446655440002', 'expense', 'Transport', 150000, 'Bensin motor delivery', 'exp-beta-2', '2025-07-02', NOW())
ON CONFLICT (id) DO NOTHING;

-- 15. Verify data separation
SELECT 'Alpha Corp Products' as label, COUNT(*) as count FROM products WHERE organization_id = '550e8400-e29b-41d4-a716-446655440001'
UNION ALL
SELECT 'Beta Ltd Products' as label, COUNT(*) as count FROM products WHERE organization_id = '550e8400-e29b-41d4-a716-446655440002'
UNION ALL
SELECT 'Gamma Inc Products' as label, COUNT(*) as count FROM products WHERE organization_id = '550e8400-e29b-41d4-a716-446655440003'
UNION ALL  
SELECT 'Alpha Corp Customers' as label, COUNT(*) as count FROM customers WHERE organization_id = '550e8400-e29b-41d4-a716-446655440001'
UNION ALL
SELECT 'Beta Ltd Customers' as label, COUNT(*) as count FROM customers WHERE organization_id = '550e8400-e29b-41d4-a716-446655440002'
UNION ALL
SELECT 'Gamma Inc Customers' as label, COUNT(*) as count FROM customers WHERE organization_id = '550e8400-e29b-41d4-a716-446655440003'
UNION ALL
SELECT 'Alpha Corp Sales' as label, COUNT(*) as count FROM sales WHERE organization_id = '550e8400-e29b-41d4-a716-446655440001'  
UNION ALL
SELECT 'Beta Ltd Sales' as label, COUNT(*) as count FROM sales WHERE organization_id = '550e8400-e29b-41d4-a716-446655440002'
UNION ALL
SELECT 'Gamma Inc Sales' as label, COUNT(*) as count FROM sales WHERE organization_id = '550e8400-e29b-41d4-a716-446655440003';

-- Note: After running the above data setup, add users to organization_members:
-- User IDs mapping:
-- tuan.a@alpha.com: a9a93a2a-8779-4723-8ab8-5d72699e5c79
-- staff.a@alpha.com: fd805424-f104-411c-9346-5b8e271e7d0f
-- tuan.b@beta.com: 41e15dff-920f-4007-821c-83c4cae97bbc
-- tuan.c@gamma.com: 145243d0-d89f-4d24-a7d9-5f2bff9468f3

INSERT INTO organization_members (user_id, organization_id, role) VALUES 
('a9a93a2a-8779-4723-8ab8-5d72699e5c79', '550e8400-e29b-41d4-a716-446655440001', 'owner'),
('fd805424-f104-411c-9346-5b8e271e7d0f', '550e8400-e29b-41d4-a716-446655440001', 'staff'),
('41e15dff-920f-4007-821c-83c4cae97bbc', '550e8400-e29b-41d4-a716-446655440002', 'owner'),
('145243d0-d89f-4d24-a7d9-5f2bff9468f3', '550e8400-e29b-41d4-a716-446655440003', 'owner');

-- Success message
SELECT 'Sample data setup completed! Ready for multi-tenant testing.' as status;
