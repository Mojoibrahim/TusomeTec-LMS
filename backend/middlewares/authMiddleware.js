// middleware/authMiddleware.js
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Layer 1 & 2: Authenticate Identity
exports.protect = async(req, res, next) => {
    let token;

    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
        return res.status(401).json({ message: 'Not authorized, no token provided' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'supersecretkey');

// Fetch current user details excluding password to keep req.user fresh
        const currentUser = await User.findById(decoded.id).select('-password');
        if (!currentUser) {
            return res.status(401).json({ message: 'User belonging to this token no longer exists' });
        }

        req.user = currentUser;
        next();
    } catch (error) {
        return res.status(401).json({ message: 'Token is invalid or expired' });
    }
};

// RBAC Middleware: Authorize Roles
exports.authorize = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.user || !allowedRoles.includes(req.user.role)) {
            return res.status(403).json({
                message: `Forbidden: Role '${req.user ? req.user.role : 'Guest'}' lacks access permission`
            });
        }
        next();
    };
};