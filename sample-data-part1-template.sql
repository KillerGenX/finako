-- TEMPLATE SAMPLE DATA - FILL IN ACTUAL IDs
-- Copy this template and replace placeholder UUIDs with actual IDs

-- ===== REPLACE THESE PLACEHOLDER VALUES =====
-- Alpha Corp Organization ID: 'ALPHA_ORG_ID_HERE'
-- Beta Ltd Organization ID: 'BETA_ORG_ID_HERE'  
-- Gamma Inc Organization ID: 'GAMMA_ORG_ID_HERE'
-- Alpha Owner User ID: 'ALPHA_OWNER_USER_ID_HERE'
-- Alpha Staff User ID: 'ALPHA_STAFF_USER_ID_HERE'
-- Beta Owner User ID: 'BETA_OWNER_USER_ID_HERE'
-- Gamma Owner User ID: 'GAMMA_OWNER_USER_ID_HERE'

-- 1. Setup Business Profiles
INSERT INTO business_profiles (organization_id, fixed_costs, avg_variable_cost, avg_selling_price, tax_enabled, service_charge_enabled) VALUES
('ALPHA_ORG_ID_HERE', 2000000, 5000, 15000, false, false),
('BETA_ORG_ID_HERE', 1500000, 4000, 12000, true, false),
('GAMMA_ORG_ID_HERE', 1000000, 3000, 10000, false, false)
ON CONFLICT (organization_id) DO NOTHING;

-- 2. Setup Sample Products for Alpha Corp
INSERT INTO products (organization_id, user_id, name, selling_price, purchase_price, description, created_at) VALUES
('ALPHA_ORG_ID_HERE', 'ALPHA_OWNER_USER_ID_HERE', 'Kopi Americano', 12000, 6000, 'Kopi hitam tanpa gula', NOW()),
('ALPHA_ORG_ID_HERE', 'ALPHA_OWNER_USER_ID_HERE', 'Teh Manis', 8000, 4000, 'Teh manis hangat', NOW()),
('ALPHA_ORG_ID_HERE', 'ALPHA_OWNER_USER_ID_HERE', 'Roti Bakar', 15000, 8000, 'Roti bakar dengan selai', NOW());

-- 3. Setup Sample Products for Beta Ltd  
INSERT INTO products (organization_id, user_id, name, selling_price, purchase_price, description, created_at) VALUES
('BETA_ORG_ID_HERE', 'BETA_OWNER_USER_ID_HERE', 'Nasi Gudeg', 18000, 10000, 'Nasi gudeg jogja asli', NOW()),
('BETA_ORG_ID_HERE', 'BETA_OWNER_USER_ID_HERE', 'Ayam Bakar', 25000, 15000, 'Ayam bakar bumbu kecap', NOW()),
('BETA_ORG_ID_HERE', 'BETA_OWNER_USER_ID_HERE', 'Sayur Lodeh', 10000, 5000, 'Sayur lodeh santan', NOW());

-- 4. Setup Sample Customers for Alpha Corp
INSERT INTO customers (organization_id, name, phone_number, created_at) VALUES
('ALPHA_ORG_ID_HERE', 'Customer Alpha 1', '081234567890', NOW()),
('ALPHA_ORG_ID_HERE', 'Customer Alpha 2', '081234567891', NOW()),
('ALPHA_ORG_ID_HERE', 'Customer Alpha 3', '081234567892', NOW());

-- 5. Setup Sample Customers for Beta Ltd
INSERT INTO customers (organization_id, name, phone_number, created_at) VALUES
('BETA_ORG_ID_HERE', 'Customer Beta 1', '089876543210', NOW()),
('BETA_ORG_ID_HERE', 'Customer Beta 2', '089876543211', NOW()),
('BETA_ORG_ID_HERE', 'Customer Beta 3', '089876543212', NOW());

-- 6. Setup Expense Categories for Alpha Corp
INSERT INTO expense_categories (organization_id, user_id, name, created_at) VALUES
('ALPHA_ORG_ID_HERE', 'ALPHA_OWNER_USER_ID_HERE', 'Operasional', NOW()),
('ALPHA_ORG_ID_HERE', 'ALPHA_OWNER_USER_ID_HERE', 'Marketing', NOW()),
('ALPHA_ORG_ID_HERE', 'ALPHA_OWNER_USER_ID_HERE', 'Utilities', NOW());

-- 7. Setup Expense Categories for Beta Ltd
INSERT INTO expense_categories (organization_id, user_id, name, created_at) VALUES  
('BETA_ORG_ID_HERE', 'BETA_OWNER_USER_ID_HERE', 'Bahan Baku', NOW()),
('BETA_ORG_ID_HERE', 'BETA_OWNER_USER_ID_HERE', 'Transport', NOW()),
('BETA_ORG_ID_HERE', 'BETA_OWNER_USER_ID_HERE', 'Maintenance', NOW());

-- 8. Get product and category IDs for next steps
SELECT 'Product IDs for sales references:' as info;
SELECT id, name, organization_id FROM products ORDER BY organization_id, name;

SELECT 'Expense Category IDs for expenses:' as info;  
SELECT id, name, organization_id FROM expense_categories ORDER BY organization_id, name;

SELECT 'Customer IDs for sales references:' as info;
SELECT id, name, organization_id FROM customers ORDER BY organization_id, id;

-- Copy the IDs from above queries and use them in the next script (part 2)
SELECT 'Now run the second script with actual IDs from the queries above' as next_step;
