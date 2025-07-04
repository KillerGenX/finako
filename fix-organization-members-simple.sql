-- Simple Fix for Organization Members
-- If profiles table is empty, this script creates the necessary profiles first

-- Step 1: Check what exists
SELECT 'Current profiles count:' as info, COUNT(*) as count FROM profiles;
SELECT 'Current organizations count:' as info, COUNT(*) as count FROM organizations;
SELECT 'Current organization_members count:' as info, COUNT(*) as count FROM organization_members;

-- Step 2: Create profiles if they don't exist (matching organization owners)
INSERT INTO profiles (id, email, full_name)
SELECT DISTINCT 
    o.owner_id,
    CASE 
        WHEN o.name = 'Alpha Corp' THEN 'tuan.a@alpha.com'
        WHEN o.name = 'Beta Ltd' THEN 'tuan.b@beta.com'
        WHEN o.name = 'Gamma Inc' THEN 'tuan.c@gamma.com'
        ELSE 'unknown@example.com'
    END as email,
    CASE 
        WHEN o.name = 'Alpha Corp' THEN 'Tuan Alpha'
        WHEN o.name = 'Beta Ltd' THEN 'Tuan Beta'
        WHEN o.name = 'Gamma Inc' THEN 'Tuan Gamma'
        ELSE 'Unknown User'
    END as full_name
FROM organizations o
WHERE o.owner_id IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM profiles p WHERE p.id = o.owner_id);

-- Step 3: Create additional staff profile for Alpha Corp if needed
INSERT INTO profiles (id, email, full_name)
SELECT 
    'fd805424-f104-411c-9346-5b8e271e7d0f',
    'staff.a@alpha.com',
    'Staff Alpha'
WHERE NOT EXISTS (
    SELECT 1 FROM profiles WHERE id = 'fd805424-f104-411c-9346-5b8e271e7d0f'
);

-- Step 4: Clear existing organization_members
DELETE FROM organization_members;

-- Step 5: Insert organization members (owners)
INSERT INTO organization_members (user_id, organization_id, role)
SELECT 
    o.owner_id,
    o.id,
    'owner'
FROM organizations o
WHERE o.owner_id IS NOT NULL;

-- Step 6: Insert staff member for Alpha Corp if profile exists
INSERT INTO organization_members (user_id, organization_id, role)
SELECT 
    'fd805424-f104-411c-9346-5b8e271e7d0f',
    o.id,
    'pegawai'
FROM organizations o
WHERE o.name = 'Alpha Corp'
AND EXISTS (SELECT 1 FROM profiles WHERE id = 'fd805424-f104-411c-9346-5b8e271e7d0f');

-- Step 7: Show final results
SELECT 'FINAL RESULTS:' as info;
SELECT 
    om.user_id,
    om.organization_id,
    om.role,
    o.name as organization_name,
    p.email as user_email,
    p.full_name
FROM organization_members om
JOIN organizations o ON om.organization_id = o.id
JOIN profiles p ON om.user_id = p.id
ORDER BY o.name, om.role;
