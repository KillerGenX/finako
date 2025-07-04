-- Alternative Fix: Manual Profiles Creation + Organization Members
-- Use this if auth.users table access is restricted or data is missing

-- Step 1: Check current state
SELECT 'CURRENT PROFILES:' as info;
SELECT id, email, full_name FROM profiles ORDER BY email;

SELECT 'CURRENT ORGANIZATIONS:' as info; 
SELECT id, name, owner_id FROM organizations ORDER BY name;

-- Step 2: Manually create profiles for known organization owners
-- Based on the UUIDs from your setup documentation
INSERT INTO profiles (id, email, full_name) VALUES
('a9a93a2a-8779-4723-8ab8-5d72699e5c79', 'tuan.a@alpha.com', 'Tuan Alpha'),
('41e15dff-920f-4007-821c-83c4cae97bbc', 'tuan.b@beta.com', 'Tuan Beta'),
('145243d0-d89f-4d24-a7d9-5f2bff9468f3', 'tuan.c@gamma.com', 'Tuan Gamma'),
('fd805424-f104-411c-9346-5b8e271e7d0f', 'staff.a@alpha.com', 'Staff Alpha')
ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = EXCLUDED.full_name;

-- Step 3: Clear and rebuild organization_members
DELETE FROM organization_members;

-- Step 4: Insert organization owners
INSERT INTO organization_members (user_id, organization_id, role) VALUES
('a9a93a2a-8779-4723-8ab8-5d72699e5c79', '7adc3b86-d86c-4785-a5c7-6382216bb729', 'owner'), -- Alpha Corp
('41e15dff-920f-4007-821c-83c4cae97bbc', 'ac8aae2e-0b23-41d0-b595-fe1174efbf39', 'owner'), -- Beta Ltd  
('145243d0-d89f-4d24-a7d9-5f2bff9468f3', 'ed59f6a4-bb75-419f-8deb-e771ac37e3ad', 'owner'); -- Gamma Inc

-- Step 5: Insert staff member for Alpha Corp
INSERT INTO organization_members (user_id, organization_id, role) VALUES
('fd805424-f104-411c-9346-5b8e271e7d0f', '7adc3b86-d86c-4785-a5c7-6382216bb729', 'pegawai'); -- Alpha Corp Staff

-- Step 6: Verify results
SELECT 'FINAL VERIFICATION:' as info;
SELECT 
    p.email,
    p.full_name,
    om.role,
    o.name as organization,
    om.user_id = o.owner_id as is_owner_match
FROM organization_members om
JOIN profiles p ON om.user_id = p.id
JOIN organizations o ON om.organization_id = o.id
ORDER BY o.name, om.role;

-- Step 7: Summary
SELECT 
    'SUMMARY' as label,
    COUNT(*) as total_members,
    COUNT(CASE WHEN role = 'owner' THEN 1 END) as owners,
    COUNT(CASE WHEN role = 'pegawai' THEN 1 END) as staff
FROM organization_members;
