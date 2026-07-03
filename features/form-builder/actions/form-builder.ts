'use server';

/**
 * Server Actions for Dynamic Form Builder
 */

import { supabaseAdmin as supabase } from '@/lib/supabase';
import { DatabaseFormField } from '@/types/database';
import { isMockSupabase } from '@/features/auth/services/authService';
import { verifyAdminSession } from '@/features/auth/services/serverAuth';
import { FormStep, FormField, DEFAULT_FORM_STEPS } from '@/config/systemConfig';

// Convert DB rows into public FormStep config structure
function mapDbFieldsToSteps(rows: any[], includeDisabled: boolean = false): FormStep[] {
  const stepsMap: Record<number, FormStep> = {};
  
  const stepTitles: Record<number, string> = {
    1: "Identity",
    2: "Experience",
    3: "Contact",
    4: "Media Showcase"
  };

  const maxStep = Math.max(4, ...rows.map(r => r.step || 1));

  for (let i = 1; i <= maxStep; i++) {
    stepsMap[i] = {
      number: i,
      title: stepTitles[i] || `Custom Step ${i}`,
      fields: []
    };
  }

  // Sort rows by sort_order
  const sortedRows = [...rows].sort((a, b) => a.sort_order - b.sort_order);

  for (const row of sortedRows) {
    if (!row.is_enabled && !includeDisabled) continue;
    const stepNum = row.step || 1;
    if (!stepsMap[stepNum]) {
      stepsMap[stepNum] = {
        number: stepNum,
        title: stepTitles[stepNum] || `Custom Step ${stepNum}`,
        fields: []
      };
    }
    stepsMap[stepNum].fields.push({
      id: row.name,
      label: row.label,
      type: row.type as any,
      placeholder: row.placeholder || undefined,
      required: row.required,
      options: Array.isArray(row.options) ? row.options : [],
      is_enabled: row.is_enabled !== false, // custom extension
    } as any);
  }

  // Sort and filter active steps or standard 4 steps
  return Object.values(stepsMap)
    .filter(step => step.fields.length > 0 || step.number <= 4)
    .sort((a, b) => a.number - b.number);
}

/**
 * Retrieves the dynamic form builder schema (FormSteps) from database
 * Seeding matching defaults if datastore is completely empty
 */
export async function getFormFieldsAction(includeDisabled: boolean = true): Promise<FormStep[]> {
  if (isMockSupabase()) {
    return DEFAULT_FORM_STEPS;
  }

  try {
    const { data, error } = await (supabase as any)
      .from('form_fields')
      .select('*');

    if (error) {
      throw new Error(error.message);
    }

    if (!data || data.length === 0) {
      console.log('[FormFieldsAction] database is empty, seeding with default schema...');
      
      const seedRows: any[] = [];
      let sortIdx = 0;
      
      for (const step of DEFAULT_FORM_STEPS) {
        let order = 0;
        for (const field of step.fields) {
          seedRows.push({
            label: field.label,
            name: field.id,
            type: field.type,
            required: field.required,
            options: field.options || [],
            placeholder: field.placeholder || '',
            sort_order: order++,
            step: step.number,
            is_enabled: true
          });
        }
      }

      const { data: insertedData, error: seedError } = await (supabase as any)
        .from('form_fields')
        .insert(seedRows)
        .select();

      if (seedError) {
        console.error('[FormFieldsAction] Error seeding form fields:', seedError);
        return DEFAULT_FORM_STEPS;
      }

      return mapDbFieldsToSteps(insertedData || [], includeDisabled);
    }

    return mapDbFieldsToSteps(data, includeDisabled);
  } catch (err: any) {
    console.error('[FormFieldsAction] Exception reading dynamic schema:', err);
    return DEFAULT_FORM_STEPS;
  }
}

/**
 * Replaces entire schema in database with the configured steps from Client Form Builder
 */
export async function saveFormFieldsAction(steps: FormStep[]): Promise<{ success: boolean; message: string }> {
  if (isMockSupabase()) {
    return { success: true, message: 'Schema draft successfully recorded in mock local environment.' };
  }

  try {
    await verifyAdminSession();
    // 1. Delete all existing fields
    const { error: deleteError } = await (supabase as any)
      .from('form_fields')
      .delete()
      .neq('name', 'this_will_never_match_mock'); // deletes everything safely since it is matching all rows

    if (deleteError) {
      throw new Error(`Failed to clean old schema: ${deleteError.message}`);
    }

    // 2. Prepare database payload format
    const insertPayload: any[] = [];
    
    for (const step of steps) {
      let order = 0;
      for (const field of step.fields) {
        insertPayload.push({
          label: field.label,
          name: field.id,
          type: field.type,
          required: field.required,
          options: field.options || [],
          placeholder: field.placeholder || '',
          sort_order: order++,
          step: step.number,
          is_enabled: (field as any).is_enabled !== false // support enable/disable
        });
      }
    }

    if (insertPayload.length > 0) {
      // 3. Bulk insert brand new fields
      const { error: insertError } = await (supabase as any)
        .from('form_fields')
        .insert(insertPayload);

      if (insertError) {
        throw new Error(`Failed to store brand-new dynamic schema rows: ${insertError.message}`);
      }
    }

    return { success: true, message: 'Platform registration dynamic form schema updated!' };
  } catch (err: any) {
    console.error('[FormFieldsAction] Fatal schema save exception:', err);
    return { success: false, message: err.message || 'Cloud system communication error.' };
  }
}
