/**
 * Paystack Integration Service - Webhook Signature Verification Helper
 */

import { createHmac, timingSafeEqual } from 'crypto';

/**
 * Validates the authenticity of a Paystack webhook by checking its HMAC signature
 */
export function verifyPaystackSignature(
  rawBody: string,
  signatureHeader: string | undefined | string[],
  secretKey: string | undefined
): boolean {
  if (!signatureHeader || !secretKey) {
    return false;
  }

  try {
    const signature = Array.isArray(signatureHeader) ? signatureHeader[0] : signatureHeader;
    
    // Hash raw body using Paystack secret key
    const currentHmac = createHmac('sha512', secretKey);
    currentHmac.update(rawBody, 'utf8');
    const computedSignature = currentHmac.digest('hex');

    // Use a constant time comparison to defend against timing-side-channel attacks
    const bufferA = Buffer.from(signature, 'utf8');
    const bufferB = Buffer.from(computedSignature, 'utf8');

    if (bufferA.length !== bufferB.length) {
      return false;
    }

    return timingSafeEqual(bufferA, bufferB);
  } catch (error) {
    console.error('Cryptographic signature check failed:', error);
    return false;
  }
}
