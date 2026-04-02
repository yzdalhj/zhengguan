import { Router } from 'express';
import {
  createOrder,
  wechatNotify,
  alipayNotify,
  getPaymentStatus,
  getPaymentHistory,
} from '../controllers/payment';
import { requireUser } from '../middleware/auth';
import { userRateLimit } from '../middleware/rateLimit';

const router = Router();

// 需要认证的路由
router.post('/create', requireUser, userRateLimit, createOrder);
router.get('/:orderNo', requireUser, userRateLimit, getPaymentStatus);
router.get('/history/list', requireUser, userRateLimit, getPaymentHistory);

// 支付回调（不需要用户认证，由支付平台调用）
router.post('/wechat/notify', wechatNotify);
router.post('/alipay/notify', alipayNotify);

export default router;
