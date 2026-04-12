const jwt = require('jsonwebtoken');

// Verify JWT token
const protect = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token, access denied' });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
};

// Role-based access: only allow specific roles
const allowRoles = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user?.role)) {
    return res.status(403).json({ error: `Access denied. Required role: ${roles.join(' or ')}` });
  }
  next();
};

// Block victims from accessing dashboard routes
const blockVictims = (req, res, next) => {
  if (req.user?.role === 'victim') {
    return res.status(403).json({ error: 'Victims cannot access this resource' });
  }
  next();
};

module.exports = { protect, allowRoles, blockVictims };