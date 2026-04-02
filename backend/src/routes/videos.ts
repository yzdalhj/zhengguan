import { Router } from 'express';
import { getVideos, getVideoById, getSuggestions, generateAIPrompt } from '../controllers/videos';
import { authenticate } from '../middleware/auth';
import { userRateLimit } from '../middleware/rateLimit';
import { requireVip } from '../middleware/access';

const router = Router();

router.get('/', authenticate, userRateLimit, getVideos);
router.get('/:id', authenticate, userRateLimit, getVideoById);
router.get('/:id/ai-prompt', authenticate, requireVip, userRateLimit, generateAIPrompt);
router.get('/search/suggest', authenticate, userRateLimit, getSuggestions);

export default router;
