import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin as supabase } from '@/lib/supabase';
import { PdfService } from '@/services/pdf/pdfService';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const participantId = searchParams.get('participantId');
    const reference = searchParams.get('reference');

    let participant: any = null;
    let payment: any = null;
    let profileImageUrl: string | null = null;

    if (reference) {
      // Find the onboarding payment first
      const { data: payData, error: payError } = await (supabase as any)
        .from('payments')
        .select('*')
        .eq('reference', reference)
        .maybeSingle();

      if (payData) {
        payment = payData;
        const pId = payData.metadata?.participant_id;
        if (pId) {
          const { data: partData } = await (supabase as any)
            .from('participants')
            .select('*')
            .eq('id', pId)
            .maybeSingle();
          participant = partData;
        }
      }
    } else if (participantId) {
      // Find the participant profile directly
      const { data: partData } = await (supabase as any)
        .from('participants')
        .select('*')
        .eq('id', participantId)
        .maybeSingle();
      participant = partData;
    }

    if (!participant) {
      return NextResponse.json({ error: true, message: 'Participant record or verified payment reference match not found.' }, { status: 404 });
    }

    // Try finding the specific profile image row
    const { data: media } = await (supabase as any)
      .from('participant_media')
      .select('url')
      .eq('participant_id', participant.id)
      .eq('media_type', 'image')
      .maybeSingle();
    
    profileImageUrl = media?.url || (participant.media_urls?.images?.[0] || null);

    // Format date string beautifully
    const date = participant.created_at ? new Date(participant.created_at) : new Date();
    const formattedDate = date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    const attendeeEmail = payment?.email || (participant.metadata?.email || 'NBP Registration channel');
    const attendeePhone = participant.phone || (participant.metadata?.telephone || participant.metadata?.phone || 'N/A');

    // Generate the PDF Buffer
    const pdfBytes = await PdfService.generateRegistrationPdf({
      participantId: participant.id,
      fullName: participant.full_name,
      nickname: participant.nickname || '',
      imageUrl: profileImageUrl,
      dateStr: formattedDate,
      email: attendeeEmail,
      phone: attendeePhone,
      status: participant.status,
      reference: payment?.reference || reference || 'NBP-ONLINE-CRED',
      eventName: 'Next Billionaire Path'
    });

    // Build responsive download stream headers
    const headers = new Headers();
    headers.set('Content-Type', 'application/pdf');
    headers.set('Content-Disposition', `attachment; filename="NBP_Pass_${participant.id}.pdf"`);

    return new Response(pdfBytes, {
      status: 200,
      headers
    });
  } catch (err: any) {
    console.error('[Registration PDF API Exception]:', err);
    return NextResponse.json({ error: true, message: err?.message || 'Server-side PDF compile exception' }, { status: 500 });
  }
}
