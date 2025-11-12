// middleware/admin.js

// Check if user is admin
exports.admin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({
      success: false,
      message: 'Access denied. Admin privileges required.'
    });
  }
};

// Check if user is admin or owner of resource
exports.adminOrOwner = (resourceUserId) => {
  return (req, res, next) => {
    if (req.user && (req.user.role === 'admin' || req.user.id === resourceUserId)) {
      next();
    } else {
      res.status(403).json({
        success: false,
        message: 'Access denied. You do not have permission to perform this action.'
      });
    }
  };
};