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
    const { email, password, businessName, packageId, ownerName } = req.body;
    
    // Validation
    if (!email || !password || !businessName || !packageId) {
      return res.status(400).json({ 
        error: 'Data tidak lengkap', 
        required: ['email', 'password', 'businessName', 'packageId']
      });
    }

    // 1. Register user di Supabase Auth
    const { data: signUpData, error: signUpError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true // Auto-confirm untuk SaaS flow
    });
    
    if (signUpError) throw signUpError;
    const user = signUpData.user;

    // 2. Tambahkan ke tabel profiles
    const { error: profileError } = await supabase.from('profiles').insert({
      id: user.id,
      email: email,
      full_name: ownerName || null
    });
    
    if (profileError) {
      // Cleanup user jika profile creation gagal
      await supabase.auth.admin.deleteUser(user.id);
      throw profileError;
    }

    // 3. Insert ke organizations
    const { data: orgData, error: orgError } = await supabase
      .from('organizations')
      .insert({
        name: businessName,
        owner_id: user.id,
        package_id: packageId,
        status: 'active' // Langsung active untuk SaaS flow
      })
      .select()
      .single();
    
    if (orgError) {
      // Cleanup user dan profile jika organization creation gagal
      await supabase.from('profiles').delete().eq('id', user.id);
      await supabase.auth.admin.deleteUser(user.id);
      throw orgError;
    }

    // 4. Insert owner ke organization_members
    const { error: memberError } = await supabase.from('organization_members').insert({
      organization_id: orgData.id,
      user_id: user.id,
      role: 'owner',
      status: 'active'
    });

    if (memberError) {
      // Cleanup jika membership creation gagal
      await supabase.from('organizations').delete().eq('id', orgData.id);
      await supabase.from('profiles').delete().eq('id', user.id);
      await supabase.auth.admin.deleteUser(user.id);
      throw memberError;
    }

    // 5. Copy fitur dari package_features ke organization_features
    const { data: features, error: featuresError } = await supabase
      .from('package_features')
      .select('feature_id, is_enabled, max_value')
      .eq('package_id', packageId);
    
    if (featuresError) throw featuresError;

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
      
      if (orgFeaturesError) throw orgFeaturesError;
    }

    res.status(201).json({
      success: true,
      message: 'Registrasi tenant berhasil',
      data: {
        user_id: user.id,
        organization: orgData
      }
    });

  } catch (err) {
    next(err);
  }
};

exports.checkEmailAvailability = async (req, res, next) => {
  try {
    const { email } = req.params;
    
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
