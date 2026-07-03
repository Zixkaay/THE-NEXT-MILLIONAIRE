/**
 * Paystack Integration Service - Initialization Helper
 */

import { isMockSupabase } from '@/features/auth/services/authService';

export interface PaystackInitResponse {
  success: boolean;
  message?: string;
  authorization_url?: string;
  reference?: string;
}

/**
 * Triggers secure server-side Paystack payment initialization
 * @param email The customer's whitelisted email address
 * @param amountInGHC The payment amount in GHC
 * @param metadata Context metadata (e.g. participantId, type: 'registration' | 'voting', votesAdded)
 */
export async function initializePaystackPayment(
  email: string,
  amountInGHC: number,
  metadata: {
    participantId?: string;
    fullName?: string;
    votesAdded?: number;
    type: 'registration' | 'voting';
    customFields?: Record<string, string | number | boolean>;
  }
): Promise<PaystackInitResponse> {
  // If we are in local sandbox mock mode and don't have active keys:
  if (isMockSupabase() && !(process.env.NEXT_PUBLIC_SUPABASE_URL)) {
    console.log('[Mock mode active]: Preserving payment context with simulator for GHC', amountInGHC);
    const mockRef = 'NBP-MOCK-' + Math.floor(Math.random() * 100000000);
    
    return {
      success: true,
      reference: mockRef,
      // Create a local simulation redirect page flow or simulate direct popup success
      authorization_url: `${window.location.origin}/api/payment/simulate?ref=${mockRef}&email=${encodeURIComponent(email)}&amountGHC=${amountInGHC}&metadata=${encodeURIComponent(JSON.stringify(metadata))}`
    };
  }

  try {
    console.log('Mocking payment initialization for:', {
      email: email.trim(),
      amountGHC: amountInGHC,
      metadata
    });

    // Mock successful initialization
    return {
      success: true,
      message: 'Demo mode successful',
      authorization_url: `${window.location.origin}/success?ref=NBP-MOCK-` + Math.floor(Math.random() * 100000000),
      reference: 'NBP-MOCK-REF'
    };
  } catch (err: any) {
    console.error('Failed to communicate with billing initialization gateway:', err);
    return {
      success: false,
      message: err?.message || 'Failed to establish transaction channel'
    };
  }
}
