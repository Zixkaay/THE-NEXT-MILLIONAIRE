'use server';

import { getAnalyticsMetrics } from '../../../db/queries/analytics';
import { verifyAdminSession } from '@/features/auth/services/serverAuth';

export async function getAnalyticsAction() {
  try {
    await verifyAdminSession();
    const metrics = await getAnalyticsMetrics();
    return { success: true, data: metrics };
  } catch (error) {
    console.error('[AnalyticsAction] Error:', error);
    return { success: false, message: 'Failed to fetch analytics.' };
  }
}
