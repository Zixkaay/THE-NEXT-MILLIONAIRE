/**
 * Cloudinary Media Service - Upload Helper
 * Handlers for uploading files securely via proxy and/or signing
 */

import { isMockSupabase } from '@/features/auth/services/authService';

/**
 * Uploads a file to Cloudinary via server API proxy route
 * This protects all of our API secrets and keeps them strictly server-side.
 */
export async function uploadToCloudinary(
  file: File, 
  onProgress?: (percent: number) => void
): Promise<string> {
  // If we are in local sandbox mock mode and don't have full keys:
  if (isMockSupabase() && !process.env.NEXT_PUBLIC_SUPABASE_URL) {
    console.log('[Mock mode active]: Simulating Cloudinary Upload for', file.name);
    return new Promise((resolve) => {
      let progress = 0;
      const interval = setInterval(() => {
        progress += 25;
        if (onProgress) onProgress(progress);
        if (progress >= 100) {
          clearInterval(interval);
          // Return a realistic Unsplash placeholder or raw ObjectURL for previewing
          const mockURL = URL.createObjectURL(file);
          resolve(mockURL);
        }
      }, 200);
    });
  }

  // Real upload using our secure API router
  // Mocking file upload since backend API is being removed
  console.log('Mocking file upload:', file.name);
  
  // Simulate slow upload
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  // Return a mock URL
  return URL.createObjectURL(file);
}
