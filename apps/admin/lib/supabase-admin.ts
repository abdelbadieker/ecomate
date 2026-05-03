import { createClient } from '@supabase/supabase-js';

// This client uses the SERVICE_ROLE_KEY to bypass Row Level Security (RLS).
// IT MUST ONLY BE USED ON THE SERVER (Server Components, API Routes, Server Actions).
// NEVER expose this client or the service role key to the browser.

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Lazy singleton - created on first use, not at module load time.
// This prevents build failures when env vars are not available during static analysis.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type UntypedSupabaseClient = ReturnType<typeof createClient<any>>;

let _client: UntypedSupabaseClient | null = null;

function getAdminClient() {
  if (_client) return _client;
  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error(
      '[supabase-admin] NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY is missing. ' +
      'Add these to your .env.local and Vercel environment variables.'
    );
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  _client = createClient<any>(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
    global: {
      // Bypass Next.js's default fetch cache so admin reads always see fresh DB state
      // (otherwise updates can appear to "revert" on refresh).
      fetch: (input, init) =>
        fetch(input as RequestInfo, { ...init, cache: 'no-store' }),
    },
  });
  return _client;
}

// Proxy: every property access goes through the lazy getter
export const supabaseAdmin = new Proxy({} as UntypedSupabaseClient, {
  get(_target, prop) {
    const client = getAdminClient();
    const value = (client as unknown as Record<string | symbol, unknown>)[prop];
    if (typeof value === 'function') {
      return value.bind(client);
    }
    return value;
  },
});
