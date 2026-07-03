/**
 * Server-side Cloudinary Client helper
 * Formulates signed URLs and handles storage operations.
 */

import { createHash } from 'crypto';

export class CloudinaryClient {
  private cloudName: string;
  private apiKey: string;
  private apiSecret: string;

  constructor() {
    this.cloudName = process.env.CLOUDINARY_CLOUD_NAME || '';
    this.apiKey = process.env.CLOUDINARY_API_KEY || '';
    this.apiSecret = process.env.CLOUDINARY_API_SECRET || '';
  }

  isConfigured(): boolean {
    return !!(this.cloudName && this.apiKey && this.apiSecret);
  }

  /**
   * Uploads a raw Buffer or Blob to Cloudinary (useful for PDFs generated in server context)
   */
  async uploadBuffer(buffer: Uint8Array | Buffer, folder: string = 'next-billionaire-path/documents', resourceType: 'image' | 'video' | 'raw' = 'image'): Promise<{ url: string, public_id: string } | null> {
    if (!this.isConfigured()) {
      console.warn('[CloudinaryClient]: Missing credentials. Skipping remote buffer upload.');
      return null;
    }

    try {
      const timestamp = Math.round(new Date().getTime() / 1000);
      const paramsToSign = {
        folder,
        timestamp,
      };

      const signature = this.generateSignature(paramsToSign);

      const formData = new FormData();
      // For fetch compatibility, we convert buffer to Blob
      const blob = new Blob([buffer]);
      formData.append('file', blob);
      formData.append('folder', folder);
      formData.append('timestamp', timestamp.toString());
      formData.append('api_key', this.apiKey);
      formData.append('signature', signature);

      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${this.cloudName}/${resourceType}/upload`,
        {
          method: 'POST',
          body: formData,
        }
      );

      const result = await response.json();
      if (!response.ok || !result.secure_url) {
        console.error('[CloudinaryClient] Buffer upload failed:', result);
        return null;
      }

      return {
        url: result.secure_url,
        public_id: result.public_id
      };
    } catch (e) {
      console.error('[CloudinaryClient] Buffer upload exception:', e);
      return null;
    }
  }

  /**
   * Generates a signature for Cloudinary upload or delete operations
   */
  generateSignature(paramsToSign: Record<string, any>): string {
    if (!this.apiSecret) {
      throw new Error('CLOUDINARY_API_SECRET is not configured.');
    }

    // Sort parameters alphabetically
    const sortedKeys = Object.keys(paramsToSign).sort();
    const parameterString = sortedKeys
      .map((key) => `${key}=${paramsToSign[key]}`)
      .join('&');

    // Append API secret to query string, then perform SHA-1 hashing
    const hash = createHash('sha1');
    hash.update(parameterString + this.apiSecret);
    return hash.digest('hex');
  }

  /**
   * Generates parameters for signed client-side uploads (helps to avoid exposing secret on client side)
   */
  getSignedUploadParams(folder: string = 'next-billionaire-path') {
    if (!this.isConfigured()) {
      return null;
    }

    const timestamp = Math.round(new Date().getTime() / 1000);
    const paramsToSign = {
      folder,
      timestamp,
    };

    const signature = this.generateSignature(paramsToSign);

    return {
      signature,
      timestamp,
      apiKey: this.apiKey,
      cloudName: this.cloudName,
      folder,
    };
  }

  /**
   * Deletes an asset from Cloudinary via Admin REST API
   */
  async deleteAsset(publicId: string, resourceType: 'image' | 'video' = 'image'): Promise<boolean> {
    if (!this.isConfigured()) {
      console.warn('[CloudinaryClient]: Missing credentials. Skipping remote delete (Mock Mode Successful).');
      return true;
    }

    try {
      const timestamp = Math.round(new Date().getTime() / 1000);
      const paramsToSign = {
        public_id: publicId,
        timestamp,
      };

      const signature = this.generateSignature(paramsToSign);

      const formData = new FormData();
      formData.append('public_id', publicId);
      formData.append('timestamp', timestamp.toString());
      formData.append('api_key', this.apiKey);
      formData.append('signature', signature);

      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${this.cloudName}/${resourceType}/destroy`,
        {
          method: 'POST',
          body: formData,
        }
      );

      const result = await response.json();
      if (!response.ok || result.result !== 'ok') {
        console.error('[CloudinaryClient] Destroy result failed:', result);
        return false;
      }

      return true;
    } catch (e) {
      console.error('[CloudinaryClient] Delete operation failed:', e);
      return false;
    }
  }
}

// Singleton helper that lazy loads
let cloudinaryClientInstance: CloudinaryClient | null = null;

export function getCloudinaryClient(): CloudinaryClient {
  if (!cloudinaryClientInstance) {
    cloudinaryClientInstance = new CloudinaryClient();
  }
  return cloudinaryClientInstance;
}
