import { cookies } from 'next/headers';
import { AdminUser } from './authService';

/**
 * Retrieves the current admin session from cookies in a server context (Actions/API Routes)
 */
export async function getAdminSession(): Promise<AdminUser | null> {
  try {
    const cookieStore = await cookies();
    const adminSessionString = cookieStore.get('nbp_admin_session')?.value;

    if (!adminSessionString) {
      return null;
    }

    const user = JSON.parse(decodeURIComponent(adminSessionString));
    
    // Basic validation that it's an admin
    if (user && (user.role === 'admin' || user.role === 'super_admin') && user.email) {
      return user;
    }

    return null;
  } catch (e) {
    console.error('[ServerAuth]: Failed to parse admin session cookie', e);
    return null;
  }
}

/**
 * Throws an error if the current session is not an authorized admin
 */
export async function verifyAdminSession(): Promise<AdminUser> {
  const session = await getAdminSession();
  if (!session) {
    throw new Error('Unauthorized: Admin session required for this operation.');
  }
  return session;
}
