/**
 * Cloudinary Media Service - Upload Helper
 * Handlers for uploading files securely via proxy and/or signing
 */

import { getCloudinaryUploadParamsAction } from '@/features/media/actions';

export interface CloudinaryUploadResult {
  url: string;
  public_id: string | null;
  bytes: number;
}

/**
 * Uploads a file to Cloudinary securely using a server-signed request.
 * This protects all of our API secrets and keeps them strictly server-side.
 */
export async function uploadToCloudinary(
  file: File, 
  onProgress?: (percent: number) => void
): Promise<CloudinaryUploadResult> {
  // 1. Grab signed parameters from Server Actions
  const params = await getCloudinaryUploadParamsAction();

  if (params.isMock) {
    console.log('[Mock mode active]: Simulating Cloudinary Upload for', file.name);
    return new Promise((resolve) => {
      let progress = 0;
      const interval = setInterval(() => {
        progress += 20;
        if (onProgress) onProgress(progress);
        if (progress >= 100) {
          clearInterval(interval);
          // Create object URL for local blob presentation or fallback Unsplash
          const mockURL = URL.createObjectURL(file);
          resolve({
            url: mockURL,
            public_id: `mock_${Math.random().toString(36).substr(2, 9)}`,
            bytes: file.size
          });
        }
      }, 150);
    });
  }

  // 2. Determine resource type (image or video)
  const resourceType = file.type.startsWith('video/') ? 'video' : 'image';

  // 3. Prepare FormData payload
  const formData = new FormData();
  formData.append('file', file);
  formData.append('timestamp', params.timestamp!.toString());
  formData.append('api_key', params.apiKey!);
  formData.append('signature', params.signature!);
  formData.append('folder', params.folder!);

  // 4. Perform upload with native progress tracking
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    const uploadUrl = `https://api.cloudinary.com/v1_1/${params.cloudName}/${resourceType}/upload`;
    
    xhr.open('POST', uploadUrl);

    if (onProgress) {
      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) {
          const percent = Math.round((e.loaded / e.total) * 100);
          onProgress(percent);
        }
      };
    }

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const response = JSON.parse(xhr.responseText);
          resolve({
            url: response.secure_url,
            public_id: response.public_id,
            bytes: response.bytes || file.size
          });
        } catch (err) {
          reject(new Error('Failed to parse Cloudinary JSON response.'));
        }
      } else {
        console.error('[Cloudinary] Upload response error:', xhr.status, xhr.responseText);
        reject(new Error(`Cloudinary responded with status ${xhr.status}: ${xhr.responseText}`));
      }
    };

    xhr.onerror = () => {
      reject(new Error('Network connection error while uploading to Cloudinary.'));
    };

    xhr.send(formData);
  });
}
