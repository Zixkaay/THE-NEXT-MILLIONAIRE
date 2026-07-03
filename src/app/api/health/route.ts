import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin as supabase } from '@/lib/supabase';
import { getCloudinaryClient } from '@/services/cloudinary/client';
import { getPaystackClient } from '@/services/paystack/client';
import { isMockSupabase } from '@/features/auth/services/authService';

export async function GET(req: NextRequest) {
  const result = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    environment: {
      NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'Configured' : 'Missing',
      NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Configured' : 'Missing',
      SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY ? 'Configured' : 'Missing',
      CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME ? 'Configured' : 'Missing',
      CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY ? 'Configured' : 'Missing',
      CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET ? 'Configured' : 'Missing',
      PAYSTACK_SECRET_KEY: process.env.PAYSTACK_SECRET_KEY ? 'Configured' : 'Missing',
      PAYSTACK_PUBLIC_KEY: process.env.PAYSTACK_PUBLIC_KEY ? 'Configured' : 'Missing',
      PAYSTACK_WEBHOOK_SECRET: process.env.PAYSTACK_WEBHOOK_SECRET ? 'Configured' : 'Missing',
    },
    services: {
      supabase: {
        connected: false,
        mode: isMockSupabase() ? 'Mock/Fallback (No NEXT_PUBLIC_SUPABASE_URL)' : 'Production Connected',
        error: null as string | null,
      },
      cloudinary: {
        configured: false,
        mode: 'Mock/Fallback',
      },
      paystack: {
        configured: false,
        mode: 'Mock/Fallback',
      }
    }
  };

  // 1. Check Supabase Connectivity
  try {
    if (!isMockSupabase()) {
      const { data, error } = await (supabase as any).from('settings').select('id').limit(1).maybeSingle();
      if (error && error.code !== 'PGRST116') { // PGRST116 means empty table, which is fine
        result.services.supabase.error = error.message;
      } else {
        result.services.supabase.connected = true;
      }
    } else {
      result.services.supabase.connected = true; // Simulating successful connection in mock environment
    }
  } catch (e: any) {
    result.services.supabase.error = e?.message || 'Database execution exception';
  }

  // 2. Check Cloudinary Configuration status
  try {
    const cloudinaryClient = getCloudinaryClient();
    result.services.cloudinary.configured = cloudinaryClient.isConfigured();
    result.services.cloudinary.mode = cloudinaryClient.isConfigured() ? 'Production Connected' : 'Mock/Fallback';
  } catch (e: any) {
    console.error('Cloudinary connectivity diagnosis failed:', e);
  }

  // 3. Check Paystack Configuration status
  try {
    const paystackSecret = process.env.PAYSTACK_SECRET_KEY;
    result.services.paystack.configured = !!paystackSecret;
    result.services.paystack.mode = paystackSecret ? 'Production Connected' : 'Mock/Fallback';
  } catch (e: any) {
    console.error('Paystack connectivity diagnosis failed:', e);
  }

  // Determine overall status
  const prodSupabaseConnected = isMockSupabase() || result.services.supabase.connected;
  if (!prodSupabaseConnected) {
    result.status = 'degraded';
  }

  return NextResponse.json(result);
}
