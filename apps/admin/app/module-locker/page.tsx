import { supabaseAdmin } from '@/lib/supabase-admin';
import LockerClient from './LockerClient';
import { ShieldAlert } from 'lucide-react';

export const dynamic = 'force-dynamic';

type Merchant = {
  id: string;
  full_name: string | null;
  email: string | null;
  plan: string | null;
  locked_sections: string[] | null;
};

type Permission = {
  client_id: string;
  module_name: string;
  is_locked: boolean;
};

function isMissingPermissionsStore(error: unknown) {
  const err = error as { code?: string; message?: string };
  return (
    err?.code === 'PGRST205' ||
    err?.code === '42P01' ||
    /client_permissions/i.test(err?.message ?? '')
  );
}

export default async function ModuleLockerPage() {
  const { data: merchants, error } = await supabaseAdmin
    .from('profiles')
    .select('id, full_name, email, plan, locked_sections')
    .order('created_at', { ascending: false });

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-20 bg-red-500/5 border border-red-500/20 rounded-3xl">
        <ShieldAlert className="text-red-500 mb-4" size={48} />
        <h2 className="text-xl font-black text-white capitalize">Security Layer Exception</h2>
        <p className="text-slate-400 mt-2 text-sm">{error.message}</p>
      </div>
    );
  }

  const hydratedMerchants = ((merchants || []) as Merchant[]).map((merchant) => ({
    ...merchant,
    full_name: merchant.full_name || '',
    email: merchant.email || '',
    plan: merchant.plan || 'Starter',
    locked_sections: Array.isArray(merchant.locked_sections) ? merchant.locked_sections : [],
  }));

  const { data: permissions, error: permissionsError } = await supabaseAdmin
    .from('client_permissions')
    .select('client_id, module_name, is_locked');

  if (permissionsError && !isMissingPermissionsStore(permissionsError)) {
    return (
      <div className="flex flex-col items-center justify-center p-20 bg-red-500/5 border border-red-500/20 rounded-3xl">
        <ShieldAlert className="text-red-500 mb-4" size={48} />
        <h2 className="text-xl font-black text-white capitalize">Permissions Layer Exception</h2>
        <p className="text-slate-400 mt-2 text-sm">{permissionsError.message}</p>
      </div>
    );
  }

  const lockedByClient = new Map<string, string[]>();
  for (const permission of (permissions || []) as Permission[]) {
    if (!permission.is_locked) continue;
    const current = lockedByClient.get(permission.client_id) || [];
    current.push(permission.module_name);
    lockedByClient.set(permission.client_id, current);
  }

  const clientMerchants = permissionsError
    ? hydratedMerchants
    : hydratedMerchants.map((merchant) => ({
        ...merchant,
        locked_sections: lockedByClient.get(merchant.id) || [],
      }));

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h2 className="text-3xl font-black text-white tracking-tight">Governance: Module Locker</h2>
        <p className="text-slate-400 mt-1 font-medium">Enforce granular access control by locking or unlocking specific dashboard sections for each merchant.</p>
      </div>

      <LockerClient initialMerchants={clientMerchants} />
    </div>
  );
}
