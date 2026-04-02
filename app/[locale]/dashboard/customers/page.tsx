import { createClient } from '@/lib/supabase/server'
import CustomersClient from './CustomersClient'
import Link from 'next/link'

export default async function CustomersPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const [{ data: client }, { data: shoppers }] = await Promise.all([
    supabase.from('clients').select('plan').eq('id', user.id).single(),
    supabase.from('customers_crm').select('*, orders(*)').eq('client_id', user.id).order('created_at', { ascending: false })
  ])

  const isLocked = client?.plan === 'starter' || !client?.plan

  if (isLocked) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] text-center p-8 bg-[#030711]">
        <div className="w-24 h-24 bg-blue-500/10 rounded-full flex items-center justify-center text-4xl mb-8 border border-blue-500/20 shadow-2xl shadow-blue-500/10">🔒</div>
        <h2 className="font-poppins text-3xl font-black text-white mb-4 tracking-tight">CRM is a Growth Feature 🚀</h2>
        <p className="text-white/40 max-w-md mx-auto mb-10 text-lg font-medium leading-relaxed">
          Upgrade to the <span className="text-blue-500">Growth Plan</span> to access your full shopper database, track customer history, and gain loyalty insights.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto mb-12">
          {[
            { t: 'Full Shopper History', d: 'Track every single order per customer.' },
            { t: 'Spending Analytics', d: 'Identify your highest-value customers.' },
            { t: 'Repeat Buyer Tracking', d: 'See who keeps coming back for more.' },
            { t: 'Export to CSV/Sheets', d: 'Own your data and use it for marketing.' }
          ].map(f => (
            <div key={f.t} className="bg-white/5 border border-white/10 rounded-2xl p-6 text-left hover:border-blue-500/30 transition-all">
              <div className="text-emerald-500 font-black mb-1 flex items-center gap-2">✓ {f.t}</div>
              <div className="text-white/40 text-sm font-medium">{f.d}</div>
            </div>
          ))}
        </div>

        <Link 
          href="/dashboard/settings" 
          className="bg-blue-600 hover:bg-blue-500 text-white px-10 py-4 rounded-2xl font-black text-lg transition-all shadow-2xl shadow-blue-500/20 hover:scale-105 active:scale-95"
        >
          ⚡ Upgrade Now — Unlock CRM →
        </Link>
      </div>
    )
  }

  return (
    <div className="flex-1 min-h-screen bg-[#030711]">
      <CustomersClient initialCustomers={shoppers || []} />
    </div>
  )
}
