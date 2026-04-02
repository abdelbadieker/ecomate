'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'
import { motion, AnimatePresence } from 'framer-motion'
import { Settings, Shield, CreditCard, Layout, Save, Trash2, ExternalLink, Folder } from 'lucide-react'

export default function SettingsPage() {
  const [client, setClient] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [tab, setTab] = useState<'profile' | 'security' | 'creative'>('profile')
  const [form, setForm] = useState({ 
    agency_name: '', 
    email: '', 
    meta_partner_id: '', 
    telegram_token: '', 
    google_drive_folder_url: '' 
  })

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) return
      const { data: c } = await supabase.from('clients').select('*').eq('id', data.user.id).single()
      if (c) {
        setClient(c)
        setForm({
          agency_name: c.agency_name || '',
          email: c.email || data.user.email || '',
          meta_partner_id: c.meta_partner_id || '',
          telegram_token: c.telegram_token || '',
          google_drive_folder_url: c.google_drive_folder_url || ''
        })
      }
      setLoading(false)
    })
  }, [])

  async function updateProfile() {
    setSaving(true)
    const supabase = createClient()
    const { error } = await supabase.from('clients').update({
      agency_name: form.agency_name,
      meta_partner_id: form.meta_partner_id,
      telegram_token: form.telegram_token,
      google_drive_folder_url: form.google_drive_folder_url
    }).eq('id', client.id)

    if (error) toast.error(error.message)
    else {
      toast.success('Settings updated!')
      setClient({ ...client, ...form })
    }
    setSaving(false)
  }

  const inputStyle = "w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white text-sm focus:outline-none focus:border-blue-500/50 transition-all placeholder:text-white/10"

  if (loading) return <div className="p-8 text-center text-white/20 font-black animate-pulse">Loading Workspace Settings...</div>

  return (
    <div className="p-4 lg:p-8 space-y-8 max-w-4xl mx-auto">
      <header>
        <h1 className="text-3xl font-black text-white mb-2 font-poppins">Settings ⚙️</h1>
        <p className="text-white/40 font-medium">Configure your workspace, security, and creative assets.</p>
      </header>

      {/* Modern Tabs */}
      <div className="flex bg-white/5 p-1 rounded-2xl border border-white/10">
        {[
          { id: 'profile', icon: Settings, label: 'Workspace' },
          { id: 'creative', icon: Layout, label: 'Creative Studio' },
          { id: 'security', icon: Shield, label: 'Security' }
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id as any)}
            className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-bold transition-all ${tab === t.id ? 'bg-blue-600 text-white shadow-xl shadow-blue-600/20' : 'text-white/40 hover:text-white/60'}`}
          >
            <t.icon className="w-4 h-4" /> {t.label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={tab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          {tab === 'profile' && (
            <div className="bg-[#0a1628] border border-white/5 rounded-[32px] p-8 space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-white/20 ml-1">Agency / Store Name</label>
                  <input className={inputStyle} value={form.agency_name} onChange={e => setForm(f => ({ ...f, agency_name: e.target.value }))} />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-white/20 ml-1">Account Email</label>
                  <input className={inputStyle} disabled value={form.email} />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-white/20 ml-1">Meta Partner ID</label>
                  <input className={inputStyle} value={form.meta_partner_id} onChange={e => setForm(f => ({ ...f, meta_partner_id: e.target.value }))} placeholder="For ManyChat Sync" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-white/20 ml-1">Telegram Bot Token</label>
                  <input className={inputStyle} value={form.telegram_token} onChange={e => setForm(f => ({ ...f, telegram_token: e.target.value }))} placeholder="For Notifications" />
                </div>
              </div>
              
              <div className="pt-4 border-t border-white/5 flex justify-end">
                <button 
                  onClick={updateProfile}
                  disabled={saving}
                  className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-3 rounded-xl font-black transition-all shadow-xl shadow-blue-600/20 flex items-center gap-2"
                >
                  <Save className="w-5 h-5" /> {saving ? 'Saving...' : 'Save Settings'}
                </button>
              </div>
            </div>
          )}

          {tab === 'creative' && (
            <div className="space-y-6">
              <div className="bg-[#0a1628] border border-white/5 rounded-[32px] p-8">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                  <div>
                    <h3 className="text-xl font-black text-white font-poppins">Creative Studio 🎥</h3>
                    <p className="text-white/40 text-sm">Centralized hub for your ad creatives and product media.</p>
                  </div>
                  <div className="flex gap-2">
                    <input 
                      className={inputStyle} 
                      placeholder="Google Drive Shared Link" 
                      value={form.google_drive_folder_url}
                      onChange={e => setForm(f => ({ ...f, google_drive_folder_url: e.target.value }))}
                    />
                    <button onClick={updateProfile} className="bg-emerald-600 hover:bg-emerald-500 text-white px-6 rounded-xl font-black shrink-0 transition-all">Link Folder</button>
                  </div>
                </div>

                {form.google_drive_folder_url ? (
                  <div className="aspect-video w-full bg-black/20 rounded-2xl border border-white/10 overflow-hidden relative group">
                    <iframe 
                      src={form.google_drive_folder_url.replace('/view', '/preview').replace('?usp=sharing', '')}
                      className="w-full h-full border-none"
                      allow="autoplay"
                    />
                    <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                      <a href={form.google_drive_folder_url} target="_blank" className="bg-white/10 backdrop-blur-md p-2 rounded-lg text-white hover:bg-white/20 transition-all flex items-center gap-2 text-xs font-bold">
                        <ExternalLink className="w-4 h-4" /> Open Original
                      </a>
                    </div>
                  </div>
                ) : (
                  <div className="aspect-video w-full bg-white/[0.02] border border-dashed border-white/10 rounded-2xl flex flex-col items-center justify-center p-12 text-center group hover:bg-white/[0.03] transition-all">
                    <div className="w-20 h-20 bg-blue-500/10 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                      <Folder className="w-10 h-10 text-blue-500/50" />
                    </div>
                    <h4 className="text-white font-black text-xl mb-2">No Creative Folder Linked</h4>
                    <p className="text-white/30 text-sm max-w-xs mx-auto mb-8">Paste your Google Drive folder link above to view your assets directly in the EcoMate dashboard.</p>
                    <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-emerald-500 bg-emerald-500/10 px-4 py-2 rounded-full">
                      🔥 Tip: Use Shared Drive for team collaboration
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {tab === 'security' && (
            <div className="bg-[#0a1628] border border-white/5 rounded-[32px] p-8 space-y-8">
              <div className="space-y-6">
                <h3 className="text-xl font-black text-white font-poppins">Account Security</h3>
                <div className="p-6 border border-white/5 rounded-2xl bg-white/[0.02] flex items-center justify-between">
                  <div>
                    <div className="text-white font-bold mb-1">Delete Workspace</div>
                    <div className="text-white/30 text-xs">Permanently remove all products, orders, and CRM data.</div>
                  </div>
                  <button className="bg-red-500/10 hover:bg-red-500/20 text-red-500 px-6 py-2 rounded-xl font-black text-xs transition-all border border-red-500/20">
                    Wipe Data
                  </button>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
