'use server';

import { supabaseAdmin as supabase } from '@/lib/supabase';

export async function submitContactMessageAction(payload: {
  name: string;
  email: string;
  subject: string;
  message: string;
}) {
  try {
    const { data, error } = await (supabase as any)
      .from('contact_messages')
      .insert({
        name: payload.name,
        email: payload.email,
        subject: payload.subject,
        message: payload.message,
        created_at: new Date().toISOString()
      });

    if (error) {
      throw new Error(error.message);
    }
    return { success: true, message: 'Message sent successfully.' };
  } catch (err: any) {
    console.error('[ContactAction] Exception:', err);
    return { error: true, success: false, message: err.message || 'Failed to send message.' };
  }
}
