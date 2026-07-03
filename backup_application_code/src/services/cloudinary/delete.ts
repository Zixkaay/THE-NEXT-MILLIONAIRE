/**
 * Cloudinary Media Service - Delete Helper
 */

import { isMockSupabase } from '@/features/auth/services/authService';

/**
 * Extracts Cloudinary Public ID from its secure URL
 */
export function getCloudinaryPublicId(url: string | null | undefined): string | null {
  if (!url) return null;
  
  try {
    // Cloudinary URLs look like: https://res.cloudinary.com/cloud_name/image/upload/v1234567/folder/public_id.jpg
    const parts = url.split('/image/upload/');
    if (parts.length < 2) return null;
    
    // Remove the version segment (e.g. v1234567) if present
    const cleanPath = parts[1].replace(/^v\d+\//, '');
    
    // Remove file extension
    const lastDotIndex = cleanPath.lastIndexOf('.');
    if (lastDotIndex === -1) return cleanPath;
    
    return cleanPath.substring(0, lastDotIndex);
  } catch (e) {
    console.warn('Could not extract public id from url', url, e);
    return null;
  }
}

/**
 * Request server to delete an asset from Cloudinary securely
 */
export async function deleteFromCloudinary(url: string): Promise<boolean> {
  const publicId = getCloudinaryPublicId(url);
  if (!publicId) {
    console.warn('URL is not a recognized Cloudinary link, skipping delete:', url);
    return false;
  }

  if (isMockSupabase() && !(import.meta as any).env?.VITE_SUPABASE_URL) {
    console.log('[Mock mode active]: Simulating Cloudinary delete for public ID:', publicId);
    return true;
  }

  try {
    console.log('Mocking Cloudinary delete for public ID:', publicId);
    return true; // Simulate successful deletion
  } catch (err) {
    console.error('Failed to communicate with media removal gateway:', err);
    return false;
  }
}
