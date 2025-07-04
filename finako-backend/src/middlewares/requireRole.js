// Role-based access control middleware
module.exports = function requireRole(...allowedRoles) {
  return function(req, res, next) {
    // Pastikan validateMembership sudah dijalankan sebelumnya
    if (!req.userRole) {
      return res.status(500).json({
        success: false,
        error: 'Configuration Error',
        message: 'validateMembership middleware must be applied before requireRole'
      });
    }

    // Check if user role is in allowed roles
    if (!allowedRoles.includes(req.userRole)) {
      return res.status(403).json({
        success: false,
        error: 'Insufficient Permissions',
        message: `This action requires one of the following roles: ${allowedRoles.join(', ')}. Your role: ${req.userRole}`
      });
    }

    next();
  };
};

// Pre-defined role combinations untuk kemudahan
module.exports.adminOnly = module.exports('admin');
module.exports.ownerOnly = module.exports('owner');
module.exports.managerUp = module.exports('owner', 'admin', 'manager');
module.exports.staffUp = module.exports('owner', 'admin', 'manager', 'staff');
module.exports.memberUp = module.exports('owner', 'admin', 'manager', 'staff', 'member');
