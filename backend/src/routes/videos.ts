import { Router } from 'express';
import { getVideos, getVideoById, getSuggestions } from '../controllers/videos';
import { userRateLimit } from '../middleware/rateLimit';

const router = Router();

router.get('/', userRateLimit, getVideos);
router.get('/:id', userRateLimit, getVideoById);
router.get('/search/suggest', userRateLimit, getSuggestions);

export default router;
