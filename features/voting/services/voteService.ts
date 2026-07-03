'use server';

import { supabaseAdmin as supabase } from '@/lib/supabase';
import { DatabaseVoteTransaction } from '@/types/database';

export async function createVoteTransaction(payload: {
  participant_id: string;
  vote_count: number;
  amount: number;
  payment_reference: string;
}) {
  const { data, error } = await (supabase as any)
    .from('vote_transactions')
    .insert({
      participant_id: payload.participant_id,
      vote_count: payload.vote_count,
      amount: payload.amount,
      payment_reference: payload.payment_reference,
      processed: false
    })
    .select()
    .single();

  if (error) throw error;
  return data as DatabaseVoteTransaction;
}

export async function processVoteTransaction(reference: string) {
  // 1. Get transaction
  const { data: transaction, error: txError } = await (supabase as any)
    .from('vote_transactions')
    .select('*')
    .eq('payment_reference', reference)
    .single();

  if (txError || !transaction || transaction.processed) return;

  // 2. Increment participant votes
  const { data: participant, error: pGetError } = await (supabase as any)
    .from('participants')
    .select('vote_count')
    .eq('id', transaction.participant_id)
    .single();

  if (pGetError) throw pGetError;

  const { error: pUpdateError } = await (supabase as any)
    .from('participants')
    .update({ vote_count: participant.vote_count + transaction.vote_count })
    .eq('id', transaction.participant_id);

  if (pUpdateError) throw pUpdateError;

  // 3. Mark transaction as processed
  await (supabase as any)
    .from('vote_transactions')
    .update({ processed: true })
    .eq('id', transaction.id);
  
  // 4. Record the vote in votes table
  await (supabase as any)
    .from('votes')
    .insert({
      participant_id: transaction.participant_id,
      count: transaction.vote_count
    });
}
