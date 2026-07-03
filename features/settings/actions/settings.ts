'use server';

/**
 * Server Actions for Global System Settings
 */

import { supabaseAdmin as supabase } from '@/lib/supabase';
import { DatabaseSettings } from '@/types/database';
import { isMockSupabase } from '@/features/auth/services/authService';
import { verifyAdminSession } from '@/features/auth/services/serverAuth';

/**
 * Retrieves the global settings from Supabase (or fallback defaults)
 */
export async function getSettingsAction(): Promise<DatabaseSettings> {
  const defaultSettings: DatabaseSettings = {
    id: 'global',
    registration_open: true,
    voting_enabled: false,
    video_upload_visible: true,
    video_required: false,
    vote_price: 1.00,
    registration_fee: 0.00,
    featured_blog_posts: ['b1', 'b2'],
    featured_gallery_items: ['p1', 'p2', 'p3', 'p4'],
    remove_registration_form: false,
    advertising_title: 'Global Pitch Competition',
    advertising_image_url: 'https://images.unsplash.com/photo-1520095972714-909e91b05322?q=80&w=2000&auto=format&fit=crop',
    advertising_link_url: '/about',
    advertising_text: 'Sponsor a contestant or join with our high-net-worth mentors to accelerate the next business titan. Premium spectator path is now open.',
    countdown_active: true,
    countdown_event_name: 'AUDITION DAY',
    countdown_target: new Date(Date.now() + 50 * 24 * 60 * 60 * 1000).toISOString(),
    site_logo_url: 'https://res.cloudinary.com/dnhz6xwjz/image/upload/v1776840105/logo_ahkway.png',
    site_background_url: '',
    updated_at: new Date().toISOString(),
  };

  if (isMockSupabase()) {
    return defaultSettings;
  }

  try {
    const { data, error } = await (supabase as any)
      .from('settings')
      .select('*')
      .eq('id', 'global')
      .maybeSingle();

    if (error || !data) {
      console.warn('[Server Action] No settings record found, seeding default settings in database');
      const { error: seedError } = await (supabase as any)
        .from('settings')
        .upsert({
          id: 'global',
          registration_open: defaultSettings.registration_open,
          voting_enabled: defaultSettings.voting_enabled,
          video_upload_visible: defaultSettings.video_upload_visible,
          video_required: defaultSettings.video_required,
          vote_price: defaultSettings.vote_price,
          registration_fee: defaultSettings.registration_fee ?? 0.00,
          featured_blog_posts: defaultSettings.featured_blog_posts,
          featured_gallery_items: defaultSettings.featured_gallery_items,
          countdown_active: defaultSettings.countdown_active,
          countdown_event_name: defaultSettings.countdown_event_name,
          countdown_target: defaultSettings.countdown_target,
          site_logo_url: defaultSettings.site_logo_url,
          site_background_url: defaultSettings.site_background_url,
          updated_at: defaultSettings.updated_at,
        });

      if (seedError) {
        console.error('[Server Action] Error seeding default settings:', seedError);
      }
      return defaultSettings;
    }

    return data as unknown as DatabaseSettings;
  } catch (error) {
    console.error('[Server Action] Exception while fetching settings:', error);
    return defaultSettings;
  }
}

/**
 * Updates the global settings in Supabase
 */
export async function updateSettingsAction(newSettings: Partial<Omit<DatabaseSettings, 'id' | 'updated_at'>>) {
  if (isMockSupabase()) {
    return { success: true, message: 'Settings successfully updated in local memory (simulation mode)' };
  }

  try {
    await verifyAdminSession();
    // Sanitize newSettings to contain only columns that exist in the settings table
    const allowedKeys: (keyof DatabaseSettings)[] = [
      'registration_open',
      'voting_enabled',
      'video_upload_visible',
      'video_required',
      'vote_price',
      'registration_fee',
      'featured_blog_posts',
      'featured_gallery_items',
      'remove_registration_form',
      'advertising_title',
      'advertising_image_url',
      'advertising_link_url',
      'advertising_text',
      'countdown_active',
      'countdown_event_name',
      'countdown_target',
      'site_logo_url',
      'site_background_url',
      'prize_pool_ghc',
      'about_mission',
      'about_vision'
    ];

    const dbPayload: Record<string, any> = {
      id: 'global',
      updated_at: new Date().toISOString(),
    };

    for (const key of allowedKeys) {
      if (newSettings[key as keyof typeof newSettings] !== undefined) {
        dbPayload[key] = newSettings[key as keyof typeof newSettings];
      }
    }

    const { error } = await (supabase as any)
      .from('settings')
      .upsert(dbPayload);

    if (error) {
      // If error suggests missing columns, fallback to core keys only
      if (error.message && (error.message.includes('column') || error.message.includes('not exist'))) {
        console.warn('[Server Action] Custom advertising columns missing in database scheme. Retrying with basic settings keys only.');
        
        const basicKeys: (keyof DatabaseSettings)[] = [
          'registration_open',
          'voting_enabled',
          'video_upload_visible',
          'video_required',
          'vote_price',
          'registration_fee',
          'featured_blog_posts',
          'featured_gallery_items',
          'countdown_active',
          'countdown_event_name',
          'countdown_target',
          'site_logo_url',
          'site_background_url',
          'prize_pool_ghc',
          'about_mission',
          'about_vision'
        ];

        const fallbackPayload: Record<string, any> = {
          id: 'global',
          updated_at: new Date().toISOString(),
        };

        for (const key of basicKeys) {
          if (newSettings[key as keyof typeof newSettings] !== undefined) {
            fallbackPayload[key] = newSettings[key as keyof typeof newSettings];
          }
        }

        const { error: fallbackError } = await (supabase as any)
          .from('settings')
          .upsert(fallbackPayload);

        if (fallbackError) {
          throw new Error(fallbackError.message);
        }
        
        return { 
          success: true, 
          message: 'Saved core settings successfully (dynamic advertising properties handled in client session state).' 
        };
      }
      
      throw new Error(error.message);
    }

    return { success: true, message: 'Configuration successfully written to global registry.' };
  } catch (error: any) {
    console.error('[Server Action] Exception while updating settings:', error);
    return { success: false, error: true, message: error.message || 'Operation failed' };
  }
}
