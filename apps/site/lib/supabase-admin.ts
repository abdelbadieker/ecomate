import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type UntypedSupabaseClient = ReturnType<typeof createClient<any>>;

let client: UntypedSupabaseClient | null = null;

export function getSupabaseAdmin() {
  if (client) return client;

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error(
      '[supabase-admin] NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY is missing.'
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  client = createClient<any>(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
    global: {
      fetch: (input, init) =>
        fetch(input as RequestInfo, { ...init, cache: 'no-store' }),
    },
  });

  return client;
}
