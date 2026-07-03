
import { supabaseAdmin } from '@/lib/supabase';

export async function getAnalyticsMetrics() {
  // 1. Total Participants
  const { count: totalParticipants, error: tpError } = await (supabaseAdmin as any)
    .from('participants')
    .select('*', { count: 'exact', head: true });

  if (tpError) throw tpError;

  // 2. Qualified Participants
  const { count: qualifiedParticipants, error: qpError } = await (supabaseAdmin as any)
    .from('participants')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'qualified');

  if (qpError) throw qpError;

  // 3. Total Payments (Successful only)
  const { data: payments, error: pError } = await (supabaseAdmin as any)
    .from('payments')
    .select('amount')
    .eq('status', 'success');

  if (pError) throw pError;
  const totalPayments = payments.reduce((sum: number, p: any) => sum + Number(p.amount), 0);

  // 4. Total Votes
  const { data: votes, error: vError } = await (supabaseAdmin as any)
    .from('votes')
    .select('count');
  
  if (vError) throw vError;
  const totalVotes = votes.reduce((sum: number, v: any) => sum + Number(v.count), 0);

  return {
    totalParticipants: totalParticipants || 0,
    qualifiedParticipants: qualifiedParticipants || 0,
    totalPayments,
    totalVotes
  };
}
