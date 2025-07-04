-- Fix Organization Members Data
-- This script handles the complete user -> profiles -> organization_members chain

-- Step 1: Check existing data across all related tables
SELECT 'EXISTING AUTH.USERS:' as info;
SELECT id, email FROM auth.users ORDER BY email;

SELECT 'EXISTING PROFILES:' as info;
SELECT id, email, full_name FROM profiles ORDER BY email;

SELECT 'EXISTING ORGANIZATIONS:' as info;
SELECT id, name, owner_id FROM organizations ORDER BY name;

SELECT 'EXISTING ORGANIZATION_MEMBERS:' as info;
SELECT * FROM organization_members;

-- Step 2: Create missing profiles for existing auth.users that own organizations
INSERT INTO profiles (id, email, full_name)
SELECT DISTINCT 
    au.id,
    au.email,
    COALESCE(au.raw_user_meta_data->>'full_name', 
             CASE 
                 WHEN o.name = 'Alpha Corp' THEN 'Tuan Alpha'
                 WHEN o.name = 'Beta Ltd' THEN 'Tuan Beta' 
                 WHEN o.name = 'Gamma Inc' THEN 'Tuan Gamma'
                 ELSE 'Organization Owner'
             END) as full_name
FROM auth.users au
JOIN organizations o ON au.id = o.owner_id
WHERE NOT EXISTS (SELECT 1 FROM profiles p WHERE p.id = au.id);

-- Step 3: Clear existing organization_members
DELETE FROM organization_members;

-- Step 4: Insert organization members using profiles that exist
-- This ensures the foreign key constraints are satisfied
INSERT INTO organization_members (user_id, organization_id, role)
SELECT 
    p.id as user_id,
    o.id as organization_id,
    'owner' as role
FROM organizations o
JOIN profiles p ON o.owner_id = p.id;

-- Step 5: Add staff members if they exist in both auth.users and profiles
INSERT INTO organization_members (user_id, organization_id, role)
SELECT 
    p.id as user_id,
    o.id as organization_id,
    'pegawai' as role
FROM profiles p
JOIN organizations o ON o.name = 'Alpha Corp'
WHERE p.email LIKE 'staff.%@alpha.com';

-- Step 6: Show final results with complete relationship chain
SELECT 'FINAL RESULTS - COMPLETE CHAIN:' as info;
SELECT 
    au.email as auth_email,
    p.email as profile_email,
    p.full_name,
    om.role,
    o.name as organization_name,
    om.user_id,
    om.organization_id
FROM organization_members om
JOIN organizations o ON om.organization_id = o.id
JOIN profiles p ON om.user_id = p.id
LEFT JOIN auth.users au ON p.id = au.id
ORDER BY o.name, om.role;

-- Step 6: Show summary count
SELECT 
    'SUMMARY' as info,
    COUNT(*) as total_members,
    COUNT(CASE WHEN role = 'owner' THEN 1 END) as owners,
    COUNT(CASE WHEN role = 'pegawai' THEN 1 END) as staff
FROM organization_members;
