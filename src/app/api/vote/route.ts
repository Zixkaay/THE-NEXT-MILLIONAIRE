import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin as supabase } from '@/lib/supabase';
import { getSettingsAction } from '@/features/settings/actions';
import { getPaystackClient } from '@/services/paystack/client';

export async function POST(req: NextRequest) {
  try {
    const { email, participantId, voteCount } = await req.json();

    if (!email || !participantId || !voteCount) {
      return NextResponse.json(
        { error: true, message: 'Voter Email, Selected Contestant, and Vote Count are mandatory parameters.' },
        { status: 400 }
      );
    }

    const parsedVotes = parseInt(voteCount, 10);
    if (isNaN(parsedVotes) || parsedVotes <= 0) {
      return NextResponse.json(
        { error: true, message: 'Vote count must be a positive integer.' },
        { status: 400 }
      );
    }

    // 1. Double check if voting is actually enabled
    const settings = await getSettingsAction();
    if (!settings.voting_enabled) {
      return NextResponse.json(
        { error: true, message: 'Voting is currently closed or disabled by the administrator.' },
        { status: 403 }
      );
    }

    // 2. Validate participant selection
    const { data: participant, error: participantError } = await (supabase as any)
      .from('participants')
      .select('*')
      .eq('id', participantId)
      .maybeSingle();

    if (participantError || !participant) {
      return NextResponse.json(
        { error: true, message: 'Selected contestant does not exist in our systems.' },
        { status: 404 }
      );
    }

    if (participant.status !== 'qualified') {
      const isEvicted = participant.status === 'evicted';
      return NextResponse.json(
        { error: true, message: isEvicted ? 'Voting is closed for this contestant because they have been evicted from the show.' : 'You can only vote for active qualified contestants.' },
        { status: 400 }
      );
    }

    // 3. Compute price amount (in GHC)
    const rate = settings.vote_price || 1.00;
    const totalAmountGHC = parsedVotes * rate;

    // 4. Generate transaction record reference
    const reference = `NBP-VOTE-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;

    // 5. Build dynamic callback return URL
    const origin = req.nextUrl.origin;
    const callbackUrl = `${origin}/success?reference=${reference}`;

    const metadata = {
      participant_id: participantId,
      fullName: participant.full_name,
      vote_count: parsedVotes,
      type: 'voting',
      email: email.trim()
    };

    // 6. Write pending payment record into public.payments Table
    const { error: paymentError } = await (supabase as any)
      .from('payments')
      .insert({
        reference,
        email: email.trim(),
        amount: totalAmountGHC,
        status: 'pending',
        payment_type: 'voting',
        metadata,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });

    if (paymentError) {
      console.error('[Voting API] Failed to log pending payment:', paymentError);
      return NextResponse.json(
        { error: true, message: 'Failed to record transaction log.' },
        { status: 500 }
      );
    }

    // 7. Write a pending vote_transaction entry to satisfy duplicate/double billing lock
    const { error: txError } = await (supabase as any)
      .from('vote_transactions')
      .insert({
        payment_reference: reference,
        participant_id: participantId,
        vote_count: parsedVotes,
        amount: totalAmountGHC,
        processed: false,
        created_at: new Date().toISOString()
      });

    if (txError) {
      console.warn('[Voting API] Warning: Failed to pre-seed vote transaction tracker:', txError.message);
    }

    // 8. Initialize Paystack Transaction gateway
    const paystack = getPaystackClient();
    const transaction = await paystack.initializeTransaction({
      email: email.trim(),
      amount: totalAmountGHC,
      reference,
      callback_url: callbackUrl,
      metadata
    });

    return NextResponse.json({
      success: true,
      message: 'Voting initialized successfully.',
      authorization_url: transaction.authorization_url,
      reference
    });

  } catch (err: any) {
    console.error('[Voting API Error]:', err);
    return NextResponse.json(
      { error: true, message: err?.message || 'Failed to initialize voting transaction' },
      { status: 500 }
    );
  }
}
