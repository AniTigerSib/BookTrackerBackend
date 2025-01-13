import {PrismaClient} from "@prisma/client";
import { Prisma } from '@prisma/client'
import {Book, BookExtended, BookServiceError, BookUpdatable, Category} from "../types";

const prisma = new PrismaClient();

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

export class AdminBookService {
    static async createCategory(name: string): Promise<Category> {
        return prisma.category.create({
            data: {
                name
            }
        });
    }

    static async changeCategory(cat: Category): Promise<Category> {
        return prisma.category.update({
            where: {
                id: cat.id
            },
            data: {
                name: cat.name
            }
        });
    }

    static async deleteCategory(id: number): Promise<Category> {
        return prisma.$transaction(async (px) => {
            const catFound = await prisma.category.findUnique({
                where: {
                    id
                }
            });
            if (!catFound) {
                throw new BookServiceError(`Category with id ${id} not found`);
            }
            return prisma.category.delete({
                where: {
                    id
                }
            });
        });
    }

    static async getCategories(): Promise<Array<Category>> {
        return prisma.category.findMany();
    }

    static async createBook(content: BookUpdatable): Promise<BookExtended> {
        return prisma.$transaction(async (px) => {
            const catFound = await prisma.category.findFirst({
                where: {
                    id: content.category,
                },
                select: {
                    id: true,
                    name: true,
                }
            });
            if (!catFound) {
                throw new BookServiceError(`Category with name ${content.category} not found`);
            }

            const bookCreated = await prisma.book.create({
                data: {
                    name: content.name,
                    cover: content.cover,
                    author: content.author,
                    language: content.language,
                    year: content.year,
                    originalName: content.originalName,
                    pages: content.pages,
                    abstract: content.abstract,
                    category: {
                        connect: {
                            id: catFound.id,
                        }
                    }
                },
                select: bookExtendedSelect
            });
            const {category, ...bookCreatedInner} = bookCreated;
            return {
                ...bookCreatedInner,
                category: category.name
            } satisfies BookExtended;
        });
    }

    static async updateBook(content: BookUpdatable, bookId: number): Promise<BookExtended> {
        return prisma.$transaction(async (px) => {
            const bookFound = await prisma.book.findUnique({
                where: {
                    id: bookId,
                }
            });
            if (!bookFound) {
                throw new BookServiceError(`Book with id ${bookId} not found`);
            }

            const catFound = await prisma.category.findFirst({
                where: {
                    id: content.category,
                },
                select: {
                    id: true,
                    name: true,
                }
            });
            if (!catFound) {
                throw new BookServiceError(`Category with name ${content.category} not found`);
            }

            const bookUpdated = await prisma.book.update({
                where: {
                    id: bookId,
                },
                data: {
                    name: content.name,
                    cover: content.cover,
                    author: content.author,
                    language: content.language,
                    year: content.year,
                    originalName: content.originalName,
                    pages: content.pages,
                    abstract: content.abstract,
                    category: {
                        connect: {
                            id: catFound.id,
                        }
                    }
                },
                select: bookExtendedSelect
            });
            const {category, ...bookUpdatedInner} = bookUpdated;
            return {
                ...bookUpdatedInner,
                category: category.name
            } satisfies BookExtended;
        });
    }

    static async deleteBook(id: number) {
        return prisma.$transaction(async (px) => {
            const bookFound = await prisma.book.findUnique({
                where: {
                    id
                }
            });
            if (!bookFound) {
                throw new BookServiceError(`book with id ${id} not found`);
            }
            return prisma.book.delete({
                where: {
                    id
                }
            });
        });
    }
}