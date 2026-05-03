import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

const MODULES = [
  'overview',
  'orders',
  'products',
  'crm',
  'ecotrack',
  'fulfillment',
  'chatbot',
  'creative',
  'web',
  'estore',
  'analytics',
  'billing',
  'messages',
  'support',
] as const;

type ModuleName = (typeof MODULES)[number];

function isMissingPermissionsStore(error: unknown) {
  const err = error as { code?: string; message?: string };
  return (
    err?.code === 'PGRST205' ||
    err?.code === '42P01' ||
    /client_permissions/i.test(err?.message ?? '')
  );
}

function normalizeLockedSections(value: unknown): ModuleName[] {
  if (!Array.isArray(value)) return [];
  const allowed = new Set<string>(MODULES);
  return Array.from(new Set(value.filter((item): item is string => typeof item === 'string')))
    .filter((item): item is ModuleName => allowed.has(item));
}

async function mirrorProfileLocks(clientId: string, lockedSections: ModuleName[]) {
  const { data, error } = await supabaseAdmin
    .from('profiles')
    .update({ locked_sections: lockedSections } as never)
    .eq('id', clientId)
    .select('id, locked_sections')
    .single();

  if (error) throw error;
  return data;
}

async function writePermissions(clientId: string, lockedSections: ModuleName[]) {
  const locked = new Set(lockedSections);
  const now = new Date().toISOString();
  const rows = MODULES.map((moduleName) => ({
    client_id: clientId,
    module_name: moduleName,
    is_locked: locked.has(moduleName),
    updated_at: now,
  }));

  const { error } = await supabaseAdmin
    .from('client_permissions')
    .upsert(rows as never, { onConflict: 'client_id,module_name' });

  if (error) {
    if (!isMissingPermissionsStore(error)) throw error;
    const data = await mirrorProfileLocks(clientId, lockedSections);
    return { source: 'profiles', data };
  }

  const data = await mirrorProfileLocks(clientId, lockedSections);
  return { source: 'client_permissions', data };
}

export async function POST(req: Request) {
  try {
    const session = cookies().get('admin_session')?.value;
    if (session !== 'authenticated') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { action, id } = body;

    if (action === 'unlock_everyone') {
      const { error } = await supabaseAdmin
        .from('client_permissions')
        .update({ is_locked: false, updated_at: new Date().toISOString() } as never)
        .in('module_name', [...MODULES]);

      if (error && !isMissingPermissionsStore(error)) throw error;

      const { error: profileError, count } = await supabaseAdmin
        .from('profiles')
        .update({ locked_sections: [] } as never, { count: 'exact' })
        .neq('id', '00000000-0000-0000-0000-000000000000');

      if (profileError) throw profileError;
      return NextResponse.json({
        success: true,
        source: error ? 'profiles' : 'client_permissions',
        cleared: count ?? 0,
      });
    }

    if (!id || typeof id !== 'string') {
      return NextResponse.json({ error: 'Client id is required' }, { status: 400 });
    }

    if (action === 'unlock_all') {
      const result = await writePermissions(id, []);
      return NextResponse.json({ success: true, ...result });
    }

    if (action === 'lock_all_for') {
      const sections = normalizeLockedSections(body.sections);
      const result = await writePermissions(id, sections.length > 0 ? sections : [...MODULES]);
      return NextResponse.json({ success: true, ...result });
    }

    if (action === 'set') {
      const lockedSections = normalizeLockedSections(body.locked_sections);
      const result = await writePermissions(id, lockedSections);
      return NextResponse.json({ success: true, ...result });
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  } catch (err: unknown) {
    const message = (err as Error).message || 'Internal error';
    console.error('[/api/admin/module-locker]', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
