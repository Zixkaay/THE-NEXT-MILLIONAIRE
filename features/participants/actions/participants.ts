'use server';

/**
 * Server Actions for Participant Lifecycle and Ranking Management
 */

import { supabaseAdmin as supabase } from '@/lib/supabase';
import { DatabaseParticipant, ParticipantStatus, RankingTier } from '@/types/database';
import { isMockSupabase } from '@/features/auth/services/authService';
import { INITIAL_PARTICIPANTS } from '@/data/staticContent';

// In-memory server-side mock cache of participants during simulation mode
let mockParticipantsCached: DatabaseParticipant[] = [...INITIAL_PARTICIPANTS];

/**
 * Retrieves all registered participants from Supabase (or seeds/fallbacks)
 */
export async function getParticipantsAction(): Promise<DatabaseParticipant[]> {
  if (isMockSupabase()) {
    return mockParticipantsCached.filter(p => !p.deleted_at);
  }

  try {
    const { data, error } = await (supabase as any)
      .from('participants')
      .select('*')
      .is('deleted_at', null)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[Server Action] Error querying public.participants table:', error.message);
      return [];
    }

    // Seed if empty to simulate preloaded profiles
    if (!data || data.length === 0) {
      console.info('[Server Action] No participants found. Pre-seeding static participant profiles into database.');
      
      const seedData = INITIAL_PARTICIPANTS.map(p => ({
        id: p.id,
        full_name: p.full_name,
        nickname: p.nickname,
        bio: p.bio,
        status: p.status,
        ranking: p.ranking,
        vote_count: p.vote_count,
        media_urls: p.media_urls,
        metadata: p.metadata,
        created_at: p.created_at,
        updated_at: p.updated_at
      }));

      const { error: seedError } = await (supabase as any)
        .from('participants')
        .insert(seedData);

      if (seedError) {
        console.error('[Server Action] Seeding failed:', seedError.message);
      } else {
        return seedData as unknown as DatabaseParticipant[];
      }
    }

    return data as unknown as DatabaseParticipant[];
  } catch (err: any) {
    console.error('[Server Action] Exception while fetching participants:', err);
    return [];
  }
}

/**
 * Updates a participant's status
 */
export async function updateParticipantStatusAction(id: string, status: ParticipantStatus) {
  if (isMockSupabase()) {
    mockParticipantsCached = mockParticipantsCached.map(p => 
      p.id === id ? { ...p, status, updated_at: new Date().toISOString() } : p
    );
    return { success: true, message: `Participant status successfully updated to ${status} in mock memory.` };
  }

  try {
    const { error } = await (supabase as any)
      .from('participants')
      .update({
        status,
        updated_at: new Date().toISOString()
      })
      .eq('id', id);

    if (error) {
      throw new Error(error.message);
    }

    return { success: true, message: `Participant status upgraded to ${status} in Supabase.` };
  } catch (err: any) {
    console.error('[Server Action] Exception updating participant status:', err);
    return { success: false, error: true, message: err.message || 'Operation failed' };
  }
}

/**
 * Updates a participant's ranking tier
 */
export async function updateParticipantRankingAction(id: string, ranking: RankingTier | null) {
  if (isMockSupabase()) {
    mockParticipantsCached = mockParticipantsCached.map(p => {
      if (ranking !== null && p.ranking === ranking && p.id !== id) {
        return { ...p, ranking: null, updated_at: new Date().toISOString() };
      }
      if (p.id === id) {
        return { ...p, ranking, updated_at: new Date().toISOString() };
      }
      return p;
    });
    return { success: true, message: `Ranking updated to ${ranking === null ? 'unranked' : ranking} in mock memory.` };
  }

  try {
    // If a rank is supplied, clear any prior holder of that position
    if (ranking !== null) {
      const { error: clearError } = await (supabase as any)
        .from('participants')
        .update({ ranking: null, updated_at: new Date().toISOString() })
        .eq('ranking', ranking);

      if (clearError) {
        console.warn('[Server Action] Error unsetting prior holder of rank:', clearError.message);
      }
    }

    // Set the new rank
    const { error } = await (supabase as any)
      .from('participants')
      .update({
        ranking,
        updated_at: new Date().toISOString()
      })
      .eq('id', id);

    if (error) {
      throw new Error(error.message);
    }

    return { success: true, message: `Ranking position allocated successfully.` };
  } catch (err: any) {
    console.error('[Server Action] Exception updating participant ranking:', err);
    return { success: false, error: true, message: err.message || 'Operation failed' };
  }
}

/**
 * Removes/Deletes a participant
 */
export async function deleteParticipantAction(id: string) {
  if (isMockSupabase()) {
    mockParticipantsCached = mockParticipantsCached.map(p => 
      p.id === id ? { ...p, deleted_at: new Date().toISOString() } : p
    );
    return { success: true, message: 'Participant successfully soft-deleted in mock memory.' };
  }

  try {
    // Phase 2 implementation requirement: Soft delete participants
    const { error } = await (supabase as any)
      .from('participants')
      .update({
        deleted_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', id);

    if (error) {
      throw new Error(error.message);
    }

    return { success: true, message: 'Participant successfully soft-deleted.' };
  } catch (err: any) {
    console.error('[Server Action] Exception deleting participant:', err);
    return { success: false, error: true, message: err.message || 'Soft delete operation failed' };
  }
}

/**
 * Retrieves a single participant by ID
 */
export async function getSingleParticipantAction(id: string): Promise<DatabaseParticipant | null> {
  if (isMockSupabase()) {
    const p = mockParticipantsCached.find(item => item.id === id);
    if (!p || p.deleted_at) return null;
    return p;
  }

  try {
    const { data, error } = await (supabase as any)
      .from('participants')
      .select('*')
      .eq('id', id)
      .is('deleted_at', null)
      .maybeSingle();

    if (error) {
      console.error('[Server Action] Error querying single participant:', error.message);
      return null;
    }

    return data as unknown as DatabaseParticipant;
  } catch (err) {
    console.error('[Server Action] Exception reading single participant detail:', err);
    return null;
  }
}

/**
 * Retrieves approved media items for a participant
 */
export async function getApprovedParticipantMediaAction(participantId: string): Promise<any[]> {
  if (isMockSupabase()) {
    return [
      {
        id: `pm-${participantId}-1`,
        participant_id: participantId,
        media_type: 'image',
        url: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?q=80&w=800&auto=format&fit=crop',
        is_approved: true,
        created_at: new Date().toISOString()
      },
      {
        id: `pm-${participantId}-2`,
        participant_id: participantId,
        media_type: 'image',
        url: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?q=80&w=800&auto=format&fit=crop',
        is_approved: true,
        created_at: new Date().toISOString()
      },
      {
        id: `pm-${participantId}-3`,
        participant_id: participantId,
        media_type: 'image',
        url: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?q=80&w=800&auto=format&fit=crop',
        is_approved: true,
        created_at: new Date().toISOString()
      },
      {
        id: `pm-${participantId}-4`,
        participant_id: participantId,
        media_type: 'image',
        url: 'https://images.unsplash.com/photo-1592652495393-4a11f26a8ac0?q=80&w=800&auto=format&fit=crop',
        is_approved: true,
        created_at: new Date().toISOString()
      }
    ];
  }

  try {
    const { data, error } = await (supabase as any)
      .from('participant_media')
      .select('*')
      .eq('participant_id', participantId)
      .eq('is_approved', true)
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('[Server Action] Error fetching approved media items:', error.message);
      return [];
    }

    return data || [];
  } catch (err) {
    console.error('[Server Action] Exception finding approved participant media:', err);
    return [];
  }
}
