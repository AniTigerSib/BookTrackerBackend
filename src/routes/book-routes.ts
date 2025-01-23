import { Router } from 'express';
import {ClientBookController} from "../controllers/client-book-controller";
import { authenticateToken } from '../middleware/auth-middleware';

const router = Router();

router.get('/books', authenticateToken, ClientBookController.getBooksMain);
router.get('/books/search', authenticateToken, ClientBookController.searchBooks);
router.get('/books/by-id/:id', authenticateToken, ClientBookController.getBookById);
router.get('/booklist', authenticateToken, ClientBookController.getBooklist);
router.post('/booklist/:id', authenticateToken, ClientBookController.booklistBook);
router.get('/books/read', authenticateToken, ClientBookController.getRead);
router.post('/books/read/:id', authenticateToken, ClientBookController.readBook);
router.post('/books/by-id/:id/rate', authenticateToken, ClientBookController.rateBook);

export default router;