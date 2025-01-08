import { Request, Response } from 'express';
import { AuthService } from '../services/auth-service';
import { StatusCodes } from 'http-status-codes'

export class AuthController {
    static async register(req: Request, res: Response) {
        try {
            const { login, password } = req.body;
            const tokens = await AuthService.registerUser(login, password);
            res.status(StatusCodes.CREATED).json(tokens);
        } catch (error) {
            res.status(StatusCodes.BAD_REQUEST).json({ message: (error as Error).message });
        }
    }

    static async login(req: Request, res: Response) {
        try {
            const { login, password } = req.body;
            const tokens = await AuthService.loginUser(login, password);
            res.status(StatusCodes.OK).json(tokens);
        } catch (error) {
            res.status(StatusCodes.UNAUTHORIZED).json({ message: (error as Error).message });
        }
    }

    static async refresh(req: Request, res: Response) {
        try {
            const { refreshToken } = req.body;
            const tokens = await AuthService.refreshToken(refreshToken);
            res.status(StatusCodes.OK).json(tokens);
        } catch (error) {
            res.status(StatusCodes.UNAUTHORIZED).json({ message: (error as Error).message });
        }
    }

    static async logout(req: Request, res: Response) {
        try {
            const userId = req.user?.id;
            if (!userId) {
                throw new Error('User not found');
            }
            await AuthService.logout(userId);
            res.status(StatusCodes.OK).json({ message: 'Logged out successfully' });
        } catch (error) {
            res.status(StatusCodes.BAD_REQUEST).json({ message: (error as Error).message });
        }
    }
}