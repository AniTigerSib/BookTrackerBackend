import { Router } from 'express';
import {ClientBookController} from "../controllers/client-book-controller";
import { authenticateToken } from '../middleware/auth-middleware';

const router = Router();

router.get('/books', authenticateToken, ClientBookController.getBooksMain);
router.get('/books/search', authenticateToken, ClientBookController.searchBooks);
router.get('/books/:id', authenticateToken, ClientBookController.getBookById);
router.get('/books/booklist', authenticateToken, ClientBookController.getBooklist);
router.get('/books/read', authenticateToken, ClientBookController.getRead);
router.put('/books/rate/:id', authenticateToken, ClientBookController.rateBook);
router.post('/books/booklist/:id', authenticateToken, ClientBookController.booklistBook);
router.post('/books/read/:id', authenticateToken, ClientBookController.readBook);

export default router;