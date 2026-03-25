import { Router } from 'express';
import { register, login, getMe, updatePassword } from '../controllers/auth';
import { authenticate } from '../middleware/auth';
import { userRateLimit } from '../middleware/rateLimit';

const router = Router();

router.post('/register', userRateLimit, register);
router.post('/login', userRateLimit, login);
router.get('/me', authenticate, getMe);
router.put('/password', authenticate, updatePassword);

export default router;
