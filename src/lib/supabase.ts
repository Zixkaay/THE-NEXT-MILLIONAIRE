import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/database';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

// standard client (respects RLS, zero sensitive rights)
export const supabase = createClient<Database>(
  supabaseUrl || 'https://mock-supabase-url.supabase.co',
  supabaseAnonKey || 'mock-anon-key'
);

// Server-side administrative client. Uses the service key securely to execute actions
const secretKey = supabaseServiceKey || supabaseAnonKey || 'mock-anon-key';
if (!supabaseServiceKey) {
  console.warn('[Supabase] Warning: SUPABASE_SERVICE_ROLE_KEY is missing. Falling back to anon client.');
}

export const supabaseAdmin = createClient<Database>(
  supabaseUrl || 'https://mock-supabase-url.supabase.co',
  secretKey
);

/**
 * ==========================================
 * MOCK RLS (Row Level Security) GUIDELINES
 * ==========================================
 * 
 * 1. SETTINGS TABLE `settings`
 *    - SELECT: `true` (Publicly readable)
 *    - INSERT/UPDATE/DELETE: `auth.uid() = admin_id` (Admin only)
 * 
 * 2. PARTICIPANTS TABLE `participants`
 *    - SELECT: `true` (Publicly readable)
 *    - INSERT: `true` (Publicly appendable for registration form)
 *    - UPDATE: `auth.uid() = admin_id` (Admin only for status change, voting is handled via Edge Functions)
 *    - DELETE: `auth.uid() = admin_id` (Admin only)
 * 
 * 3. BLOG POSTS TABLE `blog_posts`
 *    - SELECT: `true` (Publicly readable)
 *    - INSERT/UPDATE/DELETE: `auth.uid() = admin_id` (Admin only)
 * 
 * 4. MEDIA LIBRARY TABLE `media_library`
 *    - SELECT: `auth.uid() = admin_id` (Admin only, mostly used for internal referencing)
 *    - INSERT/UPDATE/DELETE: `auth.uid() = admin_id` (Admin only)
 * 
 * Note: `vote_count` inside `participants` must be protected from direct client updates. 
 * Real updates will be performed strictly by the Paystack Webhook Edge Function using a service_role key.
 */
