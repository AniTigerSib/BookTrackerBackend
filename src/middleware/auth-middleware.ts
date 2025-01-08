import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config';
import { TokenPayload } from '../types';
import { StatusCodes } from 'http-status-codes'

declare global {
    namespace Express {
        interface Request {
            user?: TokenPayload;
        }
    }
}

export const authenticateToken = (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        res.status(StatusCodes.UNAUTHORIZED).json({ message: 'Access token required' });
    } else {
        try {
            const decoded = jwt.verify(
                token,
                config.accessTokenSecret
            ) as TokenPayload;
            req.user = decoded;
            next();
        } catch (error) {
            res.status(StatusCodes.FORBIDDEN).json({ message: 'Invalid or expired token' });
        }
    }
}