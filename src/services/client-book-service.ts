import { PrismaClient } from '@prisma/client';
import { Prisma } from '@prisma/client'
import {blUpdateRes, Book, BookByCategory, BookExtended, BookServiceError} from "../types";

const prisma = new PrismaClient();

const bookSelect = {
    id: true,
    name: true,
    cover: true,
    avgRating: true,
} as const;

// Define the select object type for better reusability and type safety
const bookExtendedSelect = {
    id: true,
    name: true,
    cover: true,
    author: true,
    language: true,
    year: true,
    originalName: true,
    pages: true,
    abstract: true,
    avgRating: true,
    category: true,
} as const;

// Create a type from our select object
type BookExtendedSelect = Prisma.BookGetPayload<{
    select: typeof bookExtendedSelect
}>;

type BookSelect = Prisma.BookGetPayload<{
    select: typeof bookSelect
}>;

export class ClientBookService {
    static async getBooksWithCategories(): Promise<BookByCategory[]> {
        const booksByCat = await prisma.category.findMany({
            where: {
                books: {
                    some: {}
                }
            },
            include: {
                books: {
                    select: bookSelect
                }
            }
        });
        const otherBooks = await prisma.book.findMany({
            where: {
                categoryId: 0
            },
            select: bookSelect
        });
        booksByCat.push({
            id: 0,
            name: "",
            books: otherBooks
        });
        return booksByCat;
    }

    static async getAllBooks(substring: string = ""): Promise<Book[]> {
        return prisma.book.findMany({
            where: {
                OR: [
                    {
                        name: {
                            contains: substring
                        }
                    },
                    {
                        abstract: {
                            contains: substring
                        }
                    },
                    {
                        author: {
                            contains: substring
                        }
                    }
                ]
            },
            select: bookSelect
        });
    }

    static async getBookById(id: number): Promise<BookExtended | null> {
        const book = await prisma.book.findUnique({
            where: { id },
            select: bookExtendedSelect
        });

        if (!book) return null;

        const { category, ...bookData } = book;

        return {
            ...bookData,
            category: category.name,
        } satisfies BookExtended;
    }

    static async getBooklist(userId: number): Promise<Book[]> {
        return prisma.$transaction(async (tx) => {
            const user = await prisma.user.findUnique({
                where: { id: userId }
            });
            if (!user) {
                throw new BookServiceError(`User with id: ${userId} not found`);
            }

            const booklist = await prisma.booklistbookOnUser.findMany({
                where: {
                    userId
                },
                include: {
                    book: {
                        select: bookSelect
                    }
                }
            });
            return booklist.map(val => val.book);
        });
    }

    static async getRead(userId: number): Promise<Book[]> {
        return prisma.$transaction(async (tx) => {
            const user = await prisma.user.findUnique({
                where: { id: userId }
            });
            if (!user) {
                throw new BookServiceError(`User with id: ${userId} not found`);
            }

            const booklist = await prisma.readBooksOnUser.findMany({
                where: {
                    userId
                },
                include: {
                    book: {
                        select: bookSelect
                    }
                }
            });
            return booklist.map(val => val.book);
        });
    }

    static async updateBookRating(bookId: number, userId: number, rating: number) {
        if (rating < 0 || rating > 10) {
            throw new BookServiceError(`Rating can't be more than 10 or less than 0. Given: ${rating}`);
        }
        return prisma.$transaction(async (tx) => {
            const user = await prisma.user.findUnique({
                where: { id: userId }
            });
            if (!user) {
                throw new BookServiceError(`User with id: ${userId} not found`);
            }

            const book = await prisma.book.findUnique({
                where: { id: bookId }
            });
            if (!book) {
                throw new BookServiceError(`Book with id: ${bookId} not found`);
            }

            return prisma.ratings.upsert({
                where: {
                    userId_bookId: {
                        userId,
                        bookId
                    }
                },
                update: {
                    rating
                },
                create: {
                    userId,
                    bookId,
                    rating
                },
                select: {
                    userId: true,
                    bookId: true,
                    rating: true
                }
            });
        });
    }

    static async updateBooklist(bookId: number, userId: number): Promise<blUpdateRes> {
        return prisma.$transaction(async (tx) => {
            const user = await prisma.user.findUnique({
                where: { id: userId }
            });
            if (!user) {
                throw new BookServiceError(`User with id: ${userId} not found`);
            }

            const book = await prisma.book.findUnique({
                where: { id: bookId }
            });
            if (!book) {
                throw new BookServiceError(`Book with id: ${bookId} not found`);
            }

            const blRecord = await prisma.booklistbookOnUser.findUnique({
                where: {
                    userId_bookId: {
                        userId,
                        bookId
                    }
                }
            });
            if (!blRecord) {
                const result = await prisma.booklistbookOnUser.create({
                    data: {
                        book: {
                            connect: {
                                id: bookId,
                            },
                        },
                        user: {
                            connect: {
                                id: userId,
                            },
                        }
                    }
                });
                return {added: true, result} as blUpdateRes;
            }
            const result = await prisma.booklistbookOnUser.delete({
                where: {
                    userId_bookId: {
                        userId,
                        bookId
                    }
                }
            })
            return {added: false, result} as blUpdateRes;
        });
    }

    static async updateRead(bookId: number, userId: number): Promise<blUpdateRes> {
        return prisma.$transaction(async (tx) => {
            const user = await prisma.user.findUnique({
                where: { id: userId }
            });
            if (!user) {
                throw new BookServiceError(`User with id: ${userId} not found`);
            }

            const book = await prisma.book.findUnique({
                where: { id: bookId }
            });
            if (!book) {
                throw new BookServiceError(`Book with id: ${bookId} not found`);
            }

            const rdRecord = await prisma.readBooksOnUser.findUnique({
                where: {
                    userId_bookId: {
                        userId,
                        bookId
                    }
                }
            });
            if (!rdRecord) {
                const result = await prisma.readBooksOnUser.create({
                    data: {
                        book: {
                            connect: {
                                id: bookId,
                            },
                        },
                        user: {
                            connect: {
                                id: userId,
                            },
                        }
                    }
                });
                return {added: true, result} as blUpdateRes;
            }
            const result = await prisma.readBooksOnUser.delete({
                where: {
                    userId_bookId: {
                        userId,
                        bookId
                    }
                }
            })
            return {added: false, result} as blUpdateRes;
        });
    }
}