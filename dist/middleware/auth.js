const jwt = require('jsonwebtoken');
const config = require('../config/config');
const User = require('../models/User');
// JWT Authentication Middleware
const authenticateToken = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN
        if (!token) {
            return res.status(401).json({
                status: 'error',
                message: 'Access token is required'
            });
        }
        // Verify token
        const decoded = jwt.verify(token, config.jwt.secret);
        // Find user to ensure they still exist and are active
        const user = await User.findById(decoded.id);
        if (!user || !user.is_active) {
            return res.status(401).json({
                status: 'error',
                message: 'Invalid or expired token'
            });
        }
        // Add user info to request
        req.user = {
            id: user.id,
            email: user.email,
            role: user.role,
            role_id: user.role_id,
            name: user.name
        };
        next();
    }
    catch (error) {
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({
                status: 'error',
                message: 'Invalid token'
            });
        }
        else if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                status: 'error',
                message: 'Token has expired'
            });
        }
        next(error);
    }
};
// Role-based authorization middleware
const authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                status: 'error',
                message: 'Authentication required'
            });
        }
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                status: 'error',
                message: 'Insufficient permissions'
            });
        }
        next();
    };
};
// Optional authentication middleware (doesn't fail if no token)
const optionalAuth = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        const token = authHeader && authHeader.split(' ')[1];
        if (token) {
            const decoded = jwt.verify(token, config.jwt.secret);
            const user = await User.findById(decoded.id);
            if (user && user.is_active) {
                req.user = {
                    id: user.id,
                    email: user.email,
                    role: user.role,
                    role_id: user.role_id,
                    name: user.name
                };
            }
        }
        next();
    }
    catch (error) {
        // Continue without authentication if token is invalid
        next();
    }
};
module.exports = {
    authenticateToken,
    authorize,
    optionalAuth
};
//# sourceMappingURL=auth.js.map