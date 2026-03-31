import { Router } from 'express';
import {
  getCollections,
  addCollection,
  removeCollection,
  exportCollections,
  reportVideo,
  checkCollection,
  getWatchHistory,
  addWatchHistory,
  syncWatchHistory,
  removeWatchHistory,
  clearWatchHistory,
} from '../controllers/user';
import { authenticate } from '../middleware/auth';
import { userRateLimit } from '../middleware/rateLimit';

const router = Router();

router.get('/collections', authenticate, getCollections);
router.get('/collections/check/:videoId', authenticate, checkCollection);
router.post('/collections/:videoId', authenticate, userRateLimit, addCollection);
router.delete('/collections/:videoId', authenticate, userRateLimit, removeCollection);
router.get('/collections/export', authenticate, exportCollections);
router.post('/reports', authenticate, userRateLimit, reportVideo);

// 观看历史相关路由
router.get('/history', authenticate, getWatchHistory);
router.post('/history', authenticate, userRateLimit, addWatchHistory);
router.post('/history/sync', authenticate, userRateLimit, syncWatchHistory);
router.delete('/history/:videoId', authenticate, userRateLimit, removeWatchHistory);
router.delete('/history', authenticate, userRateLimit, clearWatchHistory);

export default router;
