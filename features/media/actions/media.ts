'use server';

/**
 * Server Actions for central Cloudinary Media Library Management
 */

import { supabaseAdmin as supabase } from '@/lib/supabase';
import { DatabaseMediaLibrary } from '@/types/database';
import { getCloudinaryClient } from '@/services/cloudinary/client';
import { isMockSupabase } from '@/features/auth/services/authService';
import { verifyAdminSession } from '@/features/auth/services/serverAuth';

/**
 * Generates signed parameters for uploading to Cloudinary directly from the client.
 * This ensures secrets like CLOUDINARY_API_SECRET remain hidden on the server.
 */
export async function getCloudinaryUploadParamsAction(folder: string = 'next-billionaire-path') {
  const client = getCloudinaryClient();
  
  const fallback = {
    isMock: true,
    timestamp: Math.round(new Date().getTime() / 1000),
    folder,
    signature: '',
    apiKey: '',
    cloudName: '',
  };

  try {
    await verifyAdminSession();
    
    if (!client.isConfigured() || isMockSupabase()) {
      return fallback;
    }

    const params = client.getSignedUploadParams(folder);
    if (!params) {
      return fallback;
    }
    return {
      isMock: false,
      signature: params.signature,
      timestamp: params.timestamp,
      apiKey: params.apiKey,
      cloudName: params.cloudName,
      folder: params.folder,
    };
  } catch (error: any) {
    console.error('[MediaAction] Error generating signed upload params:', error);
    return fallback;
  }
}

/**
 * Fetches all media records currently registered in the database media library
 */
export async function getMediaLibraryAction(): Promise<DatabaseMediaLibrary[]> {
  if (isMockSupabase()) {
    // Generate dynamic or stable default mock items
    return [
      { id: 'm1', name: 'Hero Banner BG', url: 'https://images.unsplash.com/photo-1520095972714-909e91b05322?q=80&w=2000&auto=format&fit=crop', type: 'image', source: 'external', public_id: null, size_bytes: 450000, created_at: new Date().toISOString() },
      { id: 'm2', name: 'Audition Promo Video', url: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?q=80&w=1200&auto=format&fit=crop', type: 'video', source: 'external', public_id: null, size_bytes: 12500000, created_at: new Date().toISOString() }
    ];
  }

  try {
    const { data, error } = await (supabase as any)
      .from('media_library')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(error.message);
    }

    return (data || []) as DatabaseMediaLibrary[];
  } catch (error: any) {
    console.error('[MediaAction] Exception while fetching media library:', error);
    return [];
  }
}

/**
 * Adds a new asset to the media library
 */
export async function addMediaLibraryAction(payload: {
  name: string;
  url: string;
  public_id?: string | null;
  type: 'image' | 'video';
  source: 'device' | 'library' | 'external';
  size_bytes?: number;
}): Promise<{ success: boolean; data?: DatabaseMediaLibrary; message: string }> {
  if (isMockSupabase()) {
    const newItem: DatabaseMediaLibrary = {
      id: Math.random().toString(36).substr(2, 9),
      name: payload.name,
      url: payload.url,
      public_id: payload.public_id || null,
      type: payload.type,
      source: payload.source,
      size_bytes: payload.size_bytes || 0,
      created_at: new Date().toISOString()
    };
    return { success: true, data: newItem, message: 'Asset registered locally!' };
  }

  try {
    await verifyAdminSession();
    const itemPayload = {
      name: payload.name,
      url: payload.url,
      public_id: payload.public_id || null,
      type: payload.type,
      source: payload.source,
      size_bytes: payload.size_bytes || 0,
    };

    const { data, error } = await (supabase as any)
      .from('media_library')
      .insert([itemPayload])
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return { success: true, data: data as DatabaseMediaLibrary, message: 'Media asset successfully indexed.' };
  } catch (error: any) {
    console.error('[MediaAction] Exception during index insert:', error);
    return { success: false, message: error.message || 'Database registration error.' };
  }
}

/**
 * Permanently removes a media asset from Supabase and coordinates Cloudinary destroy
 */
export async function deleteMediaLibraryAction(id: string): Promise<{ success: boolean; message: string }> {
  if (isMockSupabase()) {
    return { success: true, message: 'Mock asset successfully unindexed.' };
  }

  try {
    await verifyAdminSession();
    // 1. Fetch record first to check if there is a Cloudinary public_id
    const { data: record, error: fetchError } = await (supabase as any)
      .from('media_library')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (fetchError || !record) {
      throw new Error(record ? fetchError.message : 'Asset not found in registry database.');
    }

    // 2. If it has a public_id and source is 'device' (uploaded to Cloudinary), call destroy on Cloudinary
    if (record.public_id && record.source === 'device') {
      const client = getCloudinaryClient();
      if (client.isConfigured()) {
        const deleted = await client.deleteAsset(record.public_id, record.type);
        if (!deleted) {
          console.warn(`[MediaAction] Warning: Cloudinary destruction returned failure for id "${record.public_id}". Still proceeding with DB row removal.`);
        }
      }
    }

    // 3. Delete DB record
    const { error: deleteError } = await (supabase as any)
      .from('media_library')
      .delete()
      .eq('id', id);

    if (deleteError) {
      throw new Error(deleteError.message);
    }

    return { success: true, message: 'Asset successfully deleted.' };
  } catch (error: any) {
    console.error('[MediaAction] Exception deleting media asset:', error);
    return { success: false, message: error.message || 'Cloud delete processing error.' };
  }
}
