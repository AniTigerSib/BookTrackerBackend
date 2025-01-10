import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth-service';
import { StatusCodes, ReasonPhrases } from 'http-status-codes'
import { AuthError } from "../types";

export class AuthController {
    static async register(req: Request, res: Response, next: NextFunction) {
        try {
            const { login, password } = req.body;
            const tokens = await AuthService.registerUser(login, password);
            res.status(StatusCodes.CREATED).json(tokens);
        } catch (error) {
            if (error instanceof AuthError) {
                res.status(StatusCodes.BAD_REQUEST).json({ error: (error as Error).message });
            } else {
                next(error);
                // throw new Error(`User register failed. Error: ${(error as Error).message}`);
            }
        }
    }

    static async login(req: Request, res: Response, next: NextFunction) {
        try {
            const { login, password } = req.body;
            const tokens = await AuthService.loginUser(login, password);
            res.status(StatusCodes.OK).json(tokens);
        } catch (error) {
            if (error instanceof AuthError) {
                res.status(StatusCodes.UNAUTHORIZED).json({ message: (error as Error).message });
            } else {
                next(error);
                // throw new Error(`User login failed. Error: ${(error as Error).message}`);
            }
        }
    }

    static async refresh(req: Request, res: Response, next: NextFunction) {
        try {
            const { refreshToken } = req.body;
            const tokens = await AuthService.refreshToken(refreshToken);
            res.status(StatusCodes.OK).json(tokens);
        } catch (error) {
            if (error instanceof AuthError) {
                res.status(StatusCodes.UNAUTHORIZED).json({ message: (error as Error).message });
            } else {
                next(error);
                // throw new Error(`User refresh failed. Error: ${(error as Error).message}`);
            }
        }
    }

    static async logout(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = req.user?.id;
            if (!userId) {
                res.status(StatusCodes.NOT_FOUND).json({ message: ReasonPhrases.NOT_FOUND });
            } else {
                await AuthService.logout(userId);
                res.status(StatusCodes.OK).json({ message: 'Logged out successfully' });
            }
        } catch (error) {
            if (error instanceof AuthError) {
                res.status(StatusCodes.BAD_REQUEST).json({ message: (error as Error).message });
            } else {
                next(error);
                // throw new Error(`User logout failed. Error: ${(error as Error).message}`);
            }
        }
    }
}