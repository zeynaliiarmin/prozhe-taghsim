import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

const isPlaceholder = (value?: string) =>
  !value ||
  value.trim() === '' ||
  value.includes('your_supabase_project_url') ||
  value.includes('your_supabase_anon_key');

export const isSupabaseConfigured = !isPlaceholder(supabaseUrl) && !isPlaceholder(supabaseAnonKey);

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(supabaseUrl!, supabaseAnonKey!, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    })
  : null;

const requireSupabase = (): SupabaseClient => {
  if (!supabase) {
    throw new Error(
      'Supabase is not configured. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file.',
    );
  }
  return supabase;
};

export type Submission = Record<string, any> & {
  id?: string | number;
  created_at?: string;
  updated_at?: string;
  fullPhone?: string;
  full_phone?: string;
};

export type AppSettings = Record<string, any> & {
  id?: string | number;
  key?: string;
  settings?: Record<string, any>;
};

const SUBMISSIONS_TABLE = 'submissions';
const SETTINGS_TABLE = 'settings';
const SETTINGS_KEY = 'app_settings';

export const dbRowToSubmission = (row: Record<string, any> | null): Submission | null => {
  if (!row) return null;
  const payload = row.payload && typeof row.payload === 'object' ? row.payload : {};
  return {
    ...payload,
    ...row,
    fullPhone: row.full_phone ?? payload.fullPhone ?? payload.full_phone,
  };
};

export const submissionToDbRow = (submission: Submission): Record<string, any> => {
  const { id, created_at, updated_at, fullPhone, full_phone, ...payload } = submission || {};
  return {
    ...(id != null ? { id } : {}),
    full_phone: fullPhone ?? full_phone ?? payload?.fullPhone ?? null,
    payload: {
      ...payload,
      ...(fullPhone || full_phone ? { fullPhone: fullPhone ?? full_phone } : {}),
    },
    updated_at: new Date().toISOString(),
  };
};

export const dbRowToSettings = (row: Record<string, any> | null): AppSettings | null => {
  if (!row) return null;
  if (row.settings && typeof row.settings === 'object') return row.settings;
  if (row.payload && typeof row.payload === 'object') return row.payload;
  return row as AppSettings;
};

export const settingsToDbRow = (settings: AppSettings): Record<string, any> => ({
  key: SETTINGS_KEY,
  settings,
  updated_at: new Date().toISOString(),
});

export const fetchSubmissions = async (): Promise<Submission[]> => {
  const client = requireSupabase();
  const { data, error } = await client
    .from(SUBMISSIONS_TABLE)
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data || []).map((row) => dbRowToSubmission(row)).filter(Boolean) as Submission[];
};

export const createSubmission = async (submission: Submission): Promise<Submission> => {
  const client = requireSupabase();
  const row = submissionToDbRow(submission);
  delete row.id;

  const { data, error } = await client
    .from(SUBMISSIONS_TABLE)
    .insert(row)
    .select('*')
    .single();

  if (error) throw error;
  return dbRowToSubmission(data) as Submission;
};

export const updateSubmission = async (
  id: string | number,
  updates: Partial<Submission>,
): Promise<Submission> => {
  const client = requireSupabase();
  const row = submissionToDbRow(updates as Submission);
  delete row.id;

  const { data, error } = await client
    .from(SUBMISSIONS_TABLE)
    .update(row)
    .eq('id', id)
    .select('*')
    .single();

  if (error) throw error;
  return dbRowToSubmission(data) as Submission;
};

export const deleteMultipleSubmissions = async (ids: Array<string | number>): Promise<void> => {
  if (!ids.length) return;
  const client = requireSupabase();
  const { error } = await client.from(SUBMISSIONS_TABLE).delete().in('id', ids);
  if (error) throw error;
};

export const updateMultipleSubmissions = async (
  ids: Array<string | number>,
  updates: Partial<Submission>,
): Promise<Submission[]> => {
  if (!ids.length) return [];
  const client = requireSupabase();
  const row = submissionToDbRow(updates as Submission);
  delete row.id;

  const { data, error } = await client
    .from(SUBMISSIONS_TABLE)
    .update(row)
    .in('id', ids)
    .select('*');

  if (error) throw error;
  return (data || []).map((item) => dbRowToSubmission(item)).filter(Boolean) as Submission[];
};

export const checkDuplicatePhone = async (phone: string): Promise<boolean> => {
  if (!phone) return false;
  const client = requireSupabase();
  const { data, error } = await client
    .from(SUBMISSIONS_TABLE)
    .select('id')
    .eq('full_phone', phone)
    .limit(1);

  if (error) throw error;
  return Boolean(data && data.length > 0);
};

export const fetchSettings = async (): Promise<AppSettings | null> => {
  const client = requireSupabase();
  const { data, error } = await client
    .from(SETTINGS_TABLE)
    .select('*')
    .eq('key', SETTINGS_KEY)
    .maybeSingle();

  if (error) throw error;
  return dbRowToSettings(data);
};

export const saveSettings = async (settings: AppSettings): Promise<AppSettings> => {
  const client = requireSupabase();
  const row = settingsToDbRow(settings);

  const { data, error } = await client
    .from(SETTINGS_TABLE)
    .upsert(row, { onConflict: 'key' })
    .select('*')
    .single();

  if (error) throw error;
  return dbRowToSettings(data) as AppSettings;
};
