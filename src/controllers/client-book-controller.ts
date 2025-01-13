import { Request, Response, NextFunction } from 'express';
import {ClientBookService} from "../services/client-book-service";
import { StatusCodes, ReasonPhrases } from 'http-status-codes'
import {Book, BookServiceError} from "../types";
import {QuerySanitizer} from "../utils/query-sanitizer";

export class ClientBookController {
    static async getBooksMain(req: Request, res: Response, next: NextFunction) {
        try {
            const booksByCat = await ClientBookService.getBooksWithCategories();
            const now = new Date();
            console.log(`[${now.toLocaleTimeString()}] User ${req.user?.id} get list of books.`);
            res.status(StatusCodes.OK).json(booksByCat);
        } catch (error) {
            if (error instanceof BookServiceError) {
                res.status(StatusCodes.BAD_REQUEST).json({ error: error.message });
            } else {
                next(error);
            }
        }
    }

    static async searchBooks(req: Request, res: Response, next: NextFunction) {
        try {
            const search = QuerySanitizer.sanitizeString(req.query.search, {
                trim: true,
                removeSpecialChars: true,
                maxLength: 100
            });

            const booksFound = await ClientBookService.getAllBooks(search);
            const now = new Date();
            console.log(`[${now.toLocaleTimeString()}] User ${req.user?.id} get list of books with query: ${search}.`);
            res.status(StatusCodes.OK).json(booksFound);
        } catch (error) {
            next(error);
        }
    }

    static async getBookById(req: Request, res: Response, next: NextFunction) {
        try {
            const bookId = QuerySanitizer.sanitizeNumber(req.params.id, 1);
            if (bookId === undefined) {
                res.status(StatusCodes.BAD_REQUEST).json({ error: `Incorrect book id.` });
            } else {
                const bookFound = await ClientBookService.getBookById(bookId);
                const now = new Date();
                console.log(`[${now.toLocaleTimeString()}] User ${req.user?.id} get book with id: ${bookId}.`);
                if (bookId !== null) {
                    res.status(StatusCodes.OK).json(bookFound);
                } else {
                    res.status(StatusCodes.NOT_FOUND).json({})
                }
            }
        } catch (error) {
            next(error);
        }
    }

    static async getBooklist(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = req.user?.id;
            if (userId !== undefined) {
                const books = await ClientBookService.getBooklist(userId);
                const now = new Date();
                console.log(`[${now.toLocaleTimeString()}] User ${req.user?.id} get booklist.`);
                res.status(StatusCodes.OK).json(books);
            } else {
                next(new Error(`Can't get userId`));
            }
        } catch (error) {
            if (error instanceof BookServiceError) {
                res.status(StatusCodes.BAD_REQUEST).json({ error: error.message });
            } else {
                next(error);
            }
        }
    }

    static async getRead(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = req.user?.id;
            if (userId !== undefined) {
                const books = await ClientBookService.getRead(userId);
                const now = new Date();
                console.log(`[${now.toLocaleTimeString()}] User ${req.user?.id} get read books list.`);
                res.status(StatusCodes.OK).json(books);
            } else {
                next(new Error(`Can't get userId`));
            }
        } catch (error) {
            if (error instanceof BookServiceError) {
                res.status(StatusCodes.BAD_REQUEST).json({ error: error.message });
            } else {
                next(error);
            }
        }
    }

    static async rateBook(req: Request, res: Response, next: NextFunction) {
        try {
            const bookId = QuerySanitizer.sanitizeNumber(req.params.id, 1);
            const rating = QuerySanitizer.sanitizeNumber(req.query.rating);
            const userId = req.user?.id;
            if (bookId === undefined || rating === undefined) {
                res.status(StatusCodes.BAD_REQUEST).json({ error: `Incorrect book id or rating value.` });
            } else if (userId !== undefined) {
                const updatedRating = ClientBookService.updateBookRating(bookId, userId, rating);
                const now = new Date();
                console.log(`[${now.toLocaleTimeString()}] User ${userId} set rating ${rating} to book with id: ${bookId}.`);
                res.status(StatusCodes.CREATED).json(updatedRating);
            } else {
                next(new Error(`Can't get userId`));
            }
        } catch (error) {
            if (error instanceof BookServiceError) {
                res.status(StatusCodes.BAD_REQUEST).json({ error: error.message });
            } else {
                next(error);
            }
        }
    }

    static async booklistBook(req: Request, res: Response, next: NextFunction) {
        try {
            const bookId = QuerySanitizer.sanitizeNumber(req.params.id, 1);
            const userId = req.user?.id;
            if (bookId === undefined) {
                res.status(StatusCodes.BAD_REQUEST).json({ error: `Incorrect book id.` });
            } else if (userId !== undefined) {
                const blUpdated = ClientBookService.updateBooklist(bookId, userId);
                const now = new Date();
                console.log(`[${now.toLocaleTimeString()}] User ${userId} updated booklist with book with id: ${bookId}.`);
                res.status(StatusCodes.OK).json(blUpdated);
            } else {
                next(new Error(`Can't get userId`));
            }
        } catch (error) {
            if (error instanceof BookServiceError) {
                res.status(StatusCodes.BAD_REQUEST).json({ error: error.message });
            } else {
                next(error);
            }
        }
    }

    static async readBook(req: Request, res: Response, next: NextFunction) {
        try {
            const bookId = QuerySanitizer.sanitizeNumber(req.params.id, 1);
            const userId = req.user?.id;
            if (bookId === undefined) {
                res.status(StatusCodes.BAD_REQUEST).json({ error: `Incorrect book id.` });
            } else if (userId !== undefined) {
                const readUpdated = ClientBookService.updateRead(bookId, userId);
                const now = new Date();
                console.log(`[${now.toLocaleTimeString()}] User ${userId} updated read books with book with id: ${bookId}.`);
                res.status(StatusCodes.OK).json(readUpdated);
            } else {
                next(new Error(`Can't get userId`));
            }
        } catch (error) {
            if (error instanceof BookServiceError) {
                res.status(StatusCodes.BAD_REQUEST).json({ error: error.message });
            } else {
                next(error);
            }
        }
    }
}