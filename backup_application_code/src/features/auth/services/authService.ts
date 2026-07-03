import { supabase } from '@/lib/supabase';

// Helper to determine if we are running in mock or dynamic context
export const isMockSupabase = () => {
  const url = (import.meta as any).env?.VITE_SUPABASE_URL;
  return !url || url.includes('mock-supabase-url') || url === '';
};

export interface AdminUser {
  id: string;
  email: string;
  role: string;
  created_at?: string;
}

export const authService = {
  /**
   * Checks if an email is in the approved `admins` table
   */
  async isApprovedAdmin(email: string): Promise<boolean> {
    if (isMockSupabase()) {
      // In mock mode, we approve standard demo emails
      return ['techinventiveworks@gmail.com', 'admin@nbp.com', 'guest@nbp.com'].includes(email.toLowerCase());
    }

    try {
      const { data, error } = await supabase
        .from('admins' as any)
        .select('*')
        .eq('email', email.toLowerCase())
        .maybeSingle();

      if (error) {
        console.error('Error fetching admin record:', error);
        return false;
      }

      return !!data;
    } catch (err) {
      console.error('Failed to query admins table:', err);
      return false;
    }
  },

  /**
   * Sign in with Email & Password
   */
  async signInWithPassword(email: string, password: string): Promise<{ user: AdminUser | null; error: Error | null }> {
    const cleanEmail = email.trim();

    if (isMockSupabase()) {
      // Simulate successful sign in for demo emails with non-empty passwords
      if (!cleanEmail || !password) {
        return { user: null, error: new Error('Please fill in all fields') };
      }

      const isAdmin = await this.isApprovedAdmin(cleanEmail);
      if (!isAdmin) {
        return { 
          user: null, 
          error: new Error('Access Denied: Your email is not registered in the administrator database.') 
        };
      }

      const mockUser: AdminUser = {
        id: 'mock-admin-uid-1234',
        email: cleanEmail,
        role: cleanEmail === 'techinventiveworks@gmail.com' ? 'super_admin' : 'admin',
        created_at: new Date().toISOString()
      };

      // Store in localStorage for session preservation in mock mode
      localStorage.setItem('nbp_mock_admin_session', JSON.stringify(mockUser));

      return { user: mockUser, error: null };
    }

    try {
      // 1. Authenticate with Supabase Auth
      const { data, error } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password
      });

      if (error) {
        return { user: null, error };
      }

      if (!data.user || !data.user.email) {
        return { user: null, error: new Error('User authentication returned an invalid state.') };
      }

      // 2. Validate against approved admins table (RBAC Security)
      const isAdmin = await this.isApprovedAdmin(data.user.email);
      if (!isAdmin) {
        // Sign out immediately if they are authenticated but not designated as an admin
        await supabase.auth.signOut();
        return { 
          user: null, 
          error: new Error('Access Denied: You do not have permissions to access the Administration interfaces.') 
        };
      }

      // Fetch the role from the admins table
      const { data: adminData } = await (supabase as any)
        .from('admins')
        .select('role')
        .eq('email', data.user.email)
        .maybeSingle();

      const adminUser: AdminUser = {
        id: data.user.id,
        email: data.user.email,
        role: adminData ? (adminData as any).role : 'admin',
        created_at: data.user.created_at
      };

      return { user: adminUser, error: null };
    } catch (err: any) {
      return { user: null, error: err instanceof Error ? err : new Error(err?.message || 'Authentication failed') };
    }
  },

  /**
   * SignUp (Optional helper to self-provision admin account for testing)
   */
  async signUpAdmin(email: string, password: string): Promise<{ success: boolean; error: Error | null }> {
    const cleanEmail = email.trim();

    if (isMockSupabase()) {
      const isAdmin = await this.isApprovedAdmin(cleanEmail);
      if (!isAdmin) {
        return { success: false, error: new Error('Your email is not in the approved pre-registration list.') };
      }
      return { success: true, error: null };
    }

    try {
      // Verify email is in admins table before registering
      const isApproved = await this.isApprovedAdmin(cleanEmail);
      if (!isApproved) {
        return { 
          success: false, 
          error: new Error('This email is not approved in the admins whitelist. Please add it via SQL or database dashboard first.') 
        };
      }

      const { error } = await supabase.auth.signUp({
        email: cleanEmail,
        password,
        options: {
          emailRedirectTo: window.location.origin + '/administrator/login'
        }
      });

      if (error) {
        return { success: false, error };
      }

      return { success: true, error: null };
    } catch (err: any) {
      return { success: false, error: err instanceof Error ? err : new Error('Registration failed') };
    }
  },

  /**
   * Retrieve active session user
   */
  async getCurrentUser(): Promise<AdminUser | null> {
    if (isMockSupabase()) {
      const saved = localStorage.getItem('nbp_mock_admin_session');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {
          return null;
        }
      }
      return null;
    }

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session || !session.user || !session.user.email) {
        return null;
      }

      // Check if user is in admin schema
      const { data: adminData } = await (supabase as any)
        .from('admins')
        .select('*')
        .eq('email', session.user.email)
        .maybeSingle();

      if (!adminData) {
        return null;
      }

      return {
        id: session.user.id,
        email: session.user.email,
        role: (adminData as any).role || 'admin',
        created_at: session.user.created_at
      };
    } catch {
      return null;
    }
  },

  /**
   * Sign Out
   */
  async signOut(): Promise<void> {
    if (isMockSupabase()) {
      localStorage.removeItem('nbp_mock_admin_session');
      return;
    }

    await supabase.auth.signOut();
  }
};
