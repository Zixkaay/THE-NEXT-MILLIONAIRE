'use server';

import { supabaseAdmin as supabase } from '@/lib/supabase';
import { isMockSupabase } from '@/features/auth/services/authService';

export interface Sponsor {
  id: string;
  name: string;
  logo_type: 'text' | 'image' | 'icon';
  logo_content: string;
}

const STATIC_SPONSORS: Sponsor[] = [
  { id: 's1', name: 'Logic Games', logo_type: 'image', logo_content: 'https://res.cloudinary.com/dnhz6xwjz/image/upload/v1782926764/SPONSOR_LOGIC_GAMES_tgm22x.jpg' },
  { id: 's2', name: 'WCED ENTERTAINMENT', logo_type: 'image', logo_content: 'https://res.cloudinary.com/dnhz6xwjz/image/upload/v1782926762/COMPANY_LOGO_ljuw9b.jpg' },
  { id: 's3', name: 'Buronic Trophy', logo_type: 'image', logo_content: 'https://res.cloudinary.com/dnhz6xwjz/image/upload/v1776865295/BuronicTROPHY_fbmby1.png' },
  { id: 's4', name: "BILLIONAIR'S PATH", logo_type: 'image', logo_content: 'https://res.cloudinary.com/dnhz6xwjz/image/upload/v1776840105/logo_ahkway.png' }
];

/**
 * Retrieves all homepage sponsors from database or falls back to static seed data
 */
export async function getSponsorsAction(): Promise<Sponsor[]> {
  if (isMockSupabase()) {
    return STATIC_SPONSORS;
  }

  try {
    const { data, error } = await (supabase as any)
      .from('sponsors')
      .select('*')
      .order('sort_order', { ascending: true });

    if (error) {
      console.error('[Server Action] Error querying public.sponsors table:', error.message);
      return STATIC_SPONSORS;
    }

    if (!data || data.length === 0) {
      console.info('[Server Action] No sponsors found. Pre-seeding sponsors into database.');
      
      const seedData = STATIC_SPONSORS.map((s, idx) => ({
        name: s.name,
        logo_url: s.logo_content, // logo_url column matches logo_content
        sort_order: idx,
        website_url: ''
      }));

      const { error: seedError } = await (supabase as any)
        .from('sponsors')
        .insert(seedData);

      if (seedError) {
        console.error('[Server Action] Seeding sponsors failed:', seedError.message);
        return STATIC_SPONSORS;
      }

      // Fetch newly seeded rows to obtain genuine UUIDs
      const { data: freshData } = await (supabase as any)
        .from('sponsors')
        .select('*')
        .order('sort_order', { ascending: true });

      if (freshData) {
        return freshData.map((row: any) => {
          let logo_type: 'text' | 'image' | 'icon' = 'image';
          if (row.logo_url.length <= 3) {
            logo_type = 'text';
          } else if (['shield', 'circle', 'trophy'].includes(row.logo_url)) {
            logo_type = 'icon';
          }
          return {
            id: row.id,
            name: row.name,
            logo_type,
            logo_content: row.logo_url
          };
        });
      }
      return STATIC_SPONSORS;
    }

    return data.map((row: any) => {
      let logo_type: 'text' | 'image' | 'icon' = 'image';
      if (row.logo_url.length <= 3) {
        logo_type = 'text';
      } else if (['shield', 'circle', 'trophy'].includes(row.logo_url)) {
        logo_type = 'icon';
      }
      return {
        id: row.id,
        name: row.name,
        logo_type,
        logo_content: row.logo_url
      };
    });

  } catch (err) {
    console.error('[Server Action] Exception while fetching sponsors:', err);
    return STATIC_SPONSORS;
  }
}
