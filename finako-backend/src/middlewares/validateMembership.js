// Enhanced middleware untuk validasi user membership dalam organization (multi-tenant)
const supabase = require('../models/db');

module.exports = async function validateMembership(req, res, next) {
  try {
    // 1. Extract user ID dari berbagai sumber
    const userId = extractUserId(req);
    if (!userId) {
      return res.status(401).json({ 
        success: false,
        error: 'Authentication Required',
        message: 'User ID is required. Please provide x-user-id header or authentication token.'
      });
    }

    // 2. Extract organization ID dengan prioritas
    const organizationId = extractOrganizationId(req);
    if (!organizationId) {
      return res.status(400).json({ 
        success: false,
        error: 'Missing Organization ID',
        message: 'organization_id is required in query parameters or request body.'
      });
    }

    // 3. Validasi membership user di organization
    const { data: member, error: memberError } = await supabase
      .from('organization_members')
      .select(`
        *,
        organizations!inner(
          id,
          name,
          status,
          package_id
        )
      `)
      .eq('organization_id', organizationId)
      .eq('user_id', userId)
      .single();

    if (memberError) {
      console.log('DEBUG memberError:', memberError);
      if (memberError.code === 'PGRST116') {
        return res.status(403).json({ 
          success: false,
          error: 'Access Denied',
          message: 'You are not a member of this organization or your membership is inactive.'
        });
      }
      throw memberError;
    }

    // 4. Validasi status organization
    if (member.organizations.status !== 'active') {
      return res.status(403).json({ 
        success: false,
        error: 'Organization Inactive',
        message: 'This organization is currently inactive.'
      });
    }

    // 5. (Opsional) Validasi outlet jika ada
    const outletId = extractOutletId(req);
    if (outletId) {
      const { data: outlet, error: outletError } = await supabase
        .from('outlets')
        .select('id, organization_id')
        .eq('id', outletId)
        .eq('organization_id', organizationId)
        .single();

      if (outletError || !outlet) {
        return res.status(403).json({ 
          success: false,
          error: 'Invalid Outlet',
          message: 'Outlet not found or does not belong to this organization.'
        });
      }
      req.outletId = outletId;
      req.outlet = outlet;
    }

    // 6. Inject data ke request untuk digunakan di controller
    req.userId = userId;
    req.organizationId = organizationId;
    req.userRole = member.role;
    req.member = member;
    req.organization = member.organizations;

    next();
  } catch (err) {
    next(err);
  }
};

// Helper functions
function extractUserId(req) {
  // Priority: req.user.id (from JWT middleware) > x-user-id header > body/query
  return req.user?.id || 
         req.headers['x-user-id'] || 
         req.body?.user_id || 
         req.query?.user_id;
}

function extractOrganizationId(req) {
  // Priority: body > query > header
  return req.body?.organization_id || 
         req.query?.organization_id || 
         req.headers['x-organization-id'];
}

function extractOutletId(req) {
  // Priority: body > query > header
  return req.body?.outlet_id || 
         req.query?.outlet_id || 
         req.headers['x-outlet-id'];
}
