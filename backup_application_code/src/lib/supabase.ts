import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/database';

// These would normally come from your environment variables:
// VITE_SUPABASE_URL
// VITE_SUPABASE_ANON_KEY

const supabaseUrl = (import.meta as any).env?.VITE_SUPABASE_URL || 'https://mock-supabase-url.supabase.co';
const supabaseAnonKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || 'mock-anon-key';

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

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
