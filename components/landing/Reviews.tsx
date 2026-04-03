'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useTranslations, useLocale } from 'next-intl'
import toast from 'react-hot-toast'
import { Star, MessageSquare, Send, X, CheckCircle2 } from 'lucide-react'

function StarRating({ value, onChange, size = 18 }: { value: number; onChange?: (v: number) => void, size?: number }) {
  const [hover, setHover] = useState(0)
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map(s => (
        <button key={s} type="button"
          onClick={() => onChange?.(s)}
          onMouseEnter={() => onChange && setHover(s)}
          onMouseLeave={() => onChange && setHover(0)}
          className={`transition-all ${onChange ? 'cursor-pointer hover:scale-110' : 'cursor-default'}`}>
          <Star size={size} className={`${(hover || value) >= s ? 'fill-amber-500 text-amber-500' : 'text-white/10'} transition-colors`} />
        </button>
      ))}
    </div>
  )
}

export default function Reviews({ reviews: initialReviews }: { reviews: any[] }) {
  const t = useTranslations('Landing.Reviews')
  const locale = useLocale()
  const isRtl = locale === 'ar'
  
  const [reviews] = useState(initialReviews)
  const [showForm, setShowForm] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [form, setForm] = useState({ rating: 5, content: '', plan_used: '' })

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(async ({ data: authData }) => {
      if (!authData.user) return
      setUser(authData.user)
      
      const { data: p } = await supabase.from('profiles').select('*').eq('id', authData.user.id).single()
      if (p) {
        setProfile(p)
        setForm(f => ({ ...f, plan_used: p.plan || '' }))
      }
    })
  }, [])

  async function submitReview(e: React.FormEvent) {
    e.preventDefault()
    if (!user) { toast.error(t('errors.signIn')); return }
    if (form.content.length < 20) { toast.error(t('errors.length')); return }
    setSubmitting(true)
    const supabase = createClient()
    const { error } = await supabase.from('reviews').insert({
      user_id: user.id,
      reviewer_name: profile?.full_name || 'Anonymous',
      author_name: profile?.full_name || 'Anonymous',
      business_name: profile?.business_name || '',
      rating: form.rating,
      content: form.content,
      plan_slug: form.plan_used || 'trial',
      is_approved: false,
    })
    if (error) { 
      toast.error(t('errors.failed') + (error.message || ''))
      setSubmitting(false) 
      return 
    }
    setSubmitted(true)
    setShowForm(false)
    setSubmitting(false)
    toast.success(t('submitted'))
  }

  return (
    <section id="reviews" className="py-24 px-[5%] bg-[#050a14] border-y border-white/5 relative overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-[1px] bg-gradient-to-r from-transparent via-blue-500/10 to-transparent" />
      
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-20">
          <div className="hbadge bg-amber-500/10 border-amber-500/20 text-amber-500 mb-6 mx-auto">
            <Star className="w-3.5 h-3.5 fill-amber-500" />
            <span className="text-[10px] font-black uppercase tracking-widest">{t('subtitle')}</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-black font-poppins tracking-tighter text-white mb-6">
            {t.rich('title', {
              spanTag: (chunks) => <span className="bg-gradient-to-r from-emerald-400 to-emerald-600 bg-clip-text text-transparent">{chunks}</span>
            })}
          </h2>
          <p className="text-white/40 text-lg font-medium max-w-xl mx-auto mb-10">
            {t('desc')}
          </p>

          {!submitted ? (
            <button
              onClick={() => user ? setShowForm(true) : toast.error(t('errors.signIn'))}
              className="bh2 group !py-3 !px-8"
            >
              <span className="text-sm font-black tracking-tight">{t('leaveReview')}</span>
            </button>
          ) : (
            <div className="inline-flex items-center gap-3 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-6 py-3 text-sm font-black text-emerald-500 shadow-xl shadow-emerald-500/5">
              <CheckCircle2 size={18} />
              {t('submitted')}
            </div>
          )}
        </div>

        {/* Reviews Grid */}
        {reviews.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {reviews.map((r: any) => (
              <div key={r.id} className="bc group hover:!border-amber-500/30 !p-8">
                {r.is_featured && (
                  <div className="absolute top-4 right-4 bg-amber-500/10 border border-amber-500/20 rounded-lg px-2 py-1 text-[9px] font-black uppercase tracking-tighter text-amber-500">
                    {t('featured')}
                  </div>
                )}
                <div className="mb-6">
                  <StarRating value={r.rating} />
                </div>
                <p className="text-white/60 text-[15px] leading-relaxed italic mb-8 font-medium">
                  &ldquo;{r.content}&rdquo;
                </p>
                <div className="flex items-center gap-4 pt-6 border-t border-white/5">
                  <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-blue-600 to-emerald-500 flex items-center justify-center text-white font-black text-lg shadow-lg">
                    {r.reviewer_name?.[0]?.toUpperCase()}
                  </div>
                  <div>
                    <div className="font-poppins text-[15px] font-black text-white tracking-tight">{r.reviewer_name}</div>
                    <div className="text-[11px] font-bold text-white/20 uppercase tracking-widest mt-0.5">
                      {r.business_name || 'EcoMate Merchant'}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white/[0.02] border border-dashed border-white/10 rounded-[40px]">
            <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6 text-4xl">⭐</div>
            <p className="text-white/30 font-bold uppercase tracking-[0.2em]">{t('noReviews')}</p>
          </div>
        )}
      </div>

      {/* Review Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-6 bg-[#01050a]/90 backdrop-blur-xl animate-in fade-in duration-300"
          onClick={e => e.target === e.currentTarget && setShowForm(false)}>
          <div className="bg-[#050a14] border border-white/10 rounded-[40px] p-10 w-full max-w-[540px] shadow-2xl animate-in zoom-in-95 duration-300 relative">
            <button onClick={() => setShowForm(false)} className="absolute top-6 right-6 p-2 text-white/20 hover:text-white transition-colors">
              <X size={24} />
            </button>

            <h3 className="text-2xl font-black font-poppins text-white mb-2 tracking-tight">{t('form.title')}</h3>
            <p className="text-white/40 text-sm font-medium mb-10 leading-relaxed">{t('form.desc')}</p>

            <form onSubmit={submitReview} className="space-y-8">
              <div>
                <label className="block text-[11px] font-black text-white/20 uppercase tracking-[0.2em] mb-4">{t('form.ratingLabel')}</label>
                <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                  <StarRating value={form.rating} onChange={v => setForm(f => ({ ...f, rating: v }))} size={28} />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-black text-white/20 uppercase tracking-[0.2em] mb-4">{t('form.contentLabel')}</label>
                <textarea
                  required
                  rows={4}
                  placeholder={t('form.contentPlaceholder')}
                  value={form.content}
                  onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 text-white text-[15px] outline-none focus:border-blue-500/50 transition-all resize-none leading-relaxed"
                />
                <div className={`text-[11px] mt-2 font-bold uppercase tracking-wider ${form.content.length < 20 ? 'text-white/20' : 'text-emerald-500'}`}>
                  {form.content.length}/500 {isRtl ? 'حرفاً' : 'characters'}
                </div>
              </div>

              <div className="bg-blue-600/10 border border-blue-500/20 rounded-2xl p-5 flex items-center gap-4">
                 <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center text-white shrink-0 shadow-lg">
                    {profile?.full_name?.[0]?.toUpperCase() || 'A'}
                 </div>
                 <div>
                    <div className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-1">{t('form.submittingAs')}</div>
                    <div className="text-[13px] font-bold text-white/80">{profile?.full_name || 'Anonymous'} · {profile?.business_name || 'EcoMate Business'}</div>
                 </div>
              </div>

              <div className="flex gap-4">
                <button type="button" onClick={() => setShowForm(false)} className="flex-1 bh2 !text-white/40">{t('form.cancel')}</button>
                <button type="submit" disabled={submitting} className="flex-1 bh1 justify-center">
                   {submitting ? t('form.submitting') : t('form.submit')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  )
}
