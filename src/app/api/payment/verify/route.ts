import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin as supabase } from '@/lib/supabase';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const reference = searchParams.get('reference');

    if (!reference) {
      return NextResponse.json({ error: true, message: 'Transaction reference is required' }, { status: 400 });
    }

    // 1. Load payment record
    const { data: payment, error: paymentError } = await (supabase as any)
      .from('payments')
      .select('*')
      .eq('reference', reference)
      .maybeSingle();

    if (paymentError) {
      console.error('[Verify API] Match query error:', paymentError);
      return NextResponse.json({ error: true, message: 'Database query failure' }, { status: 500 });
    }

    if (!payment) {
      return NextResponse.json({ error: true, message: 'Transaction reference match not found.' }, { status: 404 });
    }

    // 2. If payment is success, load the corresponding participant profile
    if (payment.status === 'success') {
      const metadata = payment.metadata || {};
      const participantId = metadata.participant_id;

      if (participantId) {
        // Find registered participant
        const { data: participant } = await (supabase as any)
          .from('participants')
          .select('*')
          .eq('id', participantId)
          .maybeSingle();

        // Find participant media profile image
        const { data: media } = await (supabase as any)
          .from('participant_media')
          .select('url')
          .eq('participant_id', participantId)
          .eq('media_type', 'image')
          .maybeSingle();

        return NextResponse.json({
          success: true,
          status: 'success',
          payment,
          participant,
          profilePhoto: media?.url || null
        });
      }

      return NextResponse.json({
        success: true,
        status: 'success',
        payment,
        participant: null
      });
    }

    // Otherwise return non-processed state
    return NextResponse.json({
      success: true,
      status: payment.status, // e.g. 'pending', 'failed'
      payment
    });
  } catch (err: any) {
    console.error('[Verify API Exception]:', err);
    return NextResponse.json({ error: true, message: err?.message || 'Verification exception' }, { status: 500 });
  }
}
