import { NextRequest, NextResponse } from 'next/server';
import { verifyPaystackSignature } from '@/services/paystack/verifyWebhook';
import { supabaseAdmin as supabase } from '@/lib/supabase';
import { getCloudinaryClient } from '@/services/cloudinary/client';
import { PdfService } from '@/services/pdf/pdfService';

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const headersList = req.headers;
    const signature = headersList.get('x-paystack-signature') || '';
    const secretKey = process.env.PAYSTACK_SECRET_KEY;

    // Verify signature if key and signature are both present
    if (secretKey && signature) {
      const isValid = verifyPaystackSignature(rawBody, signature, secretKey);
      if (!isValid) {
        return NextResponse.json({ error: true, message: 'Invalid cryptographic signature' }, { status: 401 });
      }
    } else {
      console.warn('[Webhook] No signature key or signature present. Accepting payload in sandbox/simulation bypass mode.');
    }

    const payload = JSON.parse(rawBody);
    
    // Check if the event is a successful charge
    if (payload.event === 'charge.success') {
      const reference = payload.data.reference;
      
      // Load payment record
      const { data: payment, error: paymentError } = await (supabase as any)
        .from('payments')
        .select('*')
        .eq('reference', reference)
        .maybeSingle();

      if (paymentError) {
        console.error('[Webhook] Failed to query payment record:', paymentError);
        return NextResponse.json({ error: true, message: 'Database lookup error' }, { status: 500 });
      }

      if (!payment) {
        console.warn('[Webhook] No payment record matched for reference:', reference);
        return NextResponse.json({ error: true, message: 'Match reference not found' }, { status: 404 });
      }

      // Idempotency: Already processed
      if (payment.status === 'success') {
        return NextResponse.json({ success: true, message: 'Payment reference already processed' });
      }

      // Update Payment status to 'success'
      const { error: updateError } = await (supabase as any)
        .from('payments')
        .update({ status: 'success', updated_at: new Date().toISOString() })
        .eq('id', payment.id);

      if (updateError) {
        console.error('[Webhook] Failed to update payment status:', updateError);
        return NextResponse.json({ error: true, message: 'Payment update error' }, { status: 500 });
      }

      // Complete actions based on payment_type
      if (payment.payment_type === 'registration') {
        const metadata = payment.metadata || {};
        const participantId = metadata.participant_id || `NBP-${Math.floor(1001 + Math.random() * 8999)}`;
        const answers = metadata.answers || {};
        const fullName = metadata.fullName || answers.full_name || 'Anonymous Participant';
        const email = metadata.email || answers.email || '';

        // Check if participant already exists to prevent duplicate insertion
        const { data: existingParticipant } = await (supabase as any)
          .from('participants')
          .select('id')
          .eq('id', participantId)
          .maybeSingle();

        if (!existingParticipant) {
          // Create the participant in database
          const { error: insertError } = await (supabase as any)
            .from('participants')
            .insert({
              id: participantId,
              full_name: fullName,
              nickname: answers.nickname || answers.full_name || '',
              bio: answers.business_experience || '',
              status: 'paid', // Fully accredited status
              vote_count: 0,
              metadata: answers,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            });

          if (insertError) {
            console.error('[Webhook] Participant insertion failed:', insertError);
            return NextResponse.json({ error: true, message: 'Participant creation failed' }, { status: 500 });
          }

          console.log(`[Webhook] Successfully created paid participant ${participantId}`);

          // Insert Profile Photo into participant_media table matches Cloudinary Cache requirements
          if (answers.profile_image) {
            const { error: mediaError } = await (supabase as any)
              .from('participant_media')
              .insert({
                participant_id: participantId,
                media_type: 'image',
                url: answers.profile_image,
                is_approved: true,
                created_at: new Date().toISOString()
              });

            if (mediaError) {
              console.error('[Webhook] Failed to insert profile image into participant_media:', mediaError);
            }
          }

          // Insert Optional Pitch Video into participant_media table if uploaded
          if (answers.pitch_video) {
            const { error: mediaError } = await (supabase as any)
              .from('participant_media')
              .insert({
                participant_id: participantId,
                media_type: 'video',
                url: answers.pitch_video,
                is_approved: true,
                created_at: new Date().toISOString()
              });

            if (mediaError) {
              console.error('[Webhook] Failed to insert pitch video into participant_media:', mediaError);
            }
          }

          // =============== PHASE 10: PDF GENERATION (REGISTRATION) ===============
          try {
            const pdfBuffer = await PdfService.generateRegistrationPdf({
              participantId,
              fullName,
              nickname: answers.nickname,
              imageUrl: answers.profile_image,
              dateStr: new Date().toLocaleDateString('en-GB'),
              email,
              phone: answers.telephone || answers.phone || 'N/A',
              status: 'paid',
              reference,
              eventName: 'Next Billionaire Path'
            });

            const cloudinary = getCloudinaryClient();
            const uploadRes = await cloudinary.uploadBuffer(pdfBuffer, 'nbp/registrations', 'image');

            if (uploadRes) {
              await (supabase as any)
                .from('pdf_records')
                .insert({
                  participant_id: participantId,
                  payment_reference: reference,
                  pdf_type: 'registration',
                  pdf_url: uploadRes.url,
                  created_at: new Date().toISOString()
                });
              console.log(`[Webhook] Registration PDF generated and cataloged for ${participantId}`);
            }
          } catch (pdfErr) {
            console.error('[Webhook] Phase 10 registration PDF failure:', pdfErr);
          }
          // ======================================================================
        }
      } else if (payment.payment_type === 'voting') {
        const metadata = payment.metadata || {};
        const participantId = metadata.participant_id;
        const voteCount = parseInt(metadata.vote_count || '0', 10);

        if (participantId && voteCount > 0) {
          // 1. Insert details into public.votes log
          const { error: voteInsertError } = await (supabase as any)
            .from('votes')
            .insert({
              participant_id: participantId,
              payment_id: payment.id,
              count: voteCount,
              created_at: new Date().toISOString()
            });

          if (voteInsertError) {
            console.error('[Webhook] Failed to log vote audit trace:', voteInsertError);
          }

          // 2. Increment participant vote count in public.participants
          const { data: participantData } = await (supabase as any)
            .from('participants')
            .select('vote_count')
            .eq('id', participantId)
            .maybeSingle();

          if (participantData) {
            const currentVotes = participantData.vote_count || 0;
            const newVotes = currentVotes + voteCount;
            const { error: voteUpdateError } = await (supabase as any)
              .from('participants')
              .update({
                vote_count: newVotes,
                updated_at: new Date().toISOString()
              })
              .eq('id', participantId);

            if (voteUpdateError) {
              console.error('[Webhook] Failed to update vote count for participant:', voteUpdateError);
            }
          }

          // 3. Update vote_transactions record
          const { data: voteTx } = await (supabase as any)
            .from('vote_transactions')
            .select('id')
            .eq('payment_reference', reference)
            .maybeSingle();

          if (voteTx) {
            await (supabase as any)
              .from('vote_transactions')
              .update({ processed: true })
              .eq('payment_reference', reference);
          } else {
            // Create a vote_transactions entry for comprehensive audit trace
            await (supabase as any)
              .from('vote_transactions')
              .insert({
                payment_reference: reference,
                participant_id: participantId,
                vote_count: voteCount,
                amount: payment.amount,
                processed: true,
                created_at: new Date().toISOString()
              });
          }

          // =============== PHASE 10: PDF GENERATION (VOTING RECEIPT) ===============
          try {
            const { data: part } = await (supabase as any)
              .from('participants')
              .select('full_name, nickname')
              .eq('id', participantId)
              .maybeSingle();

            const pdfBuffer = await PdfService.generateVotingReceiptPdf({
              reference,
              participantId,
              fullName: part?.full_name || 'Contestant',
              nickname: part?.nickname,
              voteCount,
              amount: payment.amount,
              email: payment.email,
              dateStr: new Date().toLocaleDateString('en-GB'),
              status: 'success'
            });

            const cloudinary = getCloudinaryClient();
            const uploadRes = await cloudinary.uploadBuffer(pdfBuffer, 'nbp/receipts', 'image');

            if (uploadRes) {
              await (supabase as any)
                .from('pdf_records')
                .insert({
                  participant_id: participantId,
                  payment_reference: reference,
                  pdf_type: 'receipt',
                  pdf_url: uploadRes.url,
                  created_at: new Date().toISOString()
                });
              console.log(`[Webhook] Voting receipt PDF generated and cataloged for reference ${reference}`);
            }
          } catch (pdfErr) {
            console.error('[Webhook] Phase 10 voting PDF failure:', pdfErr);
          }
          // =========================================================================
        }
      }
    }

    return NextResponse.json({ success: true, message: 'Webhook event processed successfully' });
  } catch (error: any) {
    console.error('[Webhook Exception]:', error);
    return NextResponse.json({ error: true, message: error.message || 'Internal exception' }, { status: 500 });
  }
}
