import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin as supabase } from '@/lib/supabase';
import { PdfService } from '@/services/pdf/pdfService';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const reference = searchParams.get('reference');

    if (!reference) {
      return NextResponse.json({ error: true, message: 'Transaction payment reference is required' }, { status: 400 });
    }

    // Load payment transaction details
    const { data: payment, error: payError } = await (supabase as any)
      .from('payments')
      .select('*')
      .eq('reference', reference)
      .maybeSingle();

    if (!payment) {
      return NextResponse.json({ error: true, message: 'Audit mismatch. Transaction reference not registered.' }, { status: 404 });
    }

    if (payment.status !== 'success') {
      return NextResponse.json({ error: true, message: 'Transient or unverified transactions do not have valid receipts.' }, { status: 400 });
    }

    const metadata = payment.metadata || {};
    const participantId = metadata.participant_id;
    const voteCount = metadata.vote_count || metadata.votes || 1;

    let participant: any = null;
    if (participantId) {
      const { data: partData } = await (supabase as any)
        .from('participants')
        .select('*')
        .eq('id', participantId)
        .maybeSingle();
      participant = partData;
    }

    const fullName = participant?.full_name || 'Platform Contestant';
    const nickname = participant?.nickname || 'active_runner';
    const pId = participant?.id || participantId || 'NBP-SUPPORT';

    // Format billing time
    const date = payment.created_at ? new Date(payment.created_at) : new Date();
    const formattedDate = date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    // Compile Voting Receipt
    const pdfBytes = await PdfService.generateVotingReceiptPdf({
      reference: payment.reference,
      participantId: pId,
      fullName,
      nickname,
      voteCount: parseInt(voteCount, 10) || 1,
      amount: parseFloat(payment.amount || '0'),
      email: payment.email,
      dateStr: formattedDate,
      status: payment.status
    });

    const headers = new Headers();
    headers.set('Content-Type', 'application/pdf');
    headers.set('Content-Disposition', `attachment; filename="NBP_Receipt_${payment.reference}.pdf"`);

    return new Response(pdfBytes, {
      status: 200,
      headers
    });
  } catch (err: any) {
    console.error('[Voting Receipt PDF API Exception]:', err);
    return NextResponse.json({ error: true, message: err?.message || 'Server received custom receipt generation exception' }, { status: 500 });
  }
}
