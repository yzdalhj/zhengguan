import { Router } from 'express';
import { getTags, getCategories } from '../controllers/tags';
import { authenticate } from '../middleware/auth';
import { userRateLimit } from '../middleware/rateLimit';

const router = Router();

router.get('/', authenticate, userRateLimit, getTags);
router.get('/categories', authenticate, userRateLimit, getCategories);

export default router;
