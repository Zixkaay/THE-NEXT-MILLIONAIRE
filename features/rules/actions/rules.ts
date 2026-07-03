'use server';

import { supabaseAdmin as supabase } from '@/lib/supabase';
import { DatabaseWeeklyRule, DatabaseGeneralRule } from '@/types/database';
import { isMockSupabase } from '@/features/auth/services/authService';

let mockWeeklyRulesCache: DatabaseWeeklyRule[] = [
  {
    id: 'w-rule-1',
    title: 'Audition & Profile Creation',
    description: 'Contestants compile robust biographies, upload high-quality profile photos, and optional brief pitch videos showing why they are the next billionaire.',
    week_number: 1,
    is_active: true,
    created_at: new Date().toISOString()
  },
  {
    id: 'w-rule-2',
    title: 'Regional Center Audition Assays',
    description: 'A physical evaluation at Hub Centers located in Kumasi and Accra to review business mockups, financial structures, and target deliverables.',
    week_number: 2,
    is_active: false,
    created_at: new Date().toISOString()
  },
  {
    id: 'w-rule-3',
    title: 'Standings Progression & Public Voting',
    description: 'The secure Paystack public voting window launches. Fans and stakeholders cast monetized votes to build momentum on the global leaderboard.',
    week_number: 3,
    is_active: false,
    created_at: new Date().toISOString()
  },
  {
    id: 'w-rule-4',
    title: 'Grand Billionaire Finale & Pitch Show',
    description: 'The top contestants deliver final business models to our international board of adjudicators. Gold, silver, and bronze medallions are awarded.',
    week_number: 4,
    is_active: false,
    created_at: new Date().toISOString()
  }
];

let mockGeneralRulesCache: DatabaseGeneralRule[] = [
  {
    id: 'g-rule-1',
    title: 'Registration & Authenticity Guard',
    content: 'All registering contestants must accurately outline biological fields and submit valid contact details. Entries that do not fulfill these standards will be instantly flagged or evicted.',
    sort_order: 1,
    created_at: new Date().toISOString()
  },
  {
    id: 'g-rule-2',
    title: 'Monetized Voting Integrity',
    content: 'Votes must only be credited through certified Paystack webhook callbacks. Front-facing successful triggers do not contribute to contestant standing.',
    sort_order: 2,
    created_at: new Date().toISOString()
  },
  {
    id: 'g-rule-3',
    title: 'No Code Duplication & Verification Rules',
    content: 'Contestants cannot submit multiple files using identical billing details. The system enforces unique transaction ids to verify integrity.',
    sort_order: 3,
    created_at: new Date().toISOString()
  }
];

let mockTermsAndConditionsCache = `# THE NEXT BILLIONAIRE PATH TERMS OF SERVICE

Welcome to **The Next Billionaire Path** ("the Platform"). By accessing the application, registering as an active contestant, or casting votes, you agree to comply with the terms and conditions outlined below.

## 1. Eligibility Requirements
* Contestants must be 18 years or older at the time of registration.
* All business ideas and submissions must be original works of the contestant.
* Submissions containing copied trademarks or fraudulent references are disqualified without refund.

## 2. Dynamic Registration & Fees
* Registration fees are processed securely via Paystack.
* Registration payments are **non-refundable** once processed and confirmed by the automated billing webhook.
* Profiles will remain in the "registered" or "pending" phases until registration fee confirmation is executed.

## 3. Verified Monetized Voting
* All votes are counted based on GHC-denominated transactions.
* Duplicate vote requests or front-end spoofing queries will have their corresponding votes rejected inside server security layers.
* The system is empowered to audit and disqualify contestants engaging in inauthentic traffic allocation.

## 4. Platform Media Rules
* All files uploaded to user profiles must have valid licenses.
* High-definition images and videos are securely stored in our Cloudinary media catalog.
* The administration reserves absolute rights to approve, hide, or delete entries breaching decency rules.`;

/* ==========================================================================
   WEEKLY RULES METHODS
   ========================================================================== */

export async function getWeeklyRulesAction(): Promise<DatabaseWeeklyRule[]> {
  if (isMockSupabase()) {
    return [...mockWeeklyRulesCache].sort((a, b) => a.week_number - b.week_number);
  }

  try {
    const { data, error } = await (supabase as any)
      .from('weekly_rules')
      .select('*')
      .order('week_number', { ascending: true });

    if (error) {
      console.warn('[RulesAction] Error reading weekly rules from database:', error.message);
      return [];
    }
    return data || [];
  } catch (err) {
    console.error('[RulesAction] Weekly rules exception:', err);
    return [];
  }
}

export async function createWeeklyRuleAction(payload: {
  title: string;
  description: string;
  week_number: number;
  is_active: boolean;
}) {
  if (isMockSupabase()) {
    const newRule: DatabaseWeeklyRule = {
      id: `w-rule-${Date.now()}`,
      title: payload.title,
      description: payload.description,
      week_number: Number(payload.week_number),
      is_active: !!payload.is_active,
      created_at: new Date().toISOString()
    };
    mockWeeklyRulesCache.push(newRule);
    return { success: true, message: 'Weekly rule added successfully (Mock Mode)', data: newRule };
  }

  try {
    const { data, error } = await (supabase as any)
      .from('weekly_rules')
      .insert({
        title: payload.title,
        description: payload.description,
        week_number: Number(payload.week_number),
        is_active: !!payload.is_active
      })
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }
    return { success: true, message: 'Weekly rule added successfully to database.', data };
  } catch (err: any) {
    console.error('[RulesAction] Create weekly rule exception:', err);
    return { error: true, success: false, message: err.message || 'Failed to create rule.' };
  }
}

export async function updateWeeklyRuleAction(id: string, payload: Partial<Omit<DatabaseWeeklyRule, 'id' | 'created_at'>>) {
  if (isMockSupabase()) {
    mockWeeklyRulesCache = mockWeeklyRulesCache.map(r => {
      if (r.id === id) {
        return {
          ...r,
          ...payload,
          week_number: payload.week_number !== undefined ? Number(payload.week_number) : r.week_number,
          is_active: payload.is_active !== undefined ? !!payload.is_active : r.is_active
        };
      }
      return r;
    });
    return { success: true, message: 'Weekly rule updated successfully (Mock Mode)' };
  }

  try {
    const { error } = await (supabase as any)
      .from('weekly_rules')
      .update(payload)
      .eq('id', id);

    if (error) {
      throw new Error(error.message);
    }
    return { success: true, message: 'Weekly rule modified in database.' };
  } catch (err: any) {
    console.error('[RulesAction] Update weekly rule exception:', err);
    return { error: true, success: false, message: err.message || 'Failed to modify weekly rule.' };
  }
}

export async function deleteWeeklyRuleAction(id: string) {
  if (isMockSupabase()) {
    mockWeeklyRulesCache = mockWeeklyRulesCache.filter(r => r.id !== id);
    return { success: true, message: 'Weekly rule purged from cache (Mock Mode)' };
  }

  try {
    const { error } = await (supabase as any)
      .from('weekly_rules')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(error.message);
    }
    return { success: true, message: 'Weekly rule purged from database.' };
  } catch (err: any) {
    console.error('[RulesAction] Delete weekly rule exception:', err);
    return { error: true, success: false, message: err.message || 'Failed to delete rule.' };
  }
}

/* ==========================================================================
   GENERAL RULES METHODS
   ========================================================================== */

export async function getGeneralRulesAction(): Promise<DatabaseGeneralRule[]> {
  if (isMockSupabase()) {
    return [...mockGeneralRulesCache].sort((a, b) => a.sort_order - b.sort_order);
  }

  try {
    const { data, error } = await (supabase as any)
      .from('general_rules')
      .select('*')
      .order('sort_order', { ascending: true });

    if (error) {
      console.warn('[RulesAction] Error querying general rules:', error.message);
      return [];
    }
    return data || [];
  } catch (err) {
    console.error('[RulesAction] General rules exception:', err);
    return [];
  }
}

export async function createGeneralRuleAction(payload: {
  title: string;
  content: string;
  sort_order: number;
}) {
  if (isMockSupabase()) {
    const newRule: DatabaseGeneralRule = {
      id: `g-rule-${Date.now()}`,
      title: payload.title,
      content: payload.content,
      sort_order: Number(payload.sort_order),
      created_at: new Date().toISOString()
    };
    mockGeneralRulesCache.push(newRule);
    return { success: true, message: 'General rule added successfully (Mock Mode)', data: newRule };
  }

  try {
    const { data, error } = await (supabase as any)
      .from('general_rules')
      .insert({
        title: payload.title,
        content: payload.content,
        sort_order: Number(payload.sort_order)
      })
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }
    return { success: true, message: 'General rule created successfully.', data };
  } catch (err: any) {
    console.error('[RulesAction] Create general rule exception:', err);
    return { error: true, success: false, message: err.message || 'Failed to create general rule.' };
  }
}

export async function updateGeneralRuleAction(id: string, payload: Partial<Omit<DatabaseGeneralRule, 'id' | 'created_at'>>) {
  if (isMockSupabase()) {
    mockGeneralRulesCache = mockGeneralRulesCache.map(r => {
      if (r.id === id) {
        return {
          ...r,
          ...payload,
          sort_order: payload.sort_order !== undefined ? Number(payload.sort_order) : r.sort_order
        };
      }
      return r;
    });
    return { success: true, message: 'General rule updated in cache (Mock Mode)' };
  }

  try {
    const { error } = await (supabase as any)
      .from('general_rules')
      .update(payload)
      .eq('id', id);

    if (error) {
      throw new Error(error.message);
    }
    return { success: true, message: 'General rule modified in database.' };
  } catch (err: any) {
    console.error('[RulesAction] Update general rule exception:', err);
    return { error: true, success: false, message: err.message || 'Failed to update general rule.' };
  }
}

export async function deleteGeneralRuleAction(id: string) {
  if (isMockSupabase()) {
    mockGeneralRulesCache = mockGeneralRulesCache.filter(r => r.id !== id);
    return { success: true, message: 'General rule deleted (Mock Mode)' };
  }

  try {
    const { error } = await (supabase as any)
      .from('general_rules')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(error.message);
    }
    return { success: true, message: 'General rule deleted from database.' };
  } catch (err: any) {
    console.error('[RulesAction] Delete general rule exception:', err);
    return { error: true, success: false, message: err.message || 'Failed to delete general rule.' };
  }
}

/* ==========================================================================
   TERMS & CONDITIONS METHODS
   ========================================================================== */

export async function getTermsAndConditionsAction(): Promise<string> {
  if (isMockSupabase()) {
    return mockTermsAndConditionsCache;
  }

  try {
    const { data, error } = await (supabase as any)
      .from('general_rules')
      .select('*')
      .eq('id', 'terms-conditions-static')
      .maybeSingle();

    if (error) {
      console.warn('[RulesAction] Terms data reading failed:', error.message);
      return mockTermsAndConditionsCache;
    }

    if (data) {
      return data.content;
    }

    await (supabase as any)
      .from('general_rules')
      .upsert({
        id: 'terms-conditions-static',
        title: 'Terms & Conditions',
        content: mockTermsAndConditionsCache,
        sort_order: 9999,
        created_at: new Date().toISOString()
      });

    return mockTermsAndConditionsCache;
  } catch (err) {
    console.error('[RulesAction] Fetching terms & conditions failed:', err);
    return mockTermsAndConditionsCache;
  }
}

export async function updateTermsAndConditionsAction(content: string) {
  if (isMockSupabase()) {
    mockTermsAndConditionsCache = content;
    return { success: true, message: 'Terms & Conditions modified locally (Mock Mode).' };
  }

  try {
    const { error } = await (supabase as any)
      .from('general_rules')
      .upsert({
        id: 'terms-conditions-static',
        title: 'Terms & Conditions',
        content,
        sort_order: 9999,
        created_at: new Date().toISOString()
      });

    if (error) {
      throw new Error(error.message);
    }
    return { success: true, message: 'Terms & Conditions written to system registry.' };
  } catch (err: any) {
    console.error('[RulesAction] Terms update failed:', err);
    return { error: true, success: false, message: err.message || 'Failed to modify Terms & Conditions.' };
  }
}
