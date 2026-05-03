import dynamicImport from 'next/dynamic';
import { Loader2 } from 'lucide-react';
import { supabaseAdmin } from '@/lib/supabase-admin';

export const dynamic = 'force-dynamic';

const CRMAssetsClient = dynamicImport(() => import('./CRMAssetsClient'), {
  ssr: false,
  loading: () => (
    <div className="flex flex-col items-center justify-center py-20 animate-in fade-in duration-500">
      <Loader2 className="w-12 h-12 animate-spin text-blue-500 mb-6" />
      <h3 className="text-xl font-bold text-white mb-2">Restoring Asset Manager</h3>
      <p className="text-slate-500 text-sm font-medium">Syncing with secure storage...</p>
    </div>
  )
});

export default async function CRMAssetsPage() {
  const { data: merchants } = await supabaseAdmin
    .from('profiles')
    .select('id, full_name, email')
    .order('full_name', { ascending: true });

  return <CRMAssetsClient initialMerchants={merchants || []} />;
}
