-- FINAL SAMPLE DATA SETUP - READY TO RUN
-- Copy and paste this entire file to Supabase SQL Editor

-- Sample Data Setup for Multi-Tenant Testing
-- All user IDs are already filled in with actual values

-- 1. Setup Organizations with actual owner IDs
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
INSERT INTO products (id, organization_id, user_id, name, selling_price, purchase_price, description, created_at) VALUES
('550e8400-e29b-41d4-a716-446655440011', '550e8400-e29b-41d4-a716-446655440001', 'a9a93a2a-8779-4723-8ab8-5d72699e5c79', 'Kopi Americano', 12000, 6000, 'Kopi hitam tanpa gula', NOW()),
('550e8400-e29b-41d4-a716-446655440012', '550e8400-e29b-41d4-a716-446655440001', 'a9a93a2a-8779-4723-8ab8-5d72699e5c79', 'Teh Manis', 8000, 4000, 'Teh manis hangat', NOW()),
('550e8400-e29b-41d4-a716-446655440013', '550e8400-e29b-41d4-a716-446655440001', 'a9a93a2a-8779-4723-8ab8-5d72699e5c79', 'Roti Bakar', 15000, 8000, 'Roti bakar dengan selai', NOW())
ON CONFLICT (id) DO NOTHING;

-- 4. Setup Sample Products for Beta Ltd  
INSERT INTO products (id, organization_id, user_id, name, selling_price, purchase_price, description, created_at) VALUES
('550e8400-e29b-41d4-a716-446655440021', '550e8400-e29b-41d4-a716-446655440002', '41e15dff-920f-4007-821c-83c4cae97bbc', 'Nasi Gudeg', 18000, 10000, 'Nasi gudeg jogja asli', NOW()),
('550e8400-e29b-41d4-a716-446655440022', '550e8400-e29b-41d4-a716-446655440002', '41e15dff-920f-4007-821c-83c4cae97bbc', 'Ayam Bakar', 25000, 15000, 'Ayam bakar bumbu kecap', NOW()),
('550e8400-e29b-41d4-a716-446655440023', '550e8400-e29b-41d4-a716-446655440002', '41e15dff-920f-4007-821c-83c4cae97bbc', 'Sayur Lodeh', 10000, 5000, 'Sayur lodeh santan', NOW())
ON CONFLICT (id) DO NOTHING;

-- 5. Setup Sample Customers for Alpha Corp
INSERT INTO customers (organization_id, name, phone_number, created_at) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'Customer Alpha 1', '081234567890', NOW()),
('550e8400-e29b-41d4-a716-446655440001', 'Customer Alpha 2', '081234567891', NOW()),
('550e8400-e29b-41d4-a716-446655440001', 'Customer Alpha 3', '081234567892', NOW());

-- 6. Setup Sample Customers for Beta Ltd
INSERT INTO customers (organization_id, name, phone_number, created_at) VALUES
('550e8400-e29b-41d4-a716-446655440002', 'Customer Beta 1', '089876543210', NOW()),
('550e8400-e29b-41d4-a716-446655440002', 'Customer Beta 2', '089876543211', NOW()),
('550e8400-e29b-41d4-a716-446655440002', 'Customer Beta 3', '089876543212', NOW());

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
INSERT INTO expenses (organization_id, user_id, description, amount, expense_category_id, expense_date, notes, created_at) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'a9a93a2a-8779-4723-8ab8-5d72699e5c79', 'Bayar listrik bulan Juli', 450000, 'cat-alpha-3', '2025-07-01', 'Pembayaran via transfer', NOW()),
('550e8400-e29b-41d4-a716-446655440001', 'a9a93a2a-8779-4723-8ab8-5d72699e5c79', 'Beli bahan promosi', 200000, 'cat-alpha-2', '2025-07-02', 'Flyer dan banner', NOW()),
('550e8400-e29b-41d4-a716-446655440001', 'a9a93a2a-8779-4723-8ab8-5d72699e5c79', 'Biaya cleaning service', 300000, 'cat-alpha-1', '2025-07-03', 'Cleaning mingguan', NOW());

-- 10. Setup Sample Expenses for Beta Ltd
INSERT INTO expenses (organization_id, user_id, description, amount, expense_category_id, expense_date, notes, created_at) VALUES
('550e8400-e29b-41d4-a716-446655440002', '41e15dff-920f-4007-821c-83c4cae97bbc', 'Beli beras premium', 500000, 'cat-beta-1', '2025-07-01', 'Beras untuk nasi gudeg', NOW()),
('550e8400-e29b-41d4-a716-446655440002', '41e15dff-920f-4007-821c-83c4cae97bbc', 'Bensin motor delivery', 150000, 'cat-beta-2', '2025-07-02', 'Isi bensin motor', NOW()),
('550e8400-e29b-41d4-a716-446655440002', '41e15dff-920f-4007-821c-83c4cae97bbc', 'Service kompor gas', 100000, 'cat-beta-3', '2025-07-03', 'Maintenance kompor', NOW());

-- 11. Setup Sample Sales for Alpha Corp
-- Note: Using customer_id = 1, 2, 3 assuming these are the first customers inserted
INSERT INTO sales (organization_id, customer_id, subtotal, tax, service_charge, total_amount, payment_method, items, sale_date, created_at) VALUES
('550e8400-e29b-41d4-a716-446655440001', 1, 35000, 0, 0, 35000, 'cash', 
 '[{"product_id":"550e8400-e29b-41d4-a716-446655440011","name":"Kopi Americano","quantity":2,"price":12000},{"product_id":"550e8400-e29b-41d4-a716-446655440013","name":"Roti Bakar","quantity":1,"price":15000}]'::jsonb, 
 '2025-07-04', NOW()),
('550e8400-e29b-41d4-a716-446655440001', 2, 24000, 0, 0, 24000, 'card',
 '[{"product_id":"550e8400-e29b-41d4-a716-446655440011","name":"Kopi Americano","quantity":1,"price":12000},{"product_id":"550e8400-e29b-41d4-a716-446655440012","name":"Teh Manis","quantity":2,"price":8000}]'::jsonb,
 '2025-07-04', NOW());

-- 12. Setup Sample Sales for Beta Ltd
-- Note: Using customer_id = 4, 5, 6 assuming these are the Beta customers inserted after Alpha
INSERT INTO sales (organization_id, customer_id, subtotal, tax, service_charge, total_amount, payment_method, items, sale_date, created_at) VALUES
('550e8400-e29b-41d4-a716-446655440002', 4, 53000, 5300, 0, 58300, 'cash',
 '[{"product_id":"550e8400-e29b-41d4-a716-446655440021","name":"Nasi Gudeg","quantity":2,"price":18000},{"product_id":"550e8400-e29b-41d4-a716-446655440023","name":"Sayur Lodeh","quantity":1,"price":10000}]'::jsonb,
 '2025-07-04', NOW()),
('550e8400-e29b-41d4-a716-446655440002', 5, 43000, 4300, 0, 47300, 'transfer', 
 '[{"product_id":"550e8400-e29b-41d4-a716-446655440021","name":"Nasi Gudeg","quantity":1,"price":18000},{"product_id":"550e8400-e29b-41d4-a716-446655440022","name":"Ayam Bakar","quantity":1,"price":25000}]'::jsonb,
 '2025-07-04', NOW());

-- 13. Create Transactions for Alpha Corp
INSERT INTO transactions (organization_id, type, category, amount, description, reference_id, transaction_date, created_at) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'income', 'Penjualan', 35000, 'Penjualan ke Customer Alpha 1', 'sales', '2025-07-04', NOW()),
('550e8400-e29b-41d4-a716-446655440001', 'income', 'Penjualan', 24000, 'Penjualan ke Customer Alpha 2', 'sales', '2025-07-04', NOW()),
('550e8400-e29b-41d4-a716-446655440001', 'expense', 'Operasional', 450000, 'Bayar listrik bulan Juli', 'expenses', '2025-07-01', NOW()),
('550e8400-e29b-41d4-a716-446655440001', 'expense', 'Marketing', 200000, 'Beli bahan promosi', 'expenses', '2025-07-02', NOW());

-- 14. Create Transactions for Beta Ltd
INSERT INTO transactions (organization_id, type, category, amount, description, reference_id, transaction_date, created_at) VALUES
('550e8400-e29b-41d4-a716-446655440002', 'income', 'Penjualan', 58300, 'Penjualan ke Customer Beta 1', 'sales', '2025-07-04', NOW()),
('550e8400-e29b-41d4-a716-446655440002', 'income', 'Penjualan', 47300, 'Penjualan ke Customer Beta 2', 'sales', '2025-07-04', NOW()),
('550e8400-e29b-41d4-a716-446655440002', 'expense', 'Bahan Baku', 500000, 'Beli beras premium', 'expenses', '2025-07-01', NOW()),
('550e8400-e29b-41d4-a716-446655440002', 'expense', 'Transport', 150000, 'Bensin motor delivery', 'expenses', '2025-07-02', NOW());

-- 15. Add users to organization_members
INSERT INTO organization_members (user_id, organization_id, role) VALUES 
('a9a93a2a-8779-4723-8ab8-5d72699e5c79', '550e8400-e29b-41d4-a716-446655440001', 'owner'),
('fd805424-f104-411c-9346-5b8e271e7d0f', '550e8400-e29b-41d4-a716-446655440001', 'staff'),
('41e15dff-920f-4007-821c-83c4cae97bbc', '550e8400-e29b-41d4-a716-446655440002', 'owner'),
('145243d0-d89f-4d24-a7d9-5f2bff9468f3', '550e8400-e29b-41d4-a716-446655440003', 'owner')
ON CONFLICT (user_id, organization_id) DO NOTHING;

-- 16. Verify data separation
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
SELECT 'Gamma Inc Sales' as label, COUNT(*) as count FROM sales WHERE organization_id = '550e8400-e29b-41d4-a716-446655440003'
UNION ALL
SELECT 'Alpha Corp Stocks' as label, COUNT(*) as count FROM stocks WHERE organization_id = '550e8400-e29b-41d4-a716-446655440001'
UNION ALL
SELECT 'Beta Ltd Stocks' as label, COUNT(*) as count FROM stocks WHERE organization_id = '550e8400-e29b-41d4-a716-446655440002'
UNION ALL
SELECT 'Gamma Inc Stocks' as label, COUNT(*) as count FROM stocks WHERE organization_id = '550e8400-e29b-41d4-a716-446655440003';

-- 17. Verify organizations and memberships
SELECT 'Organizations Created' as label, COUNT(*) as count FROM organizations
UNION ALL
SELECT 'Organization Members' as label, COUNT(*) as count FROM organization_members;

-- 18. Show final setup summary
SELECT 
    o.name as organization_name,
    u.email as owner_email,
    om.role,
    (SELECT COUNT(*) FROM products p WHERE p.organization_id = o.id) as products_count,
    (SELECT COUNT(*) FROM customers c WHERE c.organization_id = o.id) as customers_count,
    (SELECT COUNT(*) FROM sales s WHERE s.organization_id = o.id) as sales_count,
    (SELECT COUNT(*) FROM stocks st WHERE st.organization_id = o.id) as stocks_count
FROM organizations o
JOIN auth.users u ON o.owner_id = u.id
LEFT JOIN organization_members om ON o.id = om.organization_id AND o.owner_id = om.user_id
ORDER BY o.name;

-- Success message
SELECT 'Sample data setup completed! Ready for multi-tenant testing.' as status;

-- 13. Setup Sample Stocks for Alpha Corp
INSERT INTO stocks (organization_id, product_id, quantity, minimum_stock, created_at) VALUES
('550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440011', 100, 20, NOW()),
('550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440012', 80, 15, NOW()),
('550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440013', 50, 10, NOW());

-- 14. Setup Sample Stocks for Beta Ltd
INSERT INTO stocks (organization_id, product_id, quantity, minimum_stock, created_at) VALUES
('550e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440021', 30, 5, NOW()),
('550e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440022', 20, 3, NOW()),
('550e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440023', 40, 8, NOW());
