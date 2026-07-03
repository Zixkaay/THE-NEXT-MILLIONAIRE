'use server';

import { supabaseAdmin as supabase } from '@/lib/supabase';
import { DatabaseBlogPost as BlogPost } from '@/types/database';
import { isMockSupabase } from '@/features/auth/services/authService';

const STATIC_BLOG_POSTS: BlogPost[] = [
  {
    id: 'b1',
    title: 'The Golden Standard: Accra Edition Commences',
    slug: 'golden-standard-accra-commences',
    excerpt: 'The Next Billionaire Path has officially launched its highly anticipated season in Accra, Ghana, bringing together the most brilliant young minds in business.',
    content: 'The journey to find the Next Billionaire has officially begun in the pulsing heart of West Africa: Accra, Ghana. Thousands of young Ghanaian innovators applied, but only a select few made it to the Master Gallery.\n\nThe competition will run for several intensive chapters where participants must prove their market viability, pitch to elite investors, and, most importantly, secure the raw financial vote of the public.\n\n"We are not looking for ordinary businesses; we are looking for absolute disruption," said the lead organizer. The initial data shows massive support for Tech and AgriTech, but Fashion is catching up. Keep an eye on the leaders.',
    image_url: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?q=80&w=1200&auto=format&fit=crop',
    category_id: null,
    is_published: true,
    is_featured: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'b2',
    title: 'How Ghanaian Youth are Redefining Wealth',
    slug: 'how-ghanaian-youth-redefine-wealth',
    excerpt: 'From the streets of Kumasi to the boardrooms of Ridge, young entrepreneurs are building sustainable, tech-driven empires.',
    content: 'Gone are the days when wealth meant traditional imports. The new generation of Ghanaian youth is building wealth through code, sustainability, and cross-border innovation. The participants in the Next Billionaire Path reflect this shift vividly.\n\nWith access to digital payment rails and a growing smartphone economy, micro-SMEs are scaling 10x faster than traditional brick-and-mortar stores. This shift is clearly represented by our contestants.',
    image_url: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?q=80&w=1200&auto=format&fit=crop',
    category_id: null,
    is_published: true,
    is_featured: true,
    created_at: new Date(Date.now() - 86400000).toISOString(),
    updated_at: new Date(Date.now() - 86400000).toISOString()
  },
  {
    id: 'b3',
    title: 'The Rise of AgriTech in the Northern Regions',
    slug: 'rise-of-agritech-northern-regions',
    excerpt: 'Technology meets tradition as young founders tackle food security through smart farming solutions.',
    content: 'Agriculture has always been the backbone of Ghana\'s economy. However, recent data from the Next Billionaire Path auditions shows a massive influx of "Smart Farming" platforms coming primarily from Tamale and surrounding districts.\n\nFounders are utilizing drone logistics, soil AI, and direct-to-market USSD codes to cut out middlemen and empower rural farmers. One standout competitor stated that their ultimate goal is to turn local produce into globally traded commodities within five years.',
    image_url: 'https://images.unsplash.com/photo-1592652495393-4a11f26a8ac0?q=80&w=1200&auto=format&fit=crop',
    category_id: null,
    is_published: true,
    is_featured: false,
    created_at: new Date(Date.now() - 172800000).toISOString(),
    updated_at: new Date(Date.now() - 172800000).toISOString()
  },
  {
    id: 'b4',
    title: 'FinTech Founders Dominate Phase 1 Votes',
    slug: 'fintech-dominate-phase-1-votes',
    excerpt: 'Public voting indicates strong support for digital finance architectures and lending infrastructure platforms.',
    content: 'If the first wave of public voting is anything to go by, ordinary Ghanaians are heavily backing FinTech solutions. Access to credit and frictionless cross-border payments remain critical pain points. \n\nWe have observed a significant funding injection into contestants pitching decentralized finance systems that integrate directly with existing mobile money operator networks.',
    image_url: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?q=80&w=1200&auto=format&fit=crop',
    category_id: null,
    is_published: true,
    is_featured: false,
    created_at: new Date(Date.now() - 259200000).toISOString(),
    updated_at: new Date(Date.now() - 259200000).toISOString()
  }
];

// In-memory server-side mock cache of blog posts during simulation mode
let mockBlogPostsCached: BlogPost[] = [...STATIC_BLOG_POSTS];

export async function getBlogPostsAction(): Promise<BlogPost[]> {
  if (isMockSupabase()) {
    return mockBlogPostsCached.filter(p => !p.deleted_at);
  }

  try {
    const { data, error } = await (supabase as any)
      .from('blog_posts')
      .select('*')
      .is('deleted_at', null)
      .order('is_featured', { ascending: false })
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[Server Action] Error querying public.blog_posts table:', error.message);
      return STATIC_BLOG_POSTS.filter(p => !p.deleted_at);
    }

    if (!data || data.length === 0) {
      console.info('[Server Action] No blog posts found. Pre-seeding articles into database.');
      
      const seedData = STATIC_BLOG_POSTS.map(p => ({
        title: p.title,
        slug: p.slug,
        excerpt: p.excerpt,
        content: p.content,
        image_url: p.image_url,
        is_published: p.is_published,
        is_featured: p.is_featured,
        created_at: p.created_at,
        updated_at: p.updated_at
      }));

      const { error: seedError } = await (supabase as any)
        .from('blog_posts')
        .insert(seedData);

      if (seedError) {
        console.error('[Server Action] Seeding blog posts failed:', seedError.message);
        return STATIC_BLOG_POSTS;
      }

      const { data: freshData } = await (supabase as any)
        .from('blog_posts')
        .select('*')
        .is('deleted_at', null)
        .order('is_featured', { ascending: false })
        .order('created_at', { ascending: false });

      if (freshData) {
        return freshData as BlogPost[];
      }
      return STATIC_BLOG_POSTS;
    }

    return data as BlogPost[];
  } catch (err) {
    console.error('[Server Action] Exception while fetching blog posts:', err);
    return STATIC_BLOG_POSTS;
  }
}

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '') + '-' + Math.floor(100 + Math.random() * 900);
}

export async function createBlogPostAction(post: Omit<BlogPost, 'id' | 'created_at' | 'updated_at' | 'slug'> & { title: string }): Promise<{ success: boolean; data?: BlogPost; error?: string }> {
  const slug = generateSlug(post.title);
  const now = new Date().toISOString();

  if (isMockSupabase()) {
    const mockPost: BlogPost = {
      ...post,
      id: 'b' + Date.now(),
      slug,
      created_at: now,
      updated_at: now
    };
    mockBlogPostsCached.push(mockPost);
    return { success: true, data: mockPost };
  }

  try {
    const { data, error } = await (supabase as any)
      .from('blog_posts')
      .insert({
        title: post.title,
        slug,
        excerpt: post.excerpt || '',
        content: post.content || '',
        image_url: post.image_url || '',
        is_published: post.is_published !== undefined ? post.is_published : true,
        is_featured: post.is_featured !== undefined ? post.is_featured : false,
        category_id: post.category_id || null,
        created_at: now,
        updated_at: now
      })
      .select()
      .single();

    if (error) {
      console.error('[Server Action] Failed to insert blog post:', error.message);
      return { success: false, error: error.message };
    }

    return { success: true, data: data as BlogPost };
  } catch (err: any) {
    console.error('[Server Action] Exception creating blog post:', err);
    return { success: false, error: err?.message || 'Exception occurred' };
  }
}

export async function updateBlogPostAction(id: string, updates: Partial<Omit<BlogPost, 'id' | 'created_at' | 'updated_at'>>): Promise<{ success: boolean; data?: BlogPost; error?: string }> {
  const now = new Date().toISOString();
  
  const patchedUpdates: any = {
    ...updates,
    updated_at: now
  };
  if (updates.title) {
    patchedUpdates.slug = generateSlug(updates.title);
  }

  if (isMockSupabase()) {
    let matched: BlogPost | null = null;
    mockBlogPostsCached = mockBlogPostsCached.map(p => {
      if (p.id === id) {
        const updatedPost = { ...p, ...patchedUpdates } as BlogPost;
        matched = updatedPost;
        return updatedPost;
      }
      return p;
    });
    return { success: true, data: matched || ({ id, ...patchedUpdates } as any) };
  }

  try {
    const { data, error } = await (supabase as any)
      .from('blog_posts')
      .update(patchedUpdates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('[Server Action] Failed to update blog post:', error.message);
      return { success: false, error: error.message };
    }

    return { success: true, data: data as BlogPost };
  } catch (err: any) {
    console.error('[Server Action] Exception updating blog post:', err);
    return { success: false, error: err?.message || 'Exception occurred' };
  }
}

export async function deleteBlogPostAction(id: string): Promise<{ success: boolean; error?: string }> {
  if (isMockSupabase()) {
    mockBlogPostsCached = mockBlogPostsCached.map(p =>
      p.id === id ? { ...p, deleted_at: new Date().toISOString() } : p
    );
    return { success: true };
  }

  try {
    const { error } = await (supabase as any)
      .from('blog_posts')
      .update({
        deleted_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', id);

    if (error) {
      console.error('[Server Action] Failed to delete blog post:', error.message);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err: any) {
    console.error('[Server Action] Exception deleting blog post:', err);
    return { success: false, error: err?.message || 'Exception occurred' };
  }
}
