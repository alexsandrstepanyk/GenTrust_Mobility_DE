import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key';

export const authenticateToken = (req: any, res: Response, next: NextFunction) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    console.log('[Auth Middleware] Authorization header:', authHeader);
    console.log('[Auth Middleware] Extracted token:', token ? `${token.substring(0, 20)}...` : 'NONE');

    if (!token) {
        console.log('[Auth Middleware] No token provided - 401');
        return res.sendStatus(401);
    }

    jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
        if (err) {
            console.log('[Auth Middleware] Token verification failed:', err.message);
            return res.sendStatus(403);
        }
        console.log('[Auth Middleware] Token verified for user:', user.userId);
        req.user = user;
        next();
    });
};
