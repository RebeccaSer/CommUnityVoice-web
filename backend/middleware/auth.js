const jwt = require('jsonwebtoken');
const User = require('../models/User');

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  console.log('Auth header:', authHeader);
  console.log('Token:', token ? 'Present' : 'Missing');

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret', async (err, decoded) => {
    if (err) {
      console.error('JWT verification error:', err.message);
      return res.status(403).json({ error: 'Invalid or expired token' });
    }

    console.log('Decoded token:', decoded);

    try {
      const user = await User.findById(decoded.userId);
      if (!user) {
        console.error('User not found for ID:', decoded.userId);
        return res.status(403).json({ error: 'User not found' });
      }

      console.log('Authenticated user:', user.username, 'Role:', user.role, 'Area:', user.area_id);
      req.user = user;
      next();
    } catch (error) {
      console.error('Auth middleware error:', error);
      res.status(500).json({ error: 'Server error during authentication' });
    }
  });
};

const requireAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
};

const requireAreaAdmin = (areaId) => {
  return async (req, res, next) => {
    // Super admin can access any area
    if (req.user.role === 'admin' && req.user.area_id === null) {
      return next();
    }
    
    // Check if user is admin of this specific area
    if (req.user.role === 'admin' && req.user.area_id === parseInt(areaId)) {
      return next();
    }
    
    return res.status(403).json({ error: 'You can only access issues in your own area' });
  };
};

const requireSameArea = (req, res, next) => {
  const requestedAreaId = req.params.areaId || req.body.area_id;
  
  if (!requestedAreaId) {
    return next();
  }
  
  // Super admin can access any area
  if (req.user.role === 'admin' && req.user.area_id === null) {
    return next();
  }
  
  // Regular users can only access their own area
  if (req.user.area_id !== parseInt(requestedAreaId)) {
    return res.status(403).json({ error: 'You can only access issues in your own area' });
  }
  
  next();
};

module.exports = { 
  authenticateToken, 
  requireAdmin, 
  requireAreaAdmin,
  requireSameArea 
};