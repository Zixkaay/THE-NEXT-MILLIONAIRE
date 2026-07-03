'use server';

import { supabaseAdmin as supabase } from '@/lib/supabase';
import { DatabaseAnnouncement as Announcement } from '@/types/database';
import { isMockSupabase } from '@/features/auth/services/authService';

const STATIC_ANNOUNCEMENTS: Announcement[] = [
  {
    id: 'a1',
    title: 'NBP Season Launch: Core Auditions Commence',
    content: 'Welcome to the Next Billionaire Path. Regional physical hubs across Accra, Kumasi, and our international coordinator desk in North America have completed setup. Check the official rules to stay ahead of dates.',
    image_url: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=1200&auto=format&fit=crop',
    video_url: 'https://www.youtube.com/watch?v=mock-audition',
    is_published: true,
    created_at: new Date(Date.now() - 432000000).toISOString(), // 5 days ago
    updated_at: new Date(Date.now() - 432000000).toISOString()
  },
  {
    id: 'a2',
    title: 'GHC 1,000,000+ Ultimate Venture Prize Consolidated',
    content: 'Our core trustees and investment sponsors have completed the validation pledge for the season. The overall qualified winner will enjoy a direct seed check, brand setup, and global market amplification.',
    image_url: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?q=80&w=1200&auto=format&fit=crop',
    video_url: null,
    is_published: true,
    created_at: new Date(Date.now() - 259200000).toISOString(), // 3 days ago
    updated_at: new Date(Date.now() - 259200000).toISOString()
  }
];

export async function getAnnouncementsAction(): Promise<Announcement[]> {
  if (isMockSupabase()) {
    console.info('[Server Action] Mock Mode active. Serving static announcements.');
    return STATIC_ANNOUNCEMENTS;
  }

  try {
    const { data: dbAnnouncements, error } = await (supabase as any)
      .from('announcements')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[Server Action] Error fetching public.announcements table:', error.message);
      return STATIC_ANNOUNCEMENTS;
    }

    if (!dbAnnouncements || dbAnnouncements.length === 0) {
      console.info('[Server Action] No announcements found. Pre-seeding announcements into database.');
      
      const seedEntries = STATIC_ANNOUNCEMENTS.map(({ id, ...rest }) => ({
        ...rest
      }));

      const { error: seedError } = await (supabase as any)
        .from('announcements')
        .insert(seedEntries);

      if (seedError) {
        console.error('[Server Action] Seeding announcements failed:', seedError.message);
        return STATIC_ANNOUNCEMENTS;
      }

      const { data: refetched } = await (supabase as any)
        .from('announcements')
        .select('*')
        .order('created_at', { ascending: false });

      return (refetched as Announcement[]) || STATIC_ANNOUNCEMENTS;
    }

    return dbAnnouncements as Announcement[];
  } catch (err: any) {
    console.error('[Server Action] Exception while fetching announcements:', err);
    return STATIC_ANNOUNCEMENTS;
  }
}

export async function createAnnouncementAction(announcement: Omit<Announcement, 'id' | 'created_at' | 'updated_at'>): Promise<{ success: boolean; data?: Announcement; error?: string }> {
  const now = new Date().toISOString();

  if (isMockSupabase()) {
    const mockAnn: Announcement = {
      ...announcement,
      id: 'a' + Date.now(),
      created_at: now,
      updated_at: now
    };
    return { success: true, data: mockAnn };
  }

  try {
    const { data, error } = await (supabase as any)
      .from('announcements')
      .insert({
        title: announcement.title,
        content: announcement.content,
        image_url: announcement.image_url || null,
        video_url: announcement.video_url || null,
        is_published: announcement.is_published !== undefined ? announcement.is_published : true,
        created_at: now,
        updated_at: now
      })
      .select()
      .single();

    if (error) {
      console.error('[Server Action] Failed to insert announcement:', error.message);
      return { success: false, error: error.message };
    }

    return { success: true, data: data as Announcement };
  } catch (err: any) {
    console.error('[Server Action] Exception creating announcement:', err);
    return { success: false, error: err?.message || 'Exception occurred' };
  }
}

export async function updateAnnouncementAction(id: string, updates: Partial<Omit<Announcement, 'id' | 'created_at' | 'updated_at'>>): Promise<{ success: boolean; data?: Announcement; error?: string }> {
  const now = new Date().toISOString();
  
  const patchedUpdates = {
    ...updates,
    updated_at: now
  };

  if (isMockSupabase()) {
    return { success: true, data: { id, ...patchedUpdates } as any };
  }

  try {
    const { data, error } = await (supabase as any)
      .from('announcements')
      .update(patchedUpdates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('[Server Action] Failed to update announcement:', error.message);
      return { success: false, error: error.message };
    }

    return { success: true, data: data as Announcement };
  } catch (err: any) {
    console.error('[Server Action] Exception updating announcement:', err);
    return { success: false, error: err?.message || 'Exception occurred' };
  }
}

export async function deleteAnnouncementAction(id: string): Promise<{ success: boolean; error?: string }> {
  if (isMockSupabase()) {
    return { success: true };
  }

  try {
    const { error } = await (supabase as any)
      .from('announcements')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('[Server Action] Failed to delete announcement:', error.message);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err: any) {
    console.error('[Server Action] Exception deleting announcement:', err);
    return { success: false, error: err?.message || 'Exception occurred' };
  }
}
