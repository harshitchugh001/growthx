const jwt = require('jsonwebtoken');
exports.userMiddleware = (req, res, next) => {
  const token = req.header('Authorization');

  if (!token) {
    return res.status(401).json({ message: 'Access Denied: No Token Provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role !== 'User') {
      return res.status(403).json({ message: 'Access Denied: Not a User' });
    }
    req.user = decoded; 
    console.log(req.user);
    next();
  } catch (err) {
    return res.status(400).json({ message: 'Invalid Token' });
  }
};

exports.adminMiddleware = (req, res, next) => {
  const token = req.header('Authorization');

  if (!token) {
    return res.status(401).json({ message: 'Access Denied: No Token Provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role !== 'Admin') {
      return res.status(403).json({ message: 'Access Denied: Not an Admin' });
    }
    req.user = decoded; 
    next();
  } catch (err) {
    return res.status(400).json({ message: 'Invalid Token' });
  }
};
