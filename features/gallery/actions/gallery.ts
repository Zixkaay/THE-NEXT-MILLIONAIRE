'use server';

import { supabaseAdmin as supabase } from '@/lib/supabase';
import { DatabaseGalleryItem as GalleryItem } from '@/types/database';
import { isMockSupabase } from '@/features/auth/services/authService';

const STATIC_GALLERY_ITEMS: Omit<GalleryItem, 'id' | 'created_at'>[] = [
  {
    title: 'Collaborative Cohort: Accra Innovation Hub',
    type: 'image',
    url: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?q=80&w=1200&auto=format&fit=crop',
    description: '[Bootcamp] Our top founders brainstorming market entrance routes, collaborative distribution structures, and fintech expansion ideas during the intensive product development modules.',
    featured: true
  },
  {
    title: 'The Grand Reveal: Opening Night Red Carpet',
    type: 'video',
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    description: '[Gala Night] A look at the global delegates, financial leaders, and creative directors arriving to welcome the qualified contestants onto the world stage. (Thumbnail: https://images.unsplash.com/photo-1542744173-8e7e53415bb0?q=80&w=1200&auto=format&fit=crop)',
    featured: true
  },
  {
    title: 'The Hot Seat: Boardroom Elimination Rounds',
    type: 'video',
    url: 'https://www.youtube.com/embed/dQw4w9WgXcQ', 
    description: '[Boardroom] A high-stakes session where our judges dissect financial reports, analyze user acquisition metrics, and review business viability. (Thumbnail: https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?q=80&w=1200&auto=format&fit=crop)',
    featured: true
  },
  {
    title: 'Strategic Counsel: High-Net-Worth Advisory Circles',
    type: 'image',
    url: 'https://images.unsplash.com/photo-1531123897727-8f129e1608ce?q=80&w=1200&auto=format&fit=crop',
    description: '[Masterclass] Global industry giants offering practical frameworks on asset management and scale strategies during the private VIP mentorship luncheon.',
    featured: false
  },
  {
    title: 'Market Verification: Field Demonstrations',
    type: 'image',
    url: 'https://images.unsplash.com/photo-1592652495393-4a11f26a8ac0?q=80&w=1200&auto=format&fit=crop',
    description: '[Bootcamp] Taking technology to the ground level. Entrants validating digital infrastructure prototypes directly with target localized small business clients.',
    featured: false
  },
  {
    title: 'Fintech Scale Masterclass: Dr. Arhin Live',
    type: 'video',
    url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    description: '[Masterclass] Dr. Evelyn Arhin shares deep-dive wisdom on cross-border compliance, Pan-African licensing structures, and micro-loan risk engines. (Thumbnail: https://images.unsplash.com/photo-1506803682981-6e718a9dd3ee?q=80&w=1200&auto=format&fit=crop)',
    featured: false
  }
];

export async function getGalleryItemsAction(): Promise<GalleryItem[]> {
  if (isMockSupabase()) {
    return STATIC_GALLERY_ITEMS.map((item, index) => ({
      ...item,
      id: `g-${index + 1}`,
      created_at: new Date(Date.now() - index * 86400000).toISOString()
    }));
  }

  try {
    const { data, error } = await (supabase as any)
      .from('gallery_items')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[Server Action] Error fetching gallery_items table:', error.message);
      return [];
    }

    if (!data || data.length === 0) {
      console.info('[Server Action] Seed fallback gallery memories into Supabase database.');
      const { error: seedError } = await (supabase as any)
        .from('gallery_items')
        .insert(STATIC_GALLERY_ITEMS);

      if (seedError) {
        console.error('[Server Action] Seeding gallery failed:', seedError.message);
        return [];
      }

      const { data: refetched } = await (supabase as any)
        .from('gallery_items')
        .select('*')
        .order('created_at', { ascending: false });

      return (refetched as GalleryItem[]) || [];
    }

    return data as GalleryItem[];
  } catch (err: any) {
    console.error('[Server Action] Exception while fetching gallery items:', err);
    return [];
  }
}

export async function createGalleryItemAction(item: Omit<GalleryItem, 'id' | 'created_at'>): Promise<{ success: boolean; data?: GalleryItem; error?: string }> {
  if (isMockSupabase()) {
    const mockItem: GalleryItem = {
      ...item,
      id: 'g-' + Date.now(),
      created_at: new Date().toISOString()
    };
    return { success: true, data: mockItem };
  }

  try {
    const { data, error } = await (supabase as any)
      .from('gallery_items')
      .insert({
        title: item.title,
        description: item.description,
        url: item.url,
        type: item.type,
        featured: item.featured !== undefined ? item.featured : false
      })
      .select()
      .single();

    if (error) {
      console.error('[Server Action] Failed to insert gallery item:', error.message);
      return { success: false, error: error.message };
    }

    return { success: true, data: data as GalleryItem };
  } catch (err: any) {
    console.error('[Server Action] Exception creating gallery item:', err);
    return { success: false, error: err?.message || 'Exception occurred' };
  }
}

export async function updateGalleryItemAction(id: string, updates: Partial<Omit<GalleryItem, 'id' | 'created_at'>>): Promise<{ success: boolean; data?: GalleryItem; error?: string }> {
  if (isMockSupabase()) {
    return { success: true, data: { id, ...updates } as any };
  }

  try {
    const { data, error } = await (supabase as any)
      .from('gallery_items')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('[Server Action] Failed to update gallery item:', error.message);
      return { success: false, error: error.message };
    }

    return { success: true, data: data as GalleryItem };
  } catch (err: any) {
    console.error('[Server Action] Exception updating gallery item:', err);
    return { success: false, error: err?.message || 'Exception occurred' };
  }
}

export async function deleteGalleryItemAction(id: string): Promise<{ success: boolean; error?: string }> {
  if (isMockSupabase()) {
    return { success: true };
  }

  try {
    const { error } = await (supabase as any)
      .from('gallery_items')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('[Server Action] Failed to delete gallery item:', error.message);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err: any) {
    console.error('[Server Action] Exception deleting gallery item:', err);
    return { success: false, error: err?.message || 'Exception occurred' };
  }
}
