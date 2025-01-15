import { Router } from 'express';
import {ClientBookController} from "../controllers/client-book-controller";
import { authenticateToken } from '../middleware/auth-middleware';

const router = Router();

router.get('/books', authenticateToken, ClientBookController.getBooksMain);
router.get('/books/search', authenticateToken, ClientBookController.searchBooks);
router.get('/books/:id', authenticateToken, ClientBookController.getBookById);
router.get('/booklist', authenticateToken, ClientBookController.getBooklist);
router.post('/booklist', authenticateToken, ClientBookController.booklistBook);
router.get('/books/read', authenticateToken, ClientBookController.getRead);
router.post('/books/read', authenticateToken, ClientBookController.readBook);
router.post('/books/:id/rate', authenticateToken, ClientBookController.rateBook);

export default router;