import { Router } from 'express';
import { getCollections, addCollection, removeCollection, exportCollections, reportVideo } from '../controllers/user';
import { authenticate, requireAdmin } from '../middleware/auth';
import { userRateLimit } from '../middleware/rateLimit';

const router = Router();

router.get('/collections', authenticate, getCollections);
router.post('/collections/:videoId', authenticate, userRateLimit, addCollection);
router.delete('/collections/:videoId', authenticate, userRateLimit, removeCollection);
router.get('/collections/export', authenticate, exportCollections);
router.post('/reports', authenticate, userRateLimit, reportVideo);

export default router;
