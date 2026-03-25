import { Router } from 'express';
import { getTags, getCategories } from '../controllers/tags';
import { userRateLimit } from '../middleware/rateLimit';

const router = Router();

router.get('/', userRateLimit, getTags);
router.get('/categories', userRateLimit, getCategories);

export default router;
