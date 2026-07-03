import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin as supabase } from '@/lib/supabase';
import { getSettingsAction } from '@/features/settings/actions';
import { getPaystackClient } from '@/services/paystack/client';
import { isMockSupabase } from '@/features/auth/services/authService';

export async function POST(req: NextRequest) {
  try {
    const { answers } = await req.json();

    if (!answers) {
      return NextResponse.json({ error: true, message: 'Form answers are required' }, { status: 400 });
    }

    // 1. Check if registration is open on the backend directly against the settings table
    let isRegistrationOpen = true;
    let feeInGHC = 0.00;
    if (!isMockSupabase()) {
      const { data: dbSettings, error: dbError } = await (supabase as any)
        .from('settings')
        .select('registration_open, registration_fee')
        .eq('id', 'global')
        .maybeSingle();

      if (dbError) {
        console.error('[Registration API] Strict database query failed when reading registration lock:', dbError);
        isRegistrationOpen = false; // Fail secure by default
      } else if (dbSettings) {
        isRegistrationOpen = dbSettings.registration_open === true;
        if (dbSettings.registration_fee !== undefined && dbSettings.registration_fee !== null) {
          feeInGHC = Number(dbSettings.registration_fee);
        }
      }
    } else {
      const settings = await getSettingsAction();
      isRegistrationOpen = settings.registration_open === true;
      if (settings.registration_fee !== undefined && settings.registration_fee !== null) {
        feeInGHC = Number(settings.registration_fee);
      }
    }

    if (!isRegistrationOpen) {
      return NextResponse.json(
        { error: true, message: 'Registration has been officially closed by administrators.' },
        { status: 403 }
      );
    }

    // 2. Validate essential fields
    const fullName = answers.full_name || '';
    const email = answers.email || '';

    if (!fullName || !email) {
      return NextResponse.json(
        { error: true, message: 'Full Name and Email Address are mandatory requirements to initialize registration.' },
        { status: 400 }
      );
    }

    // 3. Generate a beautiful custom Participant ID (e.g. NBP-1002)
    // We check to ensure ID uniqueness
    let participantId = '';
    let isUnique = false;
    let attempts = 0;

    while (!isUnique && attempts < 5) {
      const pin = Math.floor(1001 + Math.random() * 8999);
      participantId = `NBP-${pin}`;
      
      const { data } = await (supabase as any)
        .from('participants')
        .select('id')
        .eq('id', participantId)
        .maybeSingle();

      if (!data) {
        isUnique = true;
      }
      attempts++;
    }

    // Fallback if loop hit attempts ceiling (extremely rare)
    if (!participantId) {
      participantId = `NBP-${Date.now().toString().slice(-4)}`;
    }

    // 4. Create Paystack Reference link
    const reference = `NBP-REG-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;

    // 5. Build dynamic callback return URL
    const origin = req.nextUrl.origin;
    const callbackUrl = `${origin}/success?reference=${reference}`;

    const metadata = {
      participant_id: participantId,
      fullName,
      email,
      type: 'registration',
      answers,
    };

    // If Mock Supabase mode is active, completely simulate the success redirect to bypass DB inserts/Paystack
    if (isMockSupabase()) {
      console.log('[Registration API] [Simulation Mode] Bypassing real database inserts and Paystack checkout.');
      return NextResponse.json({
        success: true,
        message: 'Registration simulated successfully (Sandbox Mode).',
        authorization_url: `${origin}/success?reference=${reference}`,
        reference,
      });
    }

    // 6. Handle Free Registration (feeInGHC <= 0)
    if (feeInGHC <= 0) {
      console.log('[Registration API] Processing free registration entry directly.');

      // Insert free success payment record
      const { error: paymentError } = await (supabase as any)
        .from('payments')
        .insert({
          reference,
          email,
          amount: 0,
          status: 'success',
          payment_type: 'registration',
          metadata,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

      if (paymentError) {
        console.error('[Registration API] Failed to log free payment record:', paymentError);
        return NextResponse.json(
          { error: true, message: 'Failed to record transaction. Please try again.' },
          { status: 500 }
        );
      }

      // Create the participant record
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
        console.error('[Registration API] Free participant insertion failed:', insertError);
        return NextResponse.json({ error: true, message: 'Participant creation failed' }, { status: 500 });
      }

      // Catalog profile photo in participant_media
      if (answers.profile_image) {
        await (supabase as any)
          .from('participant_media')
          .insert({
            participant_id: participantId,
            media_type: 'image',
            url: answers.profile_image,
            is_approved: true,
            created_at: new Date().toISOString()
          });
      }

      // Catalog pitch video in participant_media if uploaded
      if (answers.pitch_video) {
        await (supabase as any)
          .from('participant_media')
          .insert({
            participant_id: participantId,
            media_type: 'video',
            url: answers.pitch_video,
            is_approved: true,
            created_at: new Date().toISOString()
          });
      }

      // Generate Registration PDF in background/async if possible
      try {
        const { PdfService } = await import('@/services/pdf/pdfService');
        const { getCloudinaryClient } = await import('@/services/cloudinary/client');
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
        }
      } catch (pdfErr) {
        console.error('[Registration API] Registration PDF generation skipped/failed for free checkouts:', pdfErr);
      }

      return NextResponse.json({
        success: true,
        message: 'Registration completed successfully (Free Entry).',
        authorization_url: `${origin}/success?reference=${reference}`,
        reference,
      });
    }

    // 7. Write pending payment record to Payments table for paid checkouts
    const { error: paymentError } = await (supabase as any)
      .from('payments')
      .insert({
        reference,
        email,
        amount: feeInGHC,
        status: 'pending',
        payment_type: 'registration',
        metadata,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });

    if (paymentError) {
      console.error('[Registration API] Failed to log pending payment:', paymentError);
      return NextResponse.json(
        { error: true, message: 'Failed to record transaction. Please try again.' },
        { status: 500 }
      );
    }

    // 8. Initialize transaction with Paystack Gateway
    const paystack = getPaystackClient();
    const transaction = await paystack.initializeTransaction({
      email,
      amount: feeInGHC,
      reference,
      callback_url: callbackUrl,
      metadata,
    });

    return NextResponse.json({
      success: true,
      message: 'Registration initialized successfully.',
      authorization_url: transaction.authorization_url,
      reference,
    });
  } catch (err: any) {
    console.error('[Registration API Error]:', err);
    return NextResponse.json(
      { error: true, message: err?.message || 'Failed to initialize tournament registration' },
      { status: 500 }
    );
  }
}
