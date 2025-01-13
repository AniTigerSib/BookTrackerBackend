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

export interface Book {
    id: number;
    name: string;
    cover: string;
    avgRating: number;
}

export interface BookExtended extends Book {
    category: string;
    author: string;
    language: string;
    year: number;
    originalName: string;
    pages: number;
    abstract: string;
}

export interface BookUpdatable {
    name: string;
    cover: string;
    avgRating: number;
    category: number;
    author: string;
    language: string;
    year: number;
    originalName: string;
    pages: number;
    abstract: string;
}

export interface Category {
    id: number,
    name: string;
}

export interface BookByCategory {
    id: number;
    name: string;
    books: Book[];
}

export interface blUpdateRes {
    added: boolean;
    result: {
        userId: number;
        bookId: number;
    }
}

export class AuthError extends Error {}
export class BookServiceError extends Error {}