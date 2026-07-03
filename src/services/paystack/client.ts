/**
 * Server-side Paystack Client helper
 * Lazy-initialized and handles missing keys gracefully.
 */

export interface PaystackInitializeParam {
  email: string;
  amount: number; // in GHC (needs to be converted to smallest currency unit, e.g. pesewas for GHS: amount * 100)
  reference?: string;
  callback_url?: string;
  metadata?: any;
}

export class PaystackClient {
  private secretKey: string;

  constructor() {
    this.secretKey = process.env.PAYSTACK_SECRET_KEY || '';
  }

  private getHeaders() {
    if (!this.secretKey) {
      throw new Error('PAYSTACK_SECRET_KEY environment variable is not defined.');
    }
    return {
      Authorization: `Bearer ${this.secretKey}`,
      'Content-Type': 'application/json',
    };
  }

  /**
   * Initializes a transaction with Paystack
   * Ref: https://paystack.com/docs/api/transaction/#initialize
   */
  async initializeTransaction(params: PaystackInitializeParam) {
    if (!this.secretKey) {
      console.warn('[PaystackClient]: API Key not found. Simulating transaction initialization (Mock Mode).');
      return {
        id: 'nbp_mock_' + Date.now(),
        authorization_url: `/api/payment/simulate?email=${encodeURIComponent(params.email)}&amountGHC=${params.amount}`,
        reference: params.reference || 'NBP-MOCK-' + Math.floor(Math.random() * 100000000),
      };
    }

    try {
      // Amount must be in kobo/pesewas (multiply by 100)
      const payload = {
        email: params.email,
        amount: Math.round(params.amount * 100),
        reference: params.reference,
        callback_url: params.callback_url,
        metadata: params.metadata,
      };

      const response = await fetch('https://api.paystack.co/transaction/initialize', {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(payload),
      });

      const result = await response.json();
      if (!response.ok || !result.status) {
        throw new Error(result.message || 'Failed to initialize transaction through Paystack API.');
      }

      return {
        authorization_url: result.data.authorization_url,
        reference: result.data.reference,
        access_code: result.data.access_code,
      };
    } catch (error: any) {
      console.error('[PaystackClient] transaction initialization failed:', error);
      throw error;
    }
  }

  /**
   * Verifies a transaction status with Paystack
   * Ref: https://paystack.com/docs/api/transaction/#verify
   */
  async verifyTransaction(reference: string) {
    if (!this.secretKey) {
      console.warn('[PaystackClient]: API Key not found. Simulating verification.');
      return {
        status: 'success',
        reference,
        amount: 50 * 100, // 50 GHS in pesewas
        metadata: { type: 'registration' },
      };
    }

    try {
      const response = await fetch(`https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`, {
        method: 'GET',
        headers: this.getHeaders(),
      });

      const result = await response.json();
      if (!response.ok || !result.status) {
        throw new Error(result.message || 'Failed to verify transaction through Paystack API.');
      }

      return result.data; // contains transaction status, amount, metadata, etc.
    } catch (error: any) {
      console.error('[PaystackClient] transaction verification failed:', error);
      throw error;
    }
  }
}

// Singleton helper that lazy loads
let paystackClientInstance: PaystackClient | null = null;

export function getPaystackClient(): PaystackClient {
  if (!paystackClientInstance) {
    paystackClientInstance = new PaystackClient();
  }
  return paystackClientInstance;
}
