-- Fix RLS Policies untuk Multi-Tenant SaaS
-- Run di Supabase SQL Editor

-- 1. Enable RLS untuk business_profiles
ALTER TABLE business_profiles ENABLE ROW LEVEL SECURITY;

-- 2. Policy untuk READ business_profiles
CREATE POLICY "tenant_can_read_own_business_profile" 
ON business_profiles FOR SELECT 
TO authenticated
USING (
  organization_id IN (
    SELECT organization_id 
    FROM organization_members 
    WHERE user_id = auth.uid()
  )
);

-- 3. Policy untuk INSERT business_profiles
CREATE POLICY "tenant_can_insert_own_business_profile" 
ON business_profiles FOR INSERT 
TO authenticated
WITH CHECK (
  organization_id IN (
    SELECT organization_id 
    FROM organization_members 
    WHERE user_id = auth.uid()
  )
);

-- 4. Policy untuk UPDATE business_profiles
CREATE POLICY "tenant_can_update_own_business_profile" 
ON business_profiles FOR UPDATE 
TO authenticated
USING (
  organization_id IN (
    SELECT organization_id 
    FROM organization_members 
    WHERE user_id = auth.uid()
  )
)
WITH CHECK (
  organization_id IN (
    SELECT organization_id 
    FROM organization_members 
    WHERE user_id = auth.uid()
  )
);

-- 5. Policy untuk DELETE business_profiles
CREATE POLICY "tenant_can_delete_own_business_profile" 
ON business_profiles FOR DELETE 
TO authenticated
USING (
  organization_id IN (
    SELECT organization_id 
    FROM organization_members 
    WHERE user_id = auth.uid()
  )
);

-- Verification: Check policies
SELECT * FROM pg_policies WHERE tablename = 'business_profiles';
