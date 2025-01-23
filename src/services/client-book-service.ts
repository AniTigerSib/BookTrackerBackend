import { PrismaClient } from '@prisma/client';
import { Prisma } from '@prisma/client'
import {blUpdateRes, Book, BookByCategory, BookExtended, BookServiceError} from "../types";

const prisma = new PrismaClient();

// Transform the data to match the Book interface
const transformBooks = (books: any[], userId: number | null = null): Book[] => {
    return books.map(book => ({
        id: book.id,
        name: book.name,
        cover: book.cover,
        avgRating: book.avgRating,
        isRead: userId ? book.ReadBooksOnUser.length > 0 : false
    }));
};

export class ClientBookService {
    static async getBooksWithCategories(userId: number | null = null): Promise<BookByCategory[]> {
        const booksByCat = await prisma.category.findMany({
            where: {
                books: {
                    some: {}
                }
            },
            include: {
                books: {
                    select: {
                        id: true,
                        name: true,
                        cover: true,
                        avgRating: true,
                        ReadBooksOnUser: userId ? {
                            where: {
                                userId: userId
                            }
                        } : false,
                    }
                }
            }
        });
        const otherBooks = await prisma.book.findMany({
            where: {
                categoryId: 0
            },
            select: {
                id: true,
                name: true,
                cover: true,
                avgRating: true,
                ReadBooksOnUser: userId ? {
                    where: {
                        userId: userId
                    }
                } : false,
            }
        });

        // Transform and combine the results
        const result = booksByCat.map(category => ({
            id: category.id,
            name: category.name,
            books: transformBooks(category.books, userId)
        }));

        if (otherBooks.length) {
            result.push({
                id: 0,
                name: "Без категории",
                books: transformBooks(otherBooks, userId)
            });
        }
        return result;
    }

    static async getAllBooks(substring: string = "", userId: number | null = null): Promise<Book[]> {
        const books = await prisma.book.findMany({
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
            select: {
                id: true,
                name: true,
                cover: true,
                avgRating: true,
                ReadBooksOnUser: userId ? {
                    where: {
                        userId: userId
                    }
                } : false,
            }
        });
        return transformBooks(books, userId);
    }

    static async getBookById(id: number, userId: number): Promise<BookExtended | null> {
        const book = await prisma.book.findUnique({
            where: { id },
            select: {
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
                ReadBooksOnUser: userId ? {
                    where: {
                        userId: userId
                    }
                } : false,
                BooklistbookOnUser: userId ? {
                    where: {
                        userId: userId
                    }
                } : false
            }
        });

        if (!book) return null;

        const { category, ReadBooksOnUser, BooklistbookOnUser, ...bookData } = book;

        return {
            ...bookData,
            category: category.name,
            isRead: userId ? ReadBooksOnUser.length > 0 : false,
            isInBooklist: userId ? BooklistbookOnUser.length > 0 : false
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
                        select: {
                            id: true,
                            name: true,
                            cover: true,
                            avgRating: true,
                            ReadBooksOnUser: userId ? {
                                where: {
                                    userId: userId
                                }
                            } : false,
                        }
                    }
                }
            });
            return transformBooks(booklist.map(val => val.book), userId);
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
                        select: {
                            id: true,
                            name: true,
                            cover: true,
                            avgRating: true,
                            ReadBooksOnUser: userId ? {
                                where: {
                                    userId: userId
                                }
                            } : false,
                        }
                    }
                }
            });
            return transformBooks(booklist.map(val => val.book), userId);
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
                await prisma.booklistbookOnUser.create({
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
            } else {
                await prisma.booklistbookOnUser.delete({
                    where: {
                        userId_bookId: {
                            userId,
                            bookId
                        }
                    }
                });
            }
            return this.getBookById(bookId, userId);
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
                await prisma.readBooksOnUser.create({
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
            } else {
                await prisma.readBooksOnUser.delete({
                    where: {
                        userId_bookId: {
                            userId,
                            bookId
                        }
                    }
                });
            }
            return this.getBookById(bookId, userId);
        });
    }
}