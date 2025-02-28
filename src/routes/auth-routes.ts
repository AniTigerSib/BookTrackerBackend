import { Router } from 'express';
import { AuthController } from '../controllers/auth-controller';
import { authenticateToken } from '../middleware/auth-middleware';

const router = Router();

router.post('/register', AuthController.register);
router.post('/login', AuthController.login);
router.post('/refresh', AuthController.refresh);
router.post('/logout', authenticateToken, AuthController.logout);

export default router;