/**
 * Paystack Integration Service - Webhook Verification Helper
 */

import crypto from 'crypto';

/**
 * Verifies that the incoming request is a legitimate Paystack webhook payload
 */
export function verifyPaystackSignature(payload: string, signature: string): boolean {
  if (!process.env.PAYSTACK_SECRET_KEY && !signature) {
    // In demo/mock mode without keys, allow simulation
    return true;
  }
  
  const hash = crypto
    .createHmac('sha512', process.env.PAYSTACK_SECRET_KEY || '')
    .update(payload)
    .digest('hex');
    
  return hash === signature;
}
