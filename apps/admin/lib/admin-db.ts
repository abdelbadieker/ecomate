// Client helper to run admin writes through the service-role proxy
// (/api/admin/db). Required because the admin uses a cookie session, not
// Supabase Auth, so direct browser writes are blocked by RLS.
type Match = Record<string, string | number | boolean>;

async function call(table: string, action: string, opts: { values?: unknown; match?: Match }) {
  const res = await fetch('/api/admin/db', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ table, action, ...opts }),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json.error || 'Operation failed');
  return json.data;
}

export const adminDb = {
  insert: (table: string, values: unknown) => call(table, 'insert', { values }),
  upsert: (table: string, values: unknown) => call(table, 'upsert', { values }),
  update: (table: string, values: unknown, match: Match) => call(table, 'update', { values, match }),
  delete: (table: string, match: Match) => call(table, 'delete', { match }),
  /** Fire-and-forget audit log (never throws). */
  log: (action: string, extra?: Record<string, unknown>) =>
    call('activity_logs', 'insert', { values: { action, actor_role: 'admin', actor_name: 'Admin', ...extra } }).catch(() => {}),
};
