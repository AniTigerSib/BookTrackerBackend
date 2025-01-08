export interface UserPayload {
    id: number;
    login: string;
}

export interface TokenPayload extends UserPayload {
    iat: number;
    exp: number;
}

export interface User {
    id: number;
    login: string;
    password: string;
    salt: string;
    refreshToken: string | null;
}