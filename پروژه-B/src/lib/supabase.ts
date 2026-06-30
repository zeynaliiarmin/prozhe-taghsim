import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

const isPlaceholder = (value?: string) =>
  !value || value.trim() === '' || value.includes('your_supabase_project_url') || value.includes('your_supabase_anon_key');

export const isSupabaseConfigured = !isPlaceholder(supabaseUrl) && !isPlaceholder(supabaseAnonKey);

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(supabaseUrl!, supabaseAnonKey!, {
      auth: { persistSession: true, autoRefreshToken: true },
    })
  : null;

const requireSupabase = (): SupabaseClient => {
  if (!supabase) throw new Error('Supabase is not configured.');
  return supabase;
};

export type Submission = Record<string, unknown> & {
  id?: string | number;
  created_at?: string;
  updated_at?: string;
  fullPhone?: string;
  full_phone?: string;
};

const SUBMISSIONS_TABLE = 'submissions';

export const dbRowToSubmission = (row: Record<string, unknown> | null): Submission | null => {
  if (!row) return null;
  const payload = row.payload && typeof row.payload === 'object' ? (row.payload as Record<string, unknown>) : {};
  return { ...payload, ...row, fullPhone: row.full_phone ?? (payload as any).fullPhone ?? (payload as any).full_phone } as Submission;
};

export const fetchSubmissions = async (): Promise<Submission[]> => {
  const client = requireSupabase();
  const { data, error } = await client.from(SUBMISSIONS_TABLE).select('*').order('created_at', { ascending: false });
  if (error) throw error;
  return (data || []).map(dbRowToSubmission).filter(Boolean) as Submission[];
};

export const createSubmission = async (submission: Submission): Promise<Submission> => {
  const client = requireSupabase();
  const { id, created_at, updated_at, fullPhone, full_phone, ...payload } = submission || {};
  const row = {
    full_phone: fullPhone ?? full_phone ?? (payload as any)?.fullPhone ?? null,
    payload: { ...payload, ...(fullPhone || full_phone ? { fullPhone: fullPhone ?? full_phone } : {}) },
    updated_at: new Date().toISOString(),
  };
  const { data, error } = await client.from(SUBMISSIONS_TABLE).insert(row).select('*').single();
  if (error) throw error;
  return dbRowToSubmission(data) as Submission;
};