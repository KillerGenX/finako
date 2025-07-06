-- Script untuk mengisi data packages berdasarkan package.csv
-- Run di Supabase SQL Editor

-- Clear existing data (optional)
-- DELETE FROM package_features;
-- DELETE FROM packages;

-- Insert packages
INSERT INTO packages (id, name, price, user_limit, created_at, updated_at) VALUES
('basic', 'Basic', 49000, 2, NOW(), NOW()),
('pro', 'Pro', 99000, 5, NOW(), NOW()),
('enterprise', 'Enterprise', 249000, 20, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  price = EXCLUDED.price,
  user_limit = EXCLUDED.user_limit,
  updated_at = NOW();

-- Insert package features for Basic
INSERT INTO package_features (package_id, feature_id, is_enabled, max_value, created_at) VALUES
('basic', 'pos', true, NULL, NOW()),
('basic', 'expenses', true, NULL, NOW()),
('basic', 'bep', true, NULL, NOW()),
('basic', 'employee_management', true, NULL, NOW())
ON CONFLICT (package_id, feature_id) DO UPDATE SET
  is_enabled = EXCLUDED.is_enabled,
  max_value = EXCLUDED.max_value;

-- Insert package features for Pro
INSERT INTO package_features (package_id, feature_id, is_enabled, max_value, created_at) VALUES
('pro', 'pos', true, NULL, NOW()),
('pro', 'expenses', true, NULL, NOW()),
('pro', 'bep', true, NULL, NOW()),
('pro', 'reports', true, NULL, NOW()),
('pro', 'stock_management', true, NULL, NOW()),
('pro', 'employee_management', true, NULL, NOW()),
('pro', 'customer_data', true, NULL, NOW())
ON CONFLICT (package_id, feature_id) DO UPDATE SET
  is_enabled = EXCLUDED.is_enabled,
  max_value = EXCLUDED.max_value;

-- Insert package features for Enterprise
INSERT INTO package_features (package_id, feature_id, is_enabled, max_value, created_at) VALUES
('enterprise', 'pos', true, NULL, NOW()),
('enterprise', 'expenses', true, NULL, NOW()),
('enterprise', 'bep', true, NULL, NOW()),
('enterprise', 'reports', true, NULL, NOW()),
('enterprise', 'stock_management', true, NULL, NOW()),
('enterprise', 'employee_management', true, NULL, NOW()),
('enterprise', 'employee_attendance', true, NULL, NOW()),
('enterprise', 'customer_data', true, NULL, NOW())
ON CONFLICT (package_id, feature_id) DO UPDATE SET
  is_enabled = EXCLUDED.is_enabled,
  max_value = EXCLUDED.max_value;

-- Verify data
SELECT * FROM packages ORDER BY price;
SELECT * FROM package_features ORDER BY package_id, feature_id;
