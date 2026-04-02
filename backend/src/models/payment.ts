import pool from '../config/database';
import { Payment } from '../types';

export const createPayment = async (
  orderNo: string,
  userId: number,
  type: 'prompt' | 'membership',
  targetId: number,
  amount: number,
  expireMinutes: number = 30
): Promise<Payment> => {
  const result = await pool.query(
    `INSERT INTO payments (order_no, user_id, type, target_id, amount, expire_at)
     VALUES ($1, $2, $3, $4, $5, NOW() + INTERVAL '${expireMinutes} minutes')
     RETURNING *`,
    [orderNo, userId, type, targetId, amount]
  );
  return result.rows[0];
};

export const getPaymentByOrderNo = async (orderNo: string): Promise<Payment | null> => {
  const result = await pool.query('SELECT * FROM payments WHERE order_no = $1', [orderNo]);
  return result.rows[0] || null;
};

export const getPaymentById = async (id: number): Promise<Payment | null> => {
  const result = await pool.query('SELECT * FROM payments WHERE id = $1', [id]);
  return result.rows[0] || null;
};

export const updatePaymentStatus = async (
  orderNo: string,
  status: string,
  tradeNo?: string,
  paymentMethod?: string
): Promise<Payment | null> => {
  const fields: string[] = ['status = $2', 'updated_at = NOW()'];
  const values: any[] = [orderNo, status];
  let paramIndex = 3;

  if (tradeNo) {
    fields.push(`trade_no = $${paramIndex}`);
    values.push(tradeNo);
    paramIndex++;
  }

  if (paymentMethod) {
    fields.push(`payment_method = $${paramIndex}`);
    values.push(paymentMethod);
    paramIndex++;
  }

  if (status === 'paid') {
    fields.push(`paid_at = NOW()`);
  }

  const result = await pool.query(
    `UPDATE payments SET ${fields.join(', ')} WHERE order_no = $1 RETURNING *`,
    values
  );
  return result.rows[0] || null;
};

export const getUserPayments = async (
  userId: number,
  page: number = 1,
  limit: number = 20,
  type?: string
): Promise<{ payments: Payment[]; total: number }> => {
  const offset = (page - 1) * limit;
  let whereClause = 'WHERE user_id = $1';
  const values: any[] = [userId];

  if (type) {
    whereClause += ' AND type = $2';
    values.push(type);
  }

  const [result, countResult] = await Promise.all([
    pool.query(
      `SELECT * FROM payments ${whereClause} ORDER BY created_at DESC LIMIT $${values.length + 1} OFFSET $${values.length + 2}`,
      [...values, limit, offset]
    ),
    pool.query(
      `SELECT COUNT(*) as total FROM payments ${whereClause}`,
      values
    ),
  ]);
  return {
    payments: result.rows,
    total: parseInt(countResult.rows[0].total),
  };
};

/**
 * 检查用户是否已购买指定提示词
 * @param userId 用户ID
 * @param promptId 提示词ID
 * @returns 是否已购买
 */
export const hasUserPurchasedPrompt = async (
  userId: number,
  promptId: number
): Promise<boolean> => {
  const result = await pool.query(
    `SELECT 1 FROM payments 
     WHERE user_id = $1 
       AND type = 'prompt' 
       AND target_id = $2 
       AND status = 'paid'
     LIMIT 1`,
    [userId, promptId]
  );
  return result.rows.length > 0;
};

/**
 * 清理过期订单（定时任务调用）
 */
export const expireOverduePayments = async (): Promise<number> => {
  const result = await pool.query(
    `UPDATE payments SET status = 'expired'
     WHERE status = 'pending' AND expire_at < NOW()`
  );
  return result.rowCount || 0;
};

/**
 * 生成订单号
 */
export const generateOrderNo = (): string => {
  const now = new Date();
  const timestamp = now.getFullYear().toString() +
    String(now.getMonth() + 1).padStart(2, '0') +
    String(now.getDate()).padStart(2, '0') +
    String(now.getHours()).padStart(2, '0') +
    String(now.getMinutes()).padStart(2, '0') +
    String(now.getSeconds()).padStart(2, '0');
  const random = Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
  return `FG${timestamp}${random}`;
};
