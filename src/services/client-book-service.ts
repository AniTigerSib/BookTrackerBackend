import { PrismaClient } from '@prisma/client';
import { Prisma } from '@prisma/client'
import {blUpdateRes, BookByCategory, BookExtended, BookServiceError} from "../types";

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
    CategoriesOnBook: {
        select: {
            categoryId: true,
        },
    },
} as const;

// Create a type from our select object
type BookExtendedSelect = Prisma.BookGetPayload<{
    select: typeof bookExtendedSelect
}>;

type BookSelect = Prisma.BookGetPayload<{
    select: typeof bookSelect
}>;

export class ClientBookService {
    static async getAllBooks(): Promise<BookByCategory[]> {
        const res = await prisma.category.findMany({
            where: {
                CategoriesOnBook: {
                    some: {}
                }
            },
            include: {
                CategoriesOnBook: {
                    select: {
                        book: {
                            select: bookSelect,
                        }
                    }
                }
            }
        });

        if (!res) return [];

        let booksByCategory: BookByCategory[] = [];

        for (const cat of res) {
            const { CategoriesOnBook, ...categoryData } = cat;
            booksByCategory.push({
                ...categoryData,
                books: CategoriesOnBook.map(c => c.book)
            });
        }

        return booksByCategory;
    }

    static async getBookById(id: number): Promise<BookExtended | null> {
        const book = await prisma.book.findUnique({
            where: { id },
            select: bookExtendedSelect,
        });

        if (!book) return null;

        const { CategoriesOnBook, ...bookData } = book;

        return {
            ...bookData,
            category: CategoriesOnBook.map(c => c.categoryId),
        } satisfies BookExtended;
    }

    static async updateBooklist(bookId: number, userId: number) {
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

    static async updateRead(bookId: number, userId: number) {
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