import { NextResponse } from 'next/server';
import { initializePaystackPayment } from '@/services/paystack/initializePayment';
import { createVoteTransaction } from '../../../../../features/voting/services/voteService';

export async function POST(request: Request) {
  try {
    const { participant_id, email, amount, vote_count } = await request.json();

    // 1. Initialize Payment
    const payment = await initializePaystackPayment(email, amount, {
      participantId: participant_id,
      votesAdded: vote_count,
      type: 'voting'
    });

    if (!payment.success) {
      throw new Error(payment.message || 'Failed to initialize payment');
    }

    // 2. Create transaction record
    await createVoteTransaction({
      participant_id,
      vote_count,
      amount,
      payment_reference: payment.reference as string
    });

    return NextResponse.json({ authorization_url: payment.authorization_url });
  } catch (error: any) {
    console.error('[VotingInitializationAPI] Error:', error);
    return NextResponse.json({ error: true, message: error.message }, { status: 500 });
  }
}
