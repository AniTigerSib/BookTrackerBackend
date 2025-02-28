import { Request, Response, NextFunction } from 'express';
import {ClientBookService} from "../services/client-book-service";
import { StatusCodes } from 'http-status-codes'
import {BookServiceError} from "../types";
import {QuerySanitizer} from "../utils/query-sanitizer";

export class ClientBookController {
    static async getBooksMain(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = req.user?.id;
            if (userId == undefined) {
                next(new Error(`Can't get userId`));
            } else {
                const booksByCat = await ClientBookService.getBooksWithCategories(userId);
                const now = new Date();
                console.log(`[${now.toLocaleTimeString()}] User ${req.user?.id} get list of books.`);
                res.status(StatusCodes.OK).json(booksByCat);
            }
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
            const search = QuerySanitizer.sanitizeString(req.query.q, {
                trim: true,
                removeSpecialChars: true,
                maxLength: 100
            });
            const userId = req.user?.id;
            if (userId == undefined) {
                next(new Error(`Can't get userId`));
            } else {
                const booksFound = await ClientBookService.getAllBooks(search, userId);
                const now = new Date();
                console.log(`[${now.toLocaleTimeString()}] User ${req.user?.id} get list of books with query: ${search}.`);
                res.status(StatusCodes.OK).json(booksFound);
            }
        } catch (error) {
            next(error);
        }
    }

    static async getBookById(req: Request, res: Response, next: NextFunction) {
        try {
            const bookId = QuerySanitizer.sanitizeNumber(req.params.id, 1);
            const userId = req.user?.id;
            if (userId == undefined) {
                next(new Error(`Can't get userId`));
            } else if (bookId === undefined) {
                res.status(StatusCodes.BAD_REQUEST).json({ error: `Incorrect book id.` });
            } else {
                const bookFound = await ClientBookService.getBookById(bookId, userId);
                const now = new Date();
                console.log(`[${now.toLocaleTimeString()}] User ${req.user?.id} get book with id: ${bookId}.`);
                if (bookFound !== null) {
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
            const rating = QuerySanitizer.sanitizeNumber(req.body.rating);
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
                const book = await ClientBookService.updateBooklist(bookId, userId);
                const now = new Date();
                console.log(`[${now.toLocaleTimeString()}] User ${userId} updated booklist with book with id: ${bookId}.`);
                res.status(StatusCodes.OK).json(book);
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
                const book = await ClientBookService.updateRead(bookId, userId);
                const now = new Date();
                console.log(`[${now.toLocaleTimeString()}] User ${userId} updated read books with book with id: ${bookId}.`);
                res.status(StatusCodes.OK).json(book);
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