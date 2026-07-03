import { useSyncExternalStore } from 'react';

const mockSupabase = {
  from: (table: string) => ({
    select: () => Promise.resolve({ data: [], error: null }),
    insert: () => Promise.resolve({ data: null, error: null }),
    update: () => Promise.resolve({ data: null, error: null }),
    delete: () => Promise.resolve({ data: null, error: null }),
  }),
};

// Expose a dummy supabase client for standard usage, 
// using local state for actual logic in preview mode.
export const supabase = mockSupabase;

export const uploadToCloudinary = async (file: File) => {
  // Stub for cloudinary upload
  console.log('Uploading to cloudinary...', file.name);
  return new Promise<string>((resolve) => {
    setTimeout(() => {
      resolve(URL.createObjectURL(file));
    }, 1000);
  });
};

export const processPaystackPayment = async (amount: number, email: string) => {
  // Stub for paystack
  return new Promise<boolean>((resolve) => {
    setTimeout(() => {
      alert(`Paystack mock: Processed payment of $${amount} for ${email}`);
      resolve(true);
    }, 1000);
  });
}
