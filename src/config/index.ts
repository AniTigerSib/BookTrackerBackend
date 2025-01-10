import dotenv from 'dotenv';

dotenv.config();

export const config = {
    port: process.env.PORT || 3000,
    accessTokenSecret: process.env.ACCESS_TOKEN_SECRET!,
    refreshTokenSecret: process.env.REFRESH_TOKEN_SECRET!,
    accessTokenExpiration: process.env.ACCESS_TOKEN_EXP!,
    refreshTokenExpiration: process.env.REFRESH_TOKEN_EXP!,
};