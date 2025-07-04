-- STEP 1: BASIC DATA SETUP (Run this first)
-- This will create all the basic data and show you the IDs for step 2

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

-- ===== COPY THESE IDs FOR STEP 2 =====

SELECT '===== ALPHA CORP IDs =====';

SELECT 'PRODUCTS:' as type;
SELECT 
    CASE 
        WHEN name = 'Kopi Americano' THEN '-- ALPHA_KOPI_ID: ' || id
        WHEN name = 'Teh Manis' THEN '-- ALPHA_TEH_ID: ' || id  
        WHEN name = 'Roti Bakar' THEN '-- ALPHA_ROTI_ID: ' || id
    END as copy_this
FROM products 
WHERE organization_id = '7adc3b86-d86c-4785-a5c7-6382216bb729' 
ORDER BY name;

SELECT 'CUSTOMERS:' as type;
SELECT 
    '-- ALPHA_CUSTOMER_' || ROW_NUMBER() OVER (ORDER BY id) || '_ID: ' || id as copy_this
FROM customers 
WHERE organization_id = '7adc3b86-d86c-4785-a5c7-6382216bb729' 
ORDER BY id;

SELECT 'EXPENSE CATEGORIES:' as type;
SELECT 
    CASE 
        WHEN name = 'Marketing' THEN '-- ALPHA_MARKETING_CAT_ID: ' || id
        WHEN name = 'Operasional' THEN '-- ALPHA_OPERASIONAL_CAT_ID: ' || id
        WHEN name = 'Utilities' THEN '-- ALPHA_UTILITIES_CAT_ID: ' || id
    END as copy_this
FROM expense_categories 
WHERE organization_id = '7adc3b86-d86c-4785-a5c7-6382216bb729' 
ORDER BY name;

SELECT '===== BETA LTD IDs =====';

SELECT 'PRODUCTS:' as type;
SELECT 
    CASE 
        WHEN name = 'Ayam Bakar' THEN '-- BETA_AYAM_ID: ' || id
        WHEN name = 'Nasi Gudeg' THEN '-- BETA_GUDEG_ID: ' || id
        WHEN name = 'Sayur Lodeh' THEN '-- BETA_SAYUR_ID: ' || id
    END as copy_this
FROM products 
WHERE organization_id = 'ac8aae2e-0b23-41d0-b595-fe1174efbf39' 
ORDER BY name;

SELECT 'CUSTOMERS:' as type;
SELECT 
    '-- BETA_CUSTOMER_' || ROW_NUMBER() OVER (ORDER BY id) || '_ID: ' || id as copy_this
FROM customers 
WHERE organization_id = 'ac8aae2e-0b23-41d0-b595-fe1174efbf39' 
ORDER BY id;

SELECT 'EXPENSE CATEGORIES:' as type;
SELECT 
    CASE 
        WHEN name = 'Bahan Baku' THEN '-- BETA_BAHAN_BAKU_CAT_ID: ' || id
        WHEN name = 'Maintenance' THEN '-- BETA_MAINTENANCE_CAT_ID: ' || id
        WHEN name = 'Transport' THEN '-- BETA_TRANSPORT_CAT_ID: ' || id
    END as copy_this
FROM expense_categories 
WHERE organization_id = 'ac8aae2e-0b23-41d0-b595-fe1174efbf39' 
ORDER BY name;

SELECT 'Copy the IDs above and run step-2-sales-expenses.sql with actual IDs' as instruction;
