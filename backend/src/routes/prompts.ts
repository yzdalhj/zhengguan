import { Router } from 'express';
import {
  getPrompts,
  getPromptById,
  getRelatedPrompts,
  getRatings,
  createRating,
  toggleFavorite,
  copyPrompt,
  getUserFavorites,
  getPromptFilterOptions,
} from '../controllers/prompt';
import { authenticate, requireUser, AuthRequest } from '../middleware/auth';
import { userRateLimit } from '../middleware/rateLimit';

const router = Router();

// 公开/可选认证路由
router.get('/', authenticate, userRateLimit, getPrompts);
router.get('/filters', authenticate, userRateLimit, getPromptFilterOptions);
router.get('/:id', authenticate, userRateLimit, getPromptById);
router.get('/:id/related', authenticate, userRateLimit, getRelatedPrompts);
router.get('/:id/ratings', authenticate, userRateLimit, getRatings);

// 必须认证路由
router.post('/:id/rate', requireUser, userRateLimit, createRating);
router.post('/:id/favorite', requireUser, userRateLimit, toggleFavorite);
router.get('/:id/copy', requireUser, userRateLimit, copyPrompt);
router.get('/user/favorites', requireUser, userRateLimit, getUserFavorites);

export default router;
