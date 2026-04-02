import crypto from 'crypto';
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

/**
 * 微信支付服务（Native 支付 - PC端扫码支付）
 * 
 * 使用微信支付 v3 API
 * 需要配置环境变量：
 * - WECHAT_MCH_ID: 商户号
 * - WECHAT_APP_ID: 应用ID
 * - WECHAT_API_KEY_V3: API v3 密钥
 * - WECHAT_SERIAL_NO: 商户证书序列号
 * - WECHAT_PRIVATE_KEY: 商户私钥内容
 */
const MCH_ID = process.env.WECHAT_MCH_ID || '';
const APP_ID = process.env.WECHAT_APP_ID || '';
const API_KEY_V3 = process.env.WECHAT_API_KEY_V3 || '';
const BASE_URL = 'https://api.mch.weixin.qq.com';

/**
 * 生成微信支付签名
 */
function generateSignature(method: string, url: string, timestamp: string, nonceStr: string, body: string): string {
  const message = `${method}\n${url}\n${timestamp}\n${nonceStr}\n${body}\n`;
  const privateKey = process.env.WECHAT_PRIVATE_KEY || '';
  const sign = crypto.createSign('RSA-SHA256');
  sign.update(message);
  return sign.sign(privateKey, 'base64');
}

/**
 * 生成随机字符串
 */
function generateNonceStr(): string {
  return crypto.randomBytes(16).toString('hex');
}

/**
 * 生成 Authorization 头
 */
function getAuthorization(method: string, url: string, body: string): string {
  const timestamp = Math.floor(Date.now() / 1000).toString();
  const nonceStr = generateNonceStr();
  const serialNo = process.env.WECHAT_SERIAL_NO || '';
  const signature = generateSignature(method, url, timestamp, nonceStr, body);

  return `WECHATPAY2-SHA256-RSA2048 mchid="${MCH_ID}",nonce_str="${nonceStr}",timestamp="${timestamp}",serial_no="${serialNo}",signature="${signature}"`;
}

/**
 * 创建 Native 支付订单（返回二维码链接）
 */
export const createNativeOrder = async (
  orderNo: string,
  amount: number, // 单位：元
  description: string
): Promise<{ code_url?: string; error?: string }> => {
  if (!MCH_ID || !API_KEY_V3) {
    // 沙盒模式：返回模拟数据
    console.log('[WechatPay] 沙盒模式：跳过真实支付');
    return { code_url: `weixin://wxpay/bizpayurl?pr=${orderNo}` };
  }

  try {
    const url = '/v3/pay/transactions/native';
    const body = JSON.stringify({
      appid: APP_ID,
      mchid: MCH_ID,
      description,
      out_trade_no: orderNo,
      notify_url: `${process.env.BASE_URL || 'http://localhost:3000'}/api/payments/wechat/notify`,
      amount: {
        total: Math.round(amount * 100), // 转为分
        currency: 'CNY',
      },
    });

    const response = await axios.post(`${BASE_URL}${url}`, body, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': getAuthorization('POST', url, body),
      },
    });

    return { code_url: response.data.code_url };
  } catch (error: any) {
    console.error('[WechatPay] Create order error:', error.response?.data || error.message);
    return { error: 'Failed to create WeChat pay order' };
  }
};

/**
 * 验证微信支付回调签名
 */
export const verifyNotifySignature = (
  signature: string,
  timestamp: string,
  nonce: string,
  body: string
): boolean => {
  if (!MCH_ID || !API_KEY_V3) {
    console.log('[WechatPay] 沙盒模式：跳过签名验证');
    return true;
  }

  // 实际生产环境需要用平台证书验证
  // 这里简化处理，正式上线需要完善
  const privateKey = process.env.WECHAT_PRIVATE_KEY || '';
  const message = `${timestamp}\n${nonce}\n${body}\n`;
  try {
    const verify = crypto.createVerify('RSA-SHA256');
    verify.update(message);
    return verify.verify(privateKey, signature, 'base64');
  } catch {
    return false;
  }
};

/**
 * 解密回调数据
 */
export const decryptNotification = (resource: { ciphertext: string; nonce: string; associated_data: string }): any => {
  if (!API_KEY_V3) {
    console.log('[WechatPay] 沙盒模式：跳过解密');
    return { out_trade_no: 'sandbox', trade_state: 'SUCCESS' };
  }

  const key = Buffer.from(API_KEY_V3, 'utf8');
  const nonce = Buffer.from(resource.nonce, 'utf8');
  const associatedData = Buffer.from(resource.associated_data, 'utf8');
  const ciphertext = Buffer.from(resource.ciphertext, 'base64');

  const decipher = crypto.createDecipheriv('aes-256-gcm', key, nonce);
  decipher.setAAD(associatedData);
  const decrypted = Buffer.concat([decipher.update(ciphertext), decipher.final()]);
  return JSON.parse(decrypted.toString());
};
