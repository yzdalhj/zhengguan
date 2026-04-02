import { Router } from 'express';
import {
  getMembershipStatus,
  getBenefits,
  getMembershipHistory,
} from '../controllers/membership';
import { requireUser } from '../middleware/auth';
import { userRateLimit } from '../middleware/rateLimit';

const router = Router();

// 需要认证
router.get('/status', requireUser, userRateLimit, getMembershipStatus);
router.get('/history', requireUser, userRateLimit, getMembershipHistory);

// 公开
router.get('/benefits', userRateLimit, getBenefits);

export default router;
