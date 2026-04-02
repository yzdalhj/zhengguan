import crypto from 'crypto';
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

/**
 * 支付宝支付服务（当面付 - PC端扫码支付）
 * 
 * 需要配置环境变量：
 * - ALIPAY_APP_ID: 应用APPID
 * - ALIPAY_PRIVATE_KEY: 应用私钥
 * - ALIPAY_PUBLIC_KEY: 支付宝公钥
 */
const APP_ID = process.env.ALIPAY_APP_ID || '';
const PRIVATE_KEY = process.env.ALIPAY_PRIVATE_KEY || '';
const ALIPAY_PUBLIC_KEY = process.env.ALIPAY_PUBLIC_KEY || '';
const GATEWAY_URL = 'https://openapi.alipay.com/gateway.do';

/**
 * 生成支付宝签名
 */
function alipaySign(params: Record<string, string>, privateKey: string): string {
  const sortedKeys = Object.keys(params).sort();
  const signStr = sortedKeys
    .filter(key => params[key] !== '' && key !== 'sign' && key !== 'sign_type')
    .map(key => `${key}=${params[key]}`)
    .join('&');

  const sign = crypto.createSign('RSA-SHA256');
  sign.update(signStr);
  return sign.sign(privateKey, 'base64');
}

/**
 * 验证支付宝回调签名
 */
function alipayVerify(params: Record<string, string>): boolean {
  if (!ALIPAY_PUBLIC_KEY) {
    console.log('[Alipay] 沙盒模式：跳过签名验证');
    return true;
  }

  const sign = params.sign;
  const signType = params.sign_type || 'RSA2';
  const sortedKeys = Object.keys(params).sort();
  const signStr = sortedKeys
    .filter(key => params[key] !== '' && key !== 'sign' && key !== 'sign_type')
    .map(key => `${key}=${params[key]}`)
    .join('&');

  try {
    const verify = crypto.createVerify('RSA-SHA256');
    verify.update(signStr);
    return verify.verify(ALIPAY_PUBLIC_KEY, sign, 'base64');
  } catch {
    return false;
  }
}

/**
 * 创建当面付订单（返回二维码链接）
 */
export const createPrecreateOrder = async (
  orderNo: string,
  amount: number, // 单位：元
  subject: string
): Promise<{ qr_code?: string; error?: string }> => {
  if (!APP_ID || !PRIVATE_KEY) {
    console.log('[Alipay] 沙盒模式：跳过真实支付');
    return { qr_code: `https://qr.alipay.com/${orderNo}` };
  }

  try {
    const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);
    const bizContent = JSON.stringify({
      out_trade_no: orderNo,
      total_amount: amount.toFixed(2),
      subject,
    });

    const params: Record<string, string> = {
      app_id: APP_ID,
      method: 'alipay.trade.precreate',
      format: 'JSON',
      return_url: '',
      charset: 'utf-8',
      sign_type: 'RSA2',
      timestamp,
      version: '1.0',
      notify_url: `${process.env.BASE_URL || 'http://localhost:3000'}/api/payments/alipay/notify`,
      biz_content: bizContent,
    };

    params.sign = alipaySign(params, PRIVATE_KEY);

    const response = await axios.post(GATEWAY_URL, new URLSearchParams(params).toString(), {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });

    const result = response.data;
    if (result.alipay_trade_precreate_response?.qr_code) {
      return { qr_code: result.alipay_trade_precreate_response.qr_code };
    }

    return { error: result.alipay_trade_precreate_response?.sub_msg || 'Failed to create Alipay order' };
  } catch (error: any) {
    console.error('[Alipay] Create order error:', error.message);
    return { error: 'Failed to create Alipay order' };
  }
};

/**
 * 验证支付宝回调
 */
export const verifyCallback = (params: Record<string, string>): boolean => {
  return alipayVerify(params);
};

export { alipaySign };
