-- MANUAL USER & ORGANIZATION SETUP
-- Run this first to create users and organizations manually

-- Step 1: Users already created manually ✅
-- Users created with password: password123
-- 1. tuan.a@alpha.com (Alpha Corp owner) - a9a93a2a-8779-4723-8ab8-5d72699e5c79
-- 2. staff.a@alpha.com (Alpha Corp staff) - fd805424-f104-411c-9346-5b8e271e7d0f
-- 3. tuan.b@beta.com (Beta Ltd owner) - 41e15dff-920f-4007-821c-83c4cae97bbc
-- 4. tuan.c@gamma.com (Gamma Inc owner) - 145243d0-d89f-4d24-a7d9-5f2bff9468f3

-- Step 2: Verify user IDs
SELECT 'Verifying created user IDs:' as instruction;
SELECT 
    email,
    id as user_id,
    CASE 
        WHEN email = 'tuan.a@alpha.com' THEN 'Alpha Corp Owner'
        WHEN email = 'staff.a@alpha.com' THEN 'Alpha Corp Staff'
        WHEN email = 'tuan.b@beta.com' THEN 'Beta Ltd Owner'  
        WHEN email = 'tuan.c@gamma.com' THEN 'Gamma Inc Owner'
        ELSE 'Other'
    END as role_description
FROM auth.users 
WHERE email IN ('tuan.a@alpha.com', 'staff.a@alpha.com', 'tuan.b@beta.com', 'tuan.c@gamma.com')
ORDER BY email;

-- Step 3: Create organizations with actual user IDs ✅
INSERT INTO organizations (name, email, status, owner_id, created_at) VALUES 
('Alpha Corp', 'tuan.a@alpha.com', 'active', 'a9a93a2a-8779-4723-8ab8-5d72699e5c79', NOW()),
('Beta Ltd', 'tuan.b@beta.com', 'active', '41e15dff-920f-4007-821c-83c4cae97bbc', NOW()),
('Gamma Inc', 'tuan.c@gamma.com', 'active', '145243d0-d89f-4d24-a7d9-5f2bff9468f3', NOW())
RETURNING id, name, owner_id;

-- Step 4: Get the organization IDs
SELECT 'Copy these organization IDs for the main sample data script:' as instruction;
SELECT 
    name,
    id as organization_id,
    owner_id
FROM organizations 
WHERE name IN ('Alpha Corp', 'Beta Ltd', 'Gamma Inc')
ORDER BY name;

-- Step 5: Setup organization members ✅
INSERT INTO organization_members (user_id, organization_id, role) 
SELECT 
    o.owner_id,
    o.id,
    'owner'
FROM organizations o
WHERE o.name IN ('Alpha Corp', 'Beta Ltd', 'Gamma Inc');

-- Add staff member for Alpha Corp
INSERT INTO organization_members (user_id, organization_id, role) VALUES 
(
    'fd805424-f104-411c-9346-5b8e271e7d0f', 
    (SELECT id FROM organizations WHERE name = 'Alpha Corp'), 
    'pegawai'
);

-- Verify setup
SELECT 
    o.name as organization_name,
    u.email as user_email,
    om.role,
    o.id as org_id,
    u.id as user_id
FROM organizations o
JOIN organization_members om ON o.id = om.organization_id  
JOIN auth.users u ON om.user_id = u.id
ORDER BY o.name, om.role;
