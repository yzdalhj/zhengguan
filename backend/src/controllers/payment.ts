import { Request, Response, NextFunction } from 'express';
import * as PaymentModel from '../models/payment';
import * as MembershipModel from '../models/membership';
import * as PromptModel from '../models/prompt';
import { AppError } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth';
import { createNativeOrder, verifyNotifySignature, decryptNotification } from '../services/wechatPay';
import { createPrecreateOrder, verifyCallback } from '../services/alipay';
import { ApiResponse, Payment, Membership } from '../types';

/**
 * 会员类型映射：字符串 key -> 数值 ID（用于数据库存储）
 */
const MEMBERSHIP_TARGET_MAP: Record<string, number> = {
  vip: 1,
  svip: 2,
};

/**
 * 反向映射：数值 ID -> 字符串 key（用于查询会员方案）
 */
const MEMBERSHIP_TARGET_REVERSE_MAP: Record<number, string> = {
  1: 'vip',
  2: 'svip',
};

/**
 * 创建支付订单
 * body: { type: 'prompt'|'membership', target_id: number, payment_method: 'wechat'|'alipay', plan?: 'monthly'|'yearly' }
 */
export const createOrder = async (
  req: AuthRequest,
  res: Response<ApiResponse<any>>,
  next: NextFunction
) => {
  try {
    if (!req.user) return next(new AppError('Authentication required', 401));

    const { type, target_id, payment_method, plan } = req.body;

    if (!type || !target_id || !payment_method) {
      return next(new AppError('缺少必要参数：type, target_id, payment_method', 400));
    }

    if (!['wechat', 'alipay'].includes(payment_method)) {
      return next(new AppError('不支持的支付方式', 400));
    }

    let amount = 0;
    let description = '';

    if (type === 'prompt') {
      // 购买单条提示词
      const prompt = await PromptModel.getPromptById(target_id);
      if (!prompt || prompt.status !== 'approved') {
        return next(new AppError('提示词不存在', 404));
      }
      if (prompt.required_level === 'free') {
        return next(new AppError('该提示词免费，无需购买', 400));
      }
      amount = prompt.price;
      description = `购买提示词：${prompt.title}`;
    } else if (type === 'membership') {
      // 开通会员
      const planType = plan || 'monthly';
      // 将字符串 target_id 转换为数值 ID 用于存储
      const numericTargetId = MEMBERSHIP_TARGET_MAP[target_id as string] || parseInt(target_id as string);
      if (!numericTargetId) {
        return next(new AppError('无效的会员方案', 400));
      }
      // 反向映射回字符串 key 以查找会员方案
      const planKey = MEMBERSHIP_TARGET_REVERSE_MAP[numericTargetId] as keyof typeof MembershipModel.MEMBERSHIP_PLANS;
      const membershipPlan = MembershipModel.MEMBERSHIP_PLANS[planKey];
      if (!membershipPlan) {
        return next(new AppError('无效的会员方案', 400));
      }
      const planConfig = planType === 'yearly' ? membershipPlan.yearly : membershipPlan.monthly;
      amount = planConfig.price;
      description = planConfig.label;
    } else {
      return next(new AppError('无效的订单类型', 400));
    }

    const orderNo = PaymentModel.generateOrderNo();
    // 会员类型使用数值 ID 存储
    const finalTargetId = type === 'membership' 
      ? (MEMBERSHIP_TARGET_MAP[target_id as string] || parseInt(target_id as string))
      : target_id;
    const payment = await PaymentModel.createPayment(
      orderNo,
      req.user.id,
      type,
      finalTargetId,
      amount,
      30 // 30分钟过期
    );

    // 调用支付服务获取支付二维码
    let paymentUrl = '';
    if (payment_method === 'wechat') {
      const result = await createNativeOrder(orderNo, amount, description);
      if (result.error) return next(new AppError(result.error, 500));
      paymentUrl = result.code_url || '';
    } else {
      const result = await createPrecreateOrder(orderNo, amount, description);
      if (result.error) return next(new AppError(result.error, 500));
      paymentUrl = result.qr_code || '';
    }

    res.json({
      success: true,
      data: {
        order_no: orderNo,
        amount,
        payment_method,
        payment_url: paymentUrl,
        expire_at: payment.expire_at,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 微信支付回调
 */
export const wechatNotify = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { signature, timestamp, nonce } = req.headers;
    const body = req.body;

    // 验证签名
    const verified = verifyNotifySignature(
      signature as string,
      timestamp as string,
      nonce as string,
      JSON.stringify(body)
    );

    if (!verified) {
      return res.status(401).json({ code: 'FAIL', message: '签名验证失败' });
    }

    // 解密通知数据
    const data = decryptNotification(body.resource);
    const { out_trade_no, trade_state, transaction_id } = data;

    if (trade_state !== 'SUCCESS') {
      return res.json({ code: 'SUCCESS', message: '处理完成' });
    }

    // 更新订单状态
    const payment = await PaymentModel.updatePaymentStatus(
      out_trade_no,
      'paid',
      transaction_id,
      'wechat'
    );

    if (payment) {
      await handlePaymentSuccess(payment);
    }

    res.json({ code: 'SUCCESS', message: '处理完成' });
  } catch (error) {
    console.error('[WechatPay] Notify error:', error);
    res.status(500).json({ code: 'FAIL', message: 'Internal error' });
  }
};

/**
 * 支付宝回调
 */
export const alipayNotify = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const params = req.body as Record<string, string>;

    // 验证签名
    const verified = verifyCallback(params);
    if (!verified) {
      return res.status(401).send('FAIL');
    }

    const outTradeNo = params.out_trade_no;
    const tradeStatus = params.trade_status;
    const tradeNo = params.trade_no;

    if (tradeStatus !== 'TRADE_SUCCESS' && tradeStatus !== 'TRADE_FINISHED') {
      return res.send('success');
    }

    // 更新订单状态
    const payment = await PaymentModel.updatePaymentStatus(
      outTradeNo,
      'paid',
      tradeNo,
      'alipay'
    );

    if (payment) {
      await handlePaymentSuccess(payment);
    }

    res.send('success');
  } catch (error) {
    console.error('[Alipay] Notify error:', error);
    res.status(500).send('FAIL');
  }
};

/**
 * 查询支付状态
 */
export const getPaymentStatus = async (
  req: AuthRequest,
  res: Response<ApiResponse<Payment>>,
  next: NextFunction
) => {
  try {
    if (!req.user) return next(new AppError('Authentication required', 401));

    const { orderNo } = req.params;
    const payment = await PaymentModel.getPaymentByOrderNo(orderNo);

    if (!payment || payment.user_id !== req.user.id) {
      return next(new AppError('订单不存在', 404));
    }

    res.json({ success: true, data: payment });
  } catch (error) {
    next(error);
  }
};

/**
 * 获取支付历史
 */
export const getPaymentHistory = async (
  req: AuthRequest,
  res: Response<ApiResponse<Payment[]>>,
  next: NextFunction
) => {
  try {
    if (!req.user) return next(new AppError('Authentication required', 401));

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const type = req.query.type as string;

    const { payments, total } = await PaymentModel.getUserPayments(req.user.id, page, limit, type);
    const totalPages = Math.ceil(total / limit);

    res.json({
      success: true,
      data: payments,
      pagination: { page, limit, total, totalPages },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 支付成功后的业务处理
 */
async function handlePaymentSuccess(payment: Payment) {
  const { type, target_id, user_id, id: paymentId, amount } = payment;

  if (type === 'membership' && target_id) {
    // 将数值 ID 反向映射回字符串 key 以查找会员方案
    const planKey = MEMBERSHIP_TARGET_REVERSE_MAP[target_id as number] as keyof typeof MembershipModel.MEMBERSHIP_PLANS;
    const plan = MembershipModel.MEMBERSHIP_PLANS[planKey];
    if (!plan) return;

    // 根据支付金额判断是月度还是年度方案
    // VIP: 月度29元，年度249元；SVIP: 月度59元，年度499元
    const isYearly = amount >= plan.yearly.price - 10; // 允许10元误差（优惠等）
    const planConfig = isYearly ? plan.yearly : plan.monthly;

    const startDate = new Date();
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + planConfig.duration);

    // 检查是否已有未过期会员，如有则续期
    const existing = await MembershipModel.getActiveMembership(user_id);
    if (existing) {
      // 续期：记录本次续期的起止时间
      const renewStartDate = new Date(Math.max(existing.end_date.getTime(), startDate.getTime()));
      const newEnd = new Date(renewStartDate);
      newEnd.setDate(newEnd.getDate() + planConfig.duration);
      await MembershipModel.activateUserMembership(user_id, planConfig.level, newEnd);
      await MembershipModel.createMembership(user_id, planConfig.level, renewStartDate, newEnd, false, paymentId);
    } else {
      await MembershipModel.activateUserMembership(user_id, planConfig.level, endDate);
      await MembershipModel.createMembership(user_id, planConfig.level, startDate, endDate, false, paymentId);
    }
  }
  // prompt 类型的支付暂不需要额外处理，前端根据订单状态放行
}
