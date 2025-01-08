import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { config } from '../config';
import { User, UserPayload } from '../types';

const prisma = new PrismaClient();

export class AuthService {
    static async registerUser(login: string, password: string) {
        const salt = await bcrypt.genSalt(16);
        const hashedPassword = await bcrypt.hash(password, salt);

        const user = await prisma.user.create({
            data: {
                login,
                password: hashedPassword,
                salt,
            },
        });

        return this.generateTokens(user);
    }

    static async loginUser(login: string, password: string) {
        const user = await prisma.user.findUnique({ where: { login } });

        if (!user) {
            throw new Error('User not found');
        }

        const validPassword = await bcrypt.compare(password, user.password);

        if (!validPassword) {
            throw new Error('Invalid password');
        }

        return this.generateTokens(user);
    }

    static async refreshToken(refreshToken: string) {
        try {
            const decoded = jwt.verify(
                refreshToken,
                config.refreshTokenSecret
            ) as UserPayload;

            const user = await prisma.user.findUnique({
                where: { id: decoded.id },
            });

            if (!user || user.refreshToken !== refreshToken) {
                throw new Error('Invalid refresh token');
            }

            return this.generateTokens(user);
        } catch (error) {
            throw new Error('Invalid refresh token');
        }
    }

    static async logout(userId: number) {
        await prisma.user.update({
            where: { id: userId },
            data: { refreshToken: null },
        });
    }

    private static async generateTokens(user: User) {
        const payload: UserPayload = {
            id: user.id,
            login: user.login,
        };

        const accessToken = jwt.sign(payload, config.accessTokenSecret, {
            expiresIn: config.accessTokenExpiration,
        });

        let refreshToken = user.refreshToken;
        if (refreshToken === null) {
            refreshToken = jwt.sign(payload, config.refreshTokenSecret, {
                expiresIn: config.refreshTokenExpiration,
            });
        }

        await prisma.user.update({
            where: { id: user.id },
            data: { refreshToken },
        });

        return { accessToken, refreshToken };
    }
}