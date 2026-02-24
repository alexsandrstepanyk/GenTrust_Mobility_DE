"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticateToken = void 0;
var jsonwebtoken_1 = require("jsonwebtoken");
var JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key';
var authenticateToken = function (req, res, next) {
    var authHeader = req.headers['authorization'];
    var token = authHeader && authHeader.split(' ')[1];
    console.log('[Auth Middleware] Authorization header:', authHeader);
    console.log('[Auth Middleware] Extracted token:', token ? "".concat(token.substring(0, 20), "...") : 'NONE');
    if (!token) {
        console.log('[Auth Middleware] No token provided - 401');
        return res.sendStatus(401);
    }
    jsonwebtoken_1.default.verify(token, JWT_SECRET, function (err, user) {
        if (err) {
            console.log('[Auth Middleware] Token verification failed:', err.message);
            return res.sendStatus(403);
        }
        console.log('[Auth Middleware] Token verified for user:', user.userId);
        req.user = user;
        next();
    });
};
exports.authenticateToken = authenticateToken;
