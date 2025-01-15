import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { config } from '../config';
import { User, UserPayload, AuthError } from '../types';

const prisma = new PrismaClient();

export class AuthService {
    static async registerUser(login: string, password: string) {
        const checkedUser = await prisma.user.findUnique({
            where: {
                login
            }
        });
        if (checkedUser !== null && checkedUser !== undefined) {
            throw new AuthError('User already exists');
        }
        const salt = await bcrypt.genSalt(16);
        const hashedPassword = await bcrypt.hash(password, salt);

        const user = await prisma.user.create({
            data: {
                login,
                password: hashedPassword,
                salt,
            },
        });

        return this.generateTokens(user, true, false);
    }

    static async loginUser(login: string, password: string) {
        const user = await prisma.user.findUnique({ where: { login } });

        if (!user) {
            throw new AuthError('User not found');
        }

        const validPassword = await bcrypt.compare(password, user.password);

        if (!validPassword) {
            throw new AuthError('Invalid password');
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

            if (!(!user || user.refreshToken !== refreshToken)) {
                return this.generateTokens(user, false);
            }
            throw new AuthError('Invalid refresh token');
        } catch (error) {
            throw new AuthError('Invalid refresh token');
        }
    }

    static async logout(userId: number) {
        await prisma.user.update({
            where: { id: userId },
            data: { refreshToken: null },
        });
    }

    private static async generateTokens(user: User, generateRefresh: boolean = true, updateDatabase: boolean = true) {
        const payload: UserPayload = {
            id: user.id,
            login: user.login,
        };

        const accessToken = jwt.sign(payload, config.accessTokenSecret, {
            expiresIn: config.accessTokenExpiration,
            algorithm: 'HS256',
        });

        let refreshToken = user.refreshToken;
        if (generateRefresh) {
            refreshToken = jwt.sign(payload, config.refreshTokenSecret, {
                expiresIn: config.refreshTokenExpiration,
                algorithm: 'HS256',
            });
            if (updateDatabase) {
                await prisma.user.update({
                    where: { id: user.id },
                    data: { refreshToken },
                });
            }
        }

        return { accessToken, refreshToken };
    }
}