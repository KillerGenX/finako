-- Create Default Outlets for Each Organization
-- This script creates a main outlet for each organization to satisfy outlet requirements

-- Step 1: Check current outlets
SELECT 'CURRENT OUTLETS:' as info;
SELECT id, organization_id, name, address FROM outlets ORDER BY name;

-- Step 2: Check organizations that need outlets
SELECT 'ORGANIZATIONS WITHOUT OUTLETS:' as info;
SELECT 
    o.id,
    o.name,
    o.owner_id
FROM organizations o
LEFT JOIN outlets out ON o.id = out.organization_id
WHERE out.id IS NULL
ORDER BY o.name;

-- Step 3: Create default main outlet for each organization
INSERT INTO outlets (organization_id, name, address)
SELECT 
    o.id as organization_id,
    o.name || ' - Main Outlet' as name,
    COALESCE(o.address, 'Main Location') as address
FROM organizations o
WHERE NOT EXISTS (
    SELECT 1 FROM outlets out WHERE out.organization_id = o.id
);

-- Step 4: Show created outlets
SELECT 'CREATED OUTLETS:' as info;
SELECT 
    out.id,
    out.name as outlet_name,
    out.address,
    o.name as organization_name,
    out.organization_id
FROM outlets out
JOIN organizations o ON out.organization_id = o.id
ORDER BY o.name;

-- Step 5: Get outlet IDs for testing
SELECT 'OUTLET IDS FOR TESTING:' as info;
SELECT 
    o.name as organization,
    out.id as outlet_id,
    out.name as outlet_name
FROM outlets out
JOIN organizations o ON out.organization_id = o.id
ORDER BY o.name;

-- Step 6: Summary
SELECT 
    'SUMMARY' as label,
    COUNT(*) as total_outlets,
    COUNT(DISTINCT organization_id) as organizations_with_outlets
FROM outlets;
