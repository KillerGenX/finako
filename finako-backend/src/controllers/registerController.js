const supabase = require('../models/db');

exports.getPackages = async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('packages')
      .select('*')
      .order('price', { ascending: true });
    
    if (error) throw error;
    res.json(data);
  } catch (err) {
    next(err);
  }
};

exports.createTenant = async (req, res, next) => {
  try {
    console.log('📝 Register request received:', req.body);
    const { email, password, businessName, packageId, ownerName } = req.body;
    
    // Validation
    if (!email || !password || !businessName || !packageId) {
      console.log('❌ Validation failed - missing required fields');
      return res.status(400).json({ 
        error: 'Data tidak lengkap', 
        required: ['email', 'password', 'businessName', 'packageId']
      });
    }

    console.log('✅ Validation passed, creating user...');
    // 1. Register user di Supabase Auth
    const { data: signUpData, error: signUpError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true // Auto-confirm untuk SaaS flow
    });
    
    if (signUpError) {
      console.error('❌ SignUp error:', signUpError);
      throw signUpError;
    }
    const user = signUpData.user;
    console.log('✅ User created:', user.id);

    // 2. Tambahkan ke tabel profiles
    console.log('📝 Creating profile...');
    const { error: profileError } = await supabase.from('profiles').insert({
      id: user.id,
      email: email,
      full_name: ownerName || null
    });
    
    if (profileError) {
      console.error('❌ Profile error:', profileError);
      // Cleanup user jika profile creation gagal
      await supabase.auth.admin.deleteUser(user.id);
      throw profileError;
    }
    console.log('✅ Profile created');

    // 3. Insert ke organizations dengan status pending
    console.log('📝 Creating organization...');
    const { data: orgData, error: orgError } = await supabase
      .from('organizations')
      .insert({
        name: businessName,
        owner_id: user.id,
        package_id: packageId,
        status: 'pending' // Status pending untuk admin approval flow
      })
      .select()
      .single();
    
    if (orgError) {
      console.error('❌ Organization error:', orgError);
      // Cleanup user dan profile jika organization creation gagal
      await supabase.from('profiles').delete().eq('id', user.id);
      await supabase.auth.admin.deleteUser(user.id);
      throw orgError;
    }
    console.log('✅ Organization created:', orgData.id);

    // 4. Insert owner ke organization_members
    console.log('📝 Creating membership...');
    const { error: memberError } = await supabase.from('organization_members').insert({
      organization_id: orgData.id,
      user_id: user.id,
      role: 'owner'
      // Remove status field - tidak ada di schema
    });

    if (memberError) {
      console.error('❌ Membership error:', memberError);
      // Cleanup jika membership creation gagal
      await supabase.from('organizations').delete().eq('id', orgData.id);
      await supabase.from('profiles').delete().eq('id', user.id);
      await supabase.auth.admin.deleteUser(user.id);
      throw memberError;
    }
    console.log('✅ Membership created');

    // 5. Copy fitur dari package_features ke organization_features
    console.log('📝 Copying package features...');
    const { data: features, error: featuresError } = await supabase
      .from('package_features')
      .select('feature_id, is_enabled, max_value')
      .eq('package_id', packageId);
    
    if (featuresError) {
      console.error('❌ Features error:', featuresError);
      throw featuresError;
    }

    if (features && features.length > 0) {
      const orgFeatures = features.map(f => ({
        organization_id: orgData.id,
        feature_id: f.feature_id,
        is_enabled: f.is_enabled,
        max_value: f.max_value
      }));
      
      const { error: orgFeaturesError } = await supabase
        .from('organization_features')
        .insert(orgFeatures);
      
      if (orgFeaturesError) {
        console.error('❌ Organization features error:', orgFeaturesError);
        throw orgFeaturesError;
      }
      console.log('✅ Features copied:', features.length);
    }

    console.log('🎉 Registration completed successfully!');
    res.status(201).json({
      success: true,
      message: 'Registrasi tenant berhasil. Menunggu approval admin.',
      data: {
        user_id: user.id,
        organization: orgData,
        next_step: 'payment_info'
      }
    });

  } catch (err) {
    console.error('💥 Registration error:', err);
    next(err);
  }
};

exports.checkEmailAvailability = async (req, res, next) => {
  try {
    const { email } = req.query;
    
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    // Check di Supabase Auth
    const { data: users, error } = await supabase.auth.admin.listUsers();
    if (error) throw error;

    const emailExists = users.users.some(user => user.email === email);
    
    res.json({
      email,
      available: !emailExists
    });

  } catch (err) {
    next(err);
  }
};
