// Authentication middleware untuk JWT token validation
const supabase = require('../models/db');

module.exports = async function authenticate(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'Authentication Required',
        message: 'Please provide a valid Bearer token in Authorization header'
      });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Verify JWT token with Supabase
    const { data: { user }, error } = await supabase.auth.getUser(token);
    
    if (error || !user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid Token',
        message: 'The provided token is invalid or expired'
      });
    }

    // Inject user into request
    req.user = user;
    req.token = token;
    
    next();
  } catch (err) {
    next(err);
  }
};
