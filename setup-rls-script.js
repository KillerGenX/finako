// Script untuk setup RLS policies via Supabase client
// Run di Node.js atau browser console

const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'YOUR_SUPABASE_URL',
  'YOUR_SERVICE_ROLE_KEY' // Harus service key, bukan anon key
);

async function setupRLSPolicies() {
  try {
    // Enable RLS
    await supabase.rpc('enable_rls_for_table', { table_name: 'business_profiles' });
    
    // Create policies via SQL
    const policies = `
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
    `;
    
    await supabase.rpc('exec_sql', { sql: policies });
    console.log('RLS policies created successfully!');
  } catch (error) {
    console.error('Error creating policies:', error);
  }
}

// setupRLSPolicies();
