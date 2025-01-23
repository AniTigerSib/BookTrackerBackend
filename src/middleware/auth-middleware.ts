import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config';
import { TokenPayload } from '../types';
import { StatusCodes } from 'http-status-codes'
import {PrismaClient} from '@prisma/client'

const prisma = new PrismaClient();

declare global {
    namespace Express {
        interface Request {
            user?: TokenPayload;
        }
    }
}
// TODO: Add check of that user is still logged in (refresh token is still in database)
export const authenticateToken = async (
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
            const user = await prisma.user.findUnique({
                where: {id: decoded.id},
                select: {id: true, login: true, refreshToken: true}
            });

            if (!user || !user.refreshToken) {
                res.status(StatusCodes.UNAUTHORIZED).json({ message: 'User not validated' });
            } else {
                req.user = decoded;
                next();
            }
        } catch (error) {
            if (error instanceof jwt.TokenExpiredError) {
                res.status(StatusCodes.UNAUTHORIZED).json({ message: 'Token has expired' });
            } else {
                res.status(StatusCodes.FORBIDDEN).json({ message: 'Invalid token' });
            }
        }
    }
}